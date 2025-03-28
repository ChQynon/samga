import { Hono } from 'hono'
import authMiddleware from '@/server/middleware/auth'
import { decode } from '@/lib/token/jwt'
import { Userinfo } from '@/shared/types'
import { getAdditionalUserInfo } from '@/features/getAdditionalUserInfo'
import { Session } from '@/lib/token/resolver'
import { getJournal } from '@/features/getJournal'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { getJournalElement } from '@/features/getJournalElement'
import { isAxiosError } from 'axios'
import { getReports } from '@/features/getReports'

// Простой кэш для хранения результатов отчетов
const reportsCache = new Map()
// Время жизни кэша - 60 минут
const CACHE_TTL = 60 * 60 * 1000

const app = new Hono<{
  Variables: {
    session: Session
  }
}>()

app.use(async (c, next) => authMiddleware(c, next))

app.get('/contingent', async (c) => {
  const rawUserInfo = await decode<{ UserInfo: string }>(
    c.get('session').accessToken,
  )

  const { FirstName, SecondName } = JSON.parse(rawUserInfo.UserInfo) as Userinfo

  const data = await getAdditionalUserInfo(c.get('session').accessToken)

  return c.json({
    ...data,
    firstName: FirstName,
    lastName: SecondName,
  })
})

app.get('/journal', async (c) => {
  const session = c.get('session')
  const journal = await getJournal(session.accessToken, session.city)

  return c.json(journal)
})

app.get('/journal/:subject', async (c) => {
  const session = c.get('session')
  const subjectId = c.req.param('subject')
  const quarter = z.coerce
    .number()
    .min(1)
    .max(4)
    .safeParse(c.req.query('quarter'))

  if (!quarter.success) {
    throw new HTTPException(400, {
      res: Response.json({
        message: 'Bad request',
        cause: 'Quarter index (quarter search param) is required',
      }),
    })
  }

  try {
    const data = await getJournalElement(
      session.accessToken,
      session.city,
      subjectId,
      quarter.data,
    )

    return c.json(data)
  } catch (e) {
    if (
      isAxiosError(e) &&
      e.response?.data.message.startsWith('предмет не найден')
    ) {
      throw new HTTPException(404, {
        res: Response.json({
          message: 'Not found',
          cause: 'Subject with id ' + subjectId + ' not found',
        }),
      })
    } else
      throw new HTTPException(503, {
        res: Response.json(
          {
            message: 'Service unavailable',
            cause: 'AEO NIS microservices are currently unavailable / down',
          },
          {
            status: 503,
          },
        ),
      })
  }
})

app.get('/reports', async (c) => {
  const { accessToken } = c.get('session')
  
  // Извлекаем информацию о пользователе для создания ключа кэша
  try {
    // Создаем уникальный ключ для кэша
    const { UserInfo: stringifiedUserInfo } = await decode<{ UserInfo: string }>(accessToken)
    const { PersonGid: studentId } = JSON.parse(stringifiedUserInfo) as Userinfo
    const cacheKey = `reports_${studentId}`
    
    // Проверяем наличие данных в кэше
    if (reportsCache.has(cacheKey)) {
      const cachedData = reportsCache.get(cacheKey)
      
      // Проверяем не истек ли срок действия кэша
      if (Date.now() - cachedData.timestamp < CACHE_TTL) {
        console.log('Отдаю табель из кэша')
        return c.json(cachedData.data)
      }
      
      // Если срок истек, удаляем запись из кэша
      reportsCache.delete(cacheKey)
    }
    
    // Если в кэше нет данных или они устарели, делаем запрос к API
    console.log('Получаю новые данные табеля')
    const reports = await getReports(accessToken)
    
    // Сохраняем результат в кэш
    reportsCache.set(cacheKey, {
      data: reports,
      timestamp: Date.now()
    })
    
    // Устанавливаем заголовки кэширования
    c.header('Cache-Control', 'private, max-age=3600')
    
    return c.json(reports)
  } catch (e) {
    console.log(e)

    throw new HTTPException(503, {
      res: Response.json(
        {
          message: 'Service unavailable',
          cause: 'AEO NIS microservices are currently unavailable / down',
        },
        {
          status: 503,
        },
      ),
    })
  }
})

export default app
