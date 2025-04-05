'use client'

import React from 'react'
import AuthForm from '@/widgets/login/AuthForm'
import Logo from '@/components/misc/Logo'
import { env } from '@/env'
import NFCLogin from '@/components/NFCLogin'
import { useRouter } from 'next-nprogress-bar'
import { useToast } from '@/lib/providers/ToastProvider'
import { login } from '@/server/actions/login'

const Page = () => {
  const router = useRouter()
  const { showToast } = useToast()
  
  // Обработчик получения данных аутентификации через NFC
  const handleAuthReceived = async (iin: string, password: string, deviceId: string) => {
    // Сохраняем ID устройства и учетные данные
    try {
      // Очищаем ИИН от лишних символов
      const cleanIin = iin?.replace(/\D/g, '').trim();
      
      // Проверяем формат и длину ИИН, но с обходом для специальных случаев
      const isLegacyFormat = password?.includes('legacy_token') || 
                             cleanIin?.includes('eniapp') || 
                             password?.length > 30;
      
      if (!isLegacyFormat && (!cleanIin || cleanIin.length !== 12 || !/^\d+$/.test(cleanIin))) {
        showToast('Ошибка: ИИН должен содержать 12 цифр', 'error')
        console.log('Неверный формат ИИН:', cleanIin);
        return
      }
      
      // Проверка пароля только для обычных случаев
      if (!isLegacyFormat && (!password || password.length < 4)) {
        showToast('Ошибка: Пароль слишком короткий', 'error')
        return
      }
      
      localStorage.setItem('samga-current-device-id', deviceId || `device-${Date.now()}`)
      localStorage.setItem('user-iin', cleanIin || iin)
      localStorage.setItem('user-password', password)
      
      showToast('Выполняется вход...', 'info')
      
      // Выполняем вход
      const result = await login(cleanIin || iin, password)
      if (result.success) {
        showToast('Вход выполнен успешно', 'success')
        router.push('/')
      } else {
        // Для старых форматов - повторная попытка с исходными данными
        if (isLegacyFormat && cleanIin !== iin) {
          const legacyResult = await login(iin, password);
          if (legacyResult.success) {
            showToast('Вход выполнен успешно', 'success')
            router.push('/')
            return;
          }
        }
        
        const errorMessage = result.errors?.password || result.errors?.iin || 'Неверные данные аутентификации'
        showToast(`Ошибка при входе: ${errorMessage}`, 'error')
        
        // Log for debugging purposes
        console.log('Ошибка входа с данными:', { iin, cleanIin, deviceId, errorDetails: result.errors })
      }
    } catch (e) {
      console.error('Ошибка при обработке аутентификации:', e)
      showToast('Не удалось выполнить вход. Проверьте соединение с сервером.', 'error')
    }
  }
  
  return (
    <div className="items-left mx-auto flex h-screen max-w-96 flex-col justify-center p-4 text-left page-transition">
      <div className="mb-6 flex items-center">
        <Logo width={48} height={48} className="mr-3" withText={true} />
      </div>
      
      <h2 className="w-full scroll-m-20 text-left text-3xl font-semibold leading-none tracking-tight first:mt-0">
        Вход
      </h2>

      <p className="w-full text-left leading-7 text-muted-foreground">
        Используйте свой аккаунт СУШ
      </p>

      <AuthForm />
      
      <NFCLogin onAuthReceived={handleAuthReceived} />
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <a href={env.NEXT_PUBLIC_CONTACT_LINK} target="_blank" rel="noopener" className="hover:text-primary transition-colors">
          Создано qynon
        </a>
      </div>
    </div>
  )
}

export default Page
