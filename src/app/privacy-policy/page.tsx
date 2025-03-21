'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const PrivacyPolicyPage = () => {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link href="/">
          <Button variant="ghost" className="mb-4 flex items-center gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Вернуться на главную
          </Button>
        </Link>

        <h1 className="mb-6 text-3xl font-bold">Политика конфиденциальности</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <p>
            Последнее обновление: Май 2024
          </p>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Введение</h2>
            <p>
              Добро пожаловать на samga.nis. Мы уважаем вашу конфиденциальность и стремимся защитить ваши личные данные. 
              Эта политика конфиденциальности объясняет, как мы собираем, используем и защищаем информацию, которую вы предоставляете при использовании нашего сайта.
            </p>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. Сбор информации</h2>
            <p>
              Мы собираем только минимально необходимую информацию для обеспечения работы нашего сервиса. 
              Мы можем собирать личные данные, такие как ваше имя, адрес электронной почты и другую контактную информацию, 
              только если вы добровольно предоставляете их нам.
            </p>
            <p>
              Мы также автоматически собираем некоторую техническую информацию, такую как IP-адрес, тип браузера, 
              устройство и операционная система, для улучшения нашего сервиса и обеспечения безопасности.
            </p>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. Использование информации</h2>
            <p>
              Мы используем собранную информацию для:
            </p>
            <ul className="list-inside list-disc space-y-2 pl-4">
              <li>Предоставления, поддержки и улучшения наших услуг</li>
              <li>Ответа на ваши запросы и обращения</li>
              <li>Отправки вам важных уведомлений</li>
              <li>Анализа использования нашего сайта для улучшения пользовательского опыта</li>
              <li>Обеспечения безопасности нашего сайта</li>
            </ul>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Защита данных</h2>
            <p>
              Мы применяем соответствующие меры безопасности для защиты ваших данных от несанкционированного доступа, 
              изменения, раскрытия или уничтожения. Мы регулярно обновляем наши системы безопасности и 
              следуем лучшим практикам в области защиты данных.
            </p>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. Хранение данных</h2>
            <p>
              Мы храним ваши данные только до тех пор, пока это необходимо для предоставления запрошенных вами услуг 
              или до тех пор, пока у нас есть законное основание для их хранения.
            </p>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">6. Ваши права</h2>
            <p>
              В соответствии с законодательством о защите данных, вы имеете право:
            </p>
            <ul className="list-inside list-disc space-y-2 pl-4">
              <li>Получать доступ к своим данным</li>
              <li>Исправлять свои данные</li>
              <li>Удалять свои данные</li>
              <li>Ограничивать обработку своих данных</li>
              <li>Возражать против обработки своих данных</li>
              <li>Переносить свои данные</li>
            </ul>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">7. Изменения в политике конфиденциальности</h2>
            <p>
              Мы можем обновлять эту политику конфиденциальности время от времени. Мы рекомендуем периодически проверять 
              эту страницу для ознакомления с возможными изменениями. Изменения вступают в силу сразу после их публикации 
              на этой странице.
            </p>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">8. Контактная информация</h2>
            <p>
              Если у вас есть вопросы или предложения относительно нашей политики конфиденциальности, 
              пожалуйста, не стесняйтесь обращаться к нам через Telegram канал или по email.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  )
}

export default PrivacyPolicyPage 