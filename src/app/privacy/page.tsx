import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const PrivacyPage = () => {
  const [headerVisible, setHeaderVisible] = useState(false)
  const [sectionsVisible, setSectionsVisible] = useState(false)
  const [footerVisible, setFooterVisible] = useState(false)
  
  useEffect(() => {
    const headerTimer = setTimeout(() => setHeaderVisible(true), 100)
    const sectionsTimer = setTimeout(() => setSectionsVisible(true), 300)
    const footerTimer = setTimeout(() => setFooterVisible(true), 600)
    
    return () => {
      clearTimeout(headerTimer)
      clearTimeout(sectionsTimer)
      clearTimeout(footerTimer)
    }
  }, [])
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div 
          className={`transition-all duration-500 transform ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Link href="/">
            <Button variant="ghost" className="mb-4">← Вернуться на главную</Button>
          </Link>
          
          <h1 className="mb-6 text-3xl font-bold">
            Политика конфиденциальности
          </h1>
        </div>
        
        <div 
          className={`space-y-6 transition-all duration-700 delay-100 transform ${
            sectionsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="rounded-lg border bg-card p-6 transition-all duration-500 hover:shadow-md">
            <h2 className="mb-3 text-xl font-semibold">Сбор данных</h2>
            <p className="text-muted-foreground">
              Приложение SAMGA собирает только те данные, которые необходимы для обеспечения 
              функциональности приложения. Мы не передаем ваши данные третьим лицам без вашего 
              явного согласия.
            </p>
          </div>
          
          <div className="rounded-lg border bg-card p-6 transition-all duration-500 hover:shadow-md">
            <h2 className="mb-3 text-xl font-semibold">Хранение данных</h2>
            <p className="text-muted-foreground">
              Мы храним минимально необходимый объем данных для работы приложения. 
              Данные хранятся в зашифрованном виде и с соблюдением современных стандартов 
              безопасности.
            </p>
          </div>
          
          <div className="rounded-lg border bg-card p-6 transition-all duration-500 hover:shadow-md">
            <h2 className="mb-3 text-xl font-semibold">Cookies и технологии отслеживания</h2>
            <p className="text-muted-foreground">
              Приложение SAMGA использует cookies и подобные технологии для улучшения 
              пользовательского опыта. Вы можете отключить cookies в настройках вашего 
              браузера, но это может повлиять на функциональность приложения.
            </p>
          </div>
        </div>
        
        <div 
          className={`mt-10 text-center transition-all duration-700 delay-200 transform ${
            footerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-sm text-muted-foreground">
            Используя приложение SAMGA, вы соглашаетесь с нашей политикой конфиденциальности.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Последнее обновление: Март 2023
          </p>
          
          <div className="mt-6">
            <Link href="/">
              <Button>Вернуться на главную</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPage 