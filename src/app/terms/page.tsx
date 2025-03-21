import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'

const TermsPage = () => {
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
          Условия использования
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
            <h2 className="mb-3 text-xl font-semibold">1. Принятие условий</h2>
            <p>
              Используя SAMGA, вы соглашаетесь с настоящими условиями использования. Если вы не согласны с какой-либо частью условий, вы не можете использовать наш сайт.
            </p>
          </motion.section>
          
          <motion.section
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeInVariants}
          >
            <h2 className="mb-3 text-xl font-semibold">2. Использование сайта</h2>
            <p>
              Сайт SAMGA предназначен только для ознакомительных и информационных целей. Запрещается использовать сайт:
            </p>
            <ul className="list-inside list-disc pl-4 pt-2">
              <li>В противоречии с применимым законодательством</li>
              <li>Для несанкционированного доступа к данным</li>
              <li>Для деятельности, которая может навредить функционированию сайта</li>
              <li>Для распространения вредоносного программного обеспечения</li>
            </ul>
          </motion.section>
          
          <motion.section
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeInVariants}
          >
            <h2 className="mb-3 text-xl font-semibold">3. Интеллектуальная собственность</h2>
            <p>
              Все содержимое, представленное на сайте, включая тексты, графику, логотипы, изображения, а также их подборка и расположение, являются интеллектуальной собственностью соответствующих владельцев и защищены законом.
            </p>
          </motion.section>
          
          <motion.section
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeInVariants}
          >
            <h2 className="mb-3 text-xl font-semibold">4. Ограничение ответственности</h2>
            <p>
              SAMGA предоставляется «как есть» без каких-либо гарантий. Мы не несем ответственности за точность, полноту или актуальность информации на сайте. Использование информации с сайта осуществляется на ваш страх и риск.
            </p>
          </motion.section>
          
          <motion.section
            custom={5}
            initial="hidden"
            animate="visible"
            variants={fadeInVariants}
          >
            <h2 className="mb-3 text-xl font-semibold">5. Изменения в условиях использования</h2>
            <p>
              Мы оставляем за собой право изменять эти условия использования в любое время. Продолжая использовать сайт после внесения изменений, вы принимаете новые условия.
            </p>
          </motion.section>
          
          <motion.section
            custom={6}
            initial="hidden"
            animate="visible"
            variants={fadeInVariants}
          >
            <h2 className="mb-3 text-xl font-semibold">6. Связь с нами</h2>
            <p>
              Если у вас есть какие-либо вопросы об этих условиях использования, пожалуйста, свяжитесь с нами через Telegram: <a href="https://t.me/samgay_nis" target="_blank" rel="noopener" className="text-primary hover:underline">@samgay_nis</a>
            </p>
          </motion.section>
        </div>
      </motion.div>
    </div>
  )
}

export default TermsPage 