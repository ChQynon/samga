import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'

const DisclaimerPage = () => {
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
          Правовая информация
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
            <h2 className="mb-3 text-xl font-semibold">Отказ от связи с АОО "Назарбаев Интеллектуальные школы"</h2>
            <p>
              Сайт SAMGA (samga.nis) является независимым проектом и не имеет официальной связи с <a href="https://www.nis.edu.kz/" target="_blank" rel="noopener" className="text-primary hover:underline">АОО "Назарбаев Интеллектуальные школы"</a>. Настоящий сайт разработан и поддерживается независимыми разработчиками.
            </p>
            <p className="mt-2">
              Мы не претендуем на официальное представление или одобрение со стороны АОО "Назарбаев Интеллектуальные школы". Любые товарные знаки, логотипы или другие элементы интеллектуальной собственности, принадлежащие АОО "Назарбаев Интеллектуальные школы", используются исключительно в информационных целях и являются собственностью их соответствующих владельцев.
            </p>
          </motion.section>
          
          <motion.section
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeInVariants}
          >
            <h2 className="mb-3 text-xl font-semibold">Цель проекта</h2>
            <p>
              Сайт SAMGA создан с образовательной целью для предоставления удобного доступа к информации об учебных целях и табелях успеваемости. Мы стремимся обеспечить удобную платформу для учащихся и их родителей.
            </p>
          </motion.section>
          
          <motion.section
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeInVariants}
          >
            <h2 className="mb-3 text-xl font-semibold">Отказ от ответственности</h2>
            <p>
              Информация, представленная на этом сайте, предоставляется «как есть», без каких-либо гарантий, явных или подразумеваемых. Мы не несем ответственности за точность, полноту, актуальность или надежность любой информации, доступной на этом сайте.
            </p>
            <p className="mt-2">
              Пользователи сайта используют предоставленную информацию на свой страх и риск. Мы не несем ответственности за любые прямые, косвенные, случайные, особые или штрафные убытки, возникшие в результате доступа к сайту или его использования.
            </p>
          </motion.section>
          
          <motion.section
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeInVariants}
          >
            <h2 className="mb-3 text-xl font-semibold">Изменения</h2>
            <p>
              Мы оставляем за собой право вносить изменения в правовую информацию в любое время без предварительного уведомления. Продолжая использовать сайт после внесения изменений, вы соглашаетесь с новыми условиями.
            </p>
          </motion.section>
          
          <motion.section
            custom={5}
            initial="hidden"
            animate="visible"
            variants={fadeInVariants}
          >
            <h2 className="mb-3 text-xl font-semibold">Связь с нами</h2>
            <p>
              Если у вас есть вопросы или предложения относительно нашей правовой информации, пожалуйста, свяжитесь с нами через Telegram: <a href="https://t.me/samgay_nis" target="_blank" rel="noopener" className="text-primary hover:underline">@samgay_nis</a>
            </p>
          </motion.section>
        </div>
      </motion.div>
    </div>
  )
}

export default DisclaimerPage 