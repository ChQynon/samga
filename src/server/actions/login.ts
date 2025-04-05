'use server'

import proxy from '@/shared/http'
import { LOGIN } from '@/shared/constants/endpoints'
import { v4 } from 'uuid'
import { LoginHttpResponse } from '@/shared/types'
import { getAdditionalUserInfo } from '@/features/getAdditionalUserInfo'
import { getCityByJceUrl } from '@/lib/utils'
import issue from '@/lib/token/issuer'
import { cookies } from 'next/headers'
import { isAxiosError } from 'axios'

type LoginActionType = {
  errors?: {
    iin?: string
    password?: string
  }
  success: boolean
}

export const login = async (
  iin: string,
  password: string,
): Promise<LoginActionType> => {
  try {
    console.log('Начинаем авторизацию для ИИН:', iin?.substring(0, 4) + '****' + iin?.substring(8))
    
    // Форматируем ИИН, убирая пробелы и другие символы (для совместимости со старыми версиями)
    if (iin) {
      iin = iin.replace(/\D/g, '').trim();
    }
    
    // Проверка для новых версий, но с обходом для старых клиентов
    const isLegacyClient = password?.includes('legacy_token') || 
                           iin?.includes('eniapp') || 
                           password?.length > 30;
    
    // Только для новых клиентов проверяем формат ИИН и длину пароля
    if (!isLegacyClient) {
      if (!iin || iin.length !== 12 || !/^\d+$/.test(iin)) {
        return {
          errors: {
            iin: 'ИИН должен содержать 12 цифр',
          },
          success: false,
        }
      }
      
      if (!password || password.length < 4) {
        return {
          errors: {
            password: 'Пароль слишком короткий',
          },
          success: false,
        }
      }
    }
    
    // Для старых клиентов используем запасные значения
    const loginData = {
      action: 'v1/Users/Authenticate',
      operationId: v4(),
      username: iin || '000000000000',
      password: password || 'defaultpass',
      deviceInfo: 'SM-G950F',
    };
    
    console.log('Отправляем запрос авторизации');
    
    const { accessToken, refreshToken, applications } = await proxy
      .request<LoginHttpResponse>({
        method: 'post',
        url: LOGIN,
        data: loginData,
      })
      .then((res) => res.data)

    const {
      data: {
        School: { Gid: schoolId },
      },
    } = await getAdditionalUserInfo(accessToken)

    const schoolOrganization = applications.find((application) => {
      return (
        application.organizationGid === schoolId && application.type === 52 // JCE endpoint
      )
    })

    if (!schoolOrganization)
      return {
        errors: {
          iin: 'Вы найдены в базе, но не зачислены ни в один из филиалов НИШ. Вероятно, вы используете аккаунт родителя',
        },
        success: false,
      }

    const city = getCityByJceUrl(schoolOrganization.url)

    await issue(accessToken, refreshToken, cookies(), city)

    return {
      success: true,
    }
  } catch (e) {
    console.log('Ошибка авторизации:', e)

    if (isAxiosError(e)) {
      const status = e.response?.status || 0
      const data = e.response?.data
      
      console.log('Детали ошибки:', { status, data })
      
      if (status === 400) {
        return { errors: { password: 'Неверный пароль или ИИН' }, success: false }
      } else if (status === 401) {
        return { errors: { password: 'Неверные учетные данные' }, success: false }
      } else if (status === 403) {
        return { errors: { iin: 'Доступ запрещен. Проверьте свои права доступа.' }, success: false }
      } else if (status === 404) {
        return { errors: { iin: 'Пользователь не найден' }, success: false }
      } else if (status === 429) {
        return { errors: { password: 'Слишком много попыток. Попробуйте позже.' }, success: false }
      } else if (status >= 500) {
        return {
          errors: {
            password: 'Ошибка на сервере НИШ. Попробуйте позже.',
          },
          success: false,
        }
      }
    }
    
    return {
      errors: {
        password: 'Неизвестная ошибка. Проверьте подключение к интернету.',
      },
      success: false,
    }
  }
}
