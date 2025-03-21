import React from 'react'
import { metadata as baseMetadata } from '../layout'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'

export const metadata = {
  ...baseMetadata,
  title: 'Правовая информация | SAMGA',
}

const DisclaimerPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl"
      >
        <Link href="/">
          <Button variant="ghost" className="mb-4">← Вернуться на главную</Button>
        </Link>
        
        <h1 className="mb-6 text-3xl font-bold">Правовая информация</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <p>
            Последнее обновление: {new Date().toLocaleDateString()}
          </p>
          
          <section>
            <h2 className="mb-3 text-xl font-semibold">Отказ от связи с АОО "Назарбаев Интеллектуальные школы"</h2>
            <p>
              Сайт SAMGA (samga.nis) является независимым проектом и не имеет официальной связи с <a href="https://www.nis.edu.kz/" target="_blank" rel="noopener" className="text-primary hover:underline">АОО "Назарбаев Интеллектуальные школы"</a>. Настоящий сайт разработан и поддерживается независимыми разработчиками.
            </p>
            <p className="mt-2">
              Мы не претендуем на официальное представление или одобрение со стороны АОО "Назарбаев Интеллектуальные школы". Любые товарные знаки, логотипы или другие элементы интеллектуальной собственности, принадлежащие АОО "Назарбаев Интеллектуальные школы", используются исключительно в информационных целях и являются собственностью их соответствующих владельцев.
            </p>
          </section>
          
          <section>
            <h2 className="mb-3 text-xl font-semibold">Цель проекта</h2>
            <p>
              Сайт SAMGA создан с образовательной целью для предоставления удобного доступа к информации об учебных целях и табелях успеваемости. Мы стремимся обеспечить удобную платформу для учащихся и их родителей.
            </p>
          </section>
          
          <section>
            <h2 className="mb-3 text-xl font-semibold">Отказ от ответственности</h2>
            <p>
              Информация, представленная на этом сайте, предоставляется «как есть», без каких-либо гарантий, явных или подразумеваемых. Мы не несем ответственности за точность, полноту, актуальность или надежность любой информации, доступной на этом сайте.
            </p>
            <p className="mt-2">
              Пользователи сайта используют предоставленную информацию на свой страх и риск. Мы не несем ответственности за любые прямые, косвенные, случайные, особые или штрафные убытки, возникшие в результате доступа к сайту или его использования.
            </p>
          </section>
          
          <section>
            <h2 className="mb-3 text-xl font-semibold">Изменения</h2>
            <p>
              Мы оставляем за собой право вносить изменения в правовую информацию в любое время без предварительного уведомления. Продолжая использовать сайт после внесения изменений, вы соглашаетесь с новыми условиями.
            </p>
          </section>
          
          <section>
            <h2 className="mb-3 text-xl font-semibold">Связь с нами</h2>
            <p>
              Если у вас есть вопросы или предложения относительно нашей правовой информации, пожалуйста, свяжитесь с нами через Telegram: <a href="https://t.me/samgay_nis" target="_blank" rel="noopener" className="text-primary hover:underline">@samgay_nis</a>
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  )
}

export default DisclaimerPage 