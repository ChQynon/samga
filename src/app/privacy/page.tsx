import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'

const PrivacyPage = () => {
  // Определяем анимации в соответствии с другими страницами
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        damping: 25, 
        stiffness: 200 
      }
    }
  };

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="mx-auto max-w-3xl"
        variants={fadeInVariants}
      >
        <motion.div variants={fadeInUpVariants}>
          <Link href="/">
            <Button variant="ghost" className="mb-4">← Вернуться на главную</Button>
          </Link>
        </motion.div>
        
        <motion.h1 
          variants={fadeInUpVariants}
          className="mb-6 text-3xl font-bold"
        >
          Политика конфиденциальности
        </motion.h1>
        
        <div className="space-y-6 text-muted-foreground">
          <motion.p variants={fadeInUpVariants}>
            Последнее обновление: {new Date().toLocaleDateString()}
          </motion.p>
          
          <motion.section variants={fadeInUpVariants}>
            <h2 className="mb-3 text-xl font-semibold">1. Собираемая информация</h2>
            <p>
              SAMGA не собирает личные данные пользователей. Мы не используем cookies для отслеживания вашей активности. Сайт предназначен для просмотра публичной информации об учебных целях и табелях успеваемости.
            </p>
          </motion.section>
          
          <motion.section variants={fadeInUpVariants}>
            <h2 className="mb-3 text-xl font-semibold">2. Использование информации</h2>
            <p>
              Вся информация, представленная на сайте, предназначена исключительно для ознакомительных целей. Мы не передаем никакие данные третьим лицам.
            </p>
          </motion.section>
          
          <motion.section variants={fadeInUpVariants}>
            <h2 className="mb-3 text-xl font-semibold">3. Защита информации</h2>
            <p>
              Мы принимаем соответствующие меры для защиты всей информации от несанкционированного доступа, изменения, раскрытия или уничтожения.
            </p>
          </motion.section>
          
          <motion.section variants={fadeInUpVariants}>
            <h2 className="mb-3 text-xl font-semibold">4. Изменения в политике конфиденциальности</h2>
            <p>
              Мы можем обновлять нашу политику конфиденциальности время от времени. Мы уведомим вас о любых изменениях, разместив новую политику конфиденциальности на этой странице.
            </p>
          </motion.section>
          
          <motion.section variants={fadeInUpVariants}>
            <h2 className="mb-3 text-xl font-semibold">5. Связь с нами</h2>
            <p>
              Если у вас есть какие-либо вопросы об этой политике конфиденциальности, пожалуйста, свяжитесь с нами через Telegram: <a href="https://t.me/samgay_nis" target="_blank" rel="noopener" className="text-primary hover:underline">@samgay_nis</a>
            </p>
          </motion.section>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default PrivacyPage 