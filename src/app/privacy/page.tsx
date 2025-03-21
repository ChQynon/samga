import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'

const PrivacyPage = () => {
  const fadeInVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.3,
        ease: 'easeOut',
      }
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mx-auto max-w-3xl"
      >
        <Link href="/">
          <Button variant="ghost" className="mb-4">← Вернуться на главную</Button>
        </Link>
        
        <motion.h1 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6 text-3xl font-bold"
        >
          Политика конфиденциальности
        </motion.h1>
        
        <div className="space-y-6 text-muted-foreground">
          <motion.p
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeInVariants}
          >
            Последнее обновление: {new Date().toLocaleDateString()}
          </motion.p>
          
          <motion.section
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeInVariants}
          >
            <h2 className="mb-3 text-xl font-semibold">1. Собираемая информация</h2>
            <p>
              SAMGA не собирает личные данные пользователей. Мы не используем cookies для отслеживания вашей активности. Сайт предназначен для просмотра публичной информации об учебных целях и табелях успеваемости.
            </p>
          </motion.section>
          
          <motion.section
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeInVariants}
          >
            <h2 className="mb-3 text-xl font-semibold">2. Использование информации</h2>
            <p>
              Вся информация, представленная на сайте, предназначена исключительно для ознакомительных целей. Мы не передаем никакие данные третьим лицам.
            </p>
          </motion.section>
          
          <motion.section
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeInVariants}
          >
            <h2 className="mb-3 text-xl font-semibold">3. Защита информации</h2>
            <p>
              Мы принимаем соответствующие меры для защиты всей информации от несанкционированного доступа, изменения, раскрытия или уничтожения.
            </p>
          </motion.section>
          
          <motion.section
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeInVariants}
          >
            <h2 className="mb-3 text-xl font-semibold">4. Изменения в политике конфиденциальности</h2>
            <p>
              Мы можем обновлять нашу политику конфиденциальности время от времени. Мы уведомим вас о любых изменениях, разместив новую политику конфиденциальности на этой странице.
            </p>
          </motion.section>
          
          <motion.section
            custom={5}
            initial="hidden"
            animate="visible"
            variants={fadeInVariants}
          >
            <h2 className="mb-3 text-xl font-semibold">5. Связь с нами</h2>
            <p>
              Если у вас есть какие-либо вопросы об этой политике конфиденциальности, пожалуйста, свяжитесь с нами через Telegram: <a href="https://t.me/samgay_nis" target="_blank" rel="noopener" className="text-primary hover:underline">@samgay_nis</a>
            </p>
          </motion.section>
        </div>
      </motion.div>
    </div>
  )
}

export default PrivacyPage 