import React from 'react'
import { metadata as baseMetadata } from '../layout'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'

export const metadata = {
  ...baseMetadata,
  title: 'Политика конфиденциальности | SAMGA',
}

const PrivacyPage = () => {
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
        
        <h1 className="mb-6 text-3xl font-bold">Политика конфиденциальности</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <p>
            Последнее обновление: {new Date().toLocaleDateString()}
          </p>
          
          <section>
            <h2 className="mb-3 text-xl font-semibold">1. Собираемая информация</h2>
            <p>
              SAMGA не собирает личные данные пользователей. Мы не используем cookies для отслеживания вашей активности. Сайт предназначен для просмотра публичной информации об учебных целях и табелях успеваемости.
            </p>
          </section>
          
          <section>
            <h2 className="mb-3 text-xl font-semibold">2. Использование информации</h2>
            <p>
              Вся информация, представленная на сайте, предназначена исключительно для ознакомительных целей. Мы не передаем никакие данные третьим лицам.
            </p>
          </section>
          
          <section>
            <h2 className="mb-3 text-xl font-semibold">3. Защита информации</h2>
            <p>
              Мы принимаем соответствующие меры для защиты всей информации от несанкционированного доступа, изменения, раскрытия или уничтожения.
            </p>
          </section>
          
          <section>
            <h2 className="mb-3 text-xl font-semibold">4. Изменения в политике конфиденциальности</h2>
            <p>
              Мы можем обновлять нашу политику конфиденциальности время от времени. Мы уведомим вас о любых изменениях, разместив новую политику конфиденциальности на этой странице.
            </p>
          </section>
          
          <section>
            <h2 className="mb-3 text-xl font-semibold">5. Связь с нами</h2>
            <p>
              Если у вас есть какие-либо вопросы об этой политике конфиденциальности, пожалуйста, свяжитесь с нами через Telegram: <a href="https://t.me/samgay_nis" target="_blank" rel="noopener" className="text-primary hover:underline">@samgay_nis</a>
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  )
}

export default PrivacyPage 