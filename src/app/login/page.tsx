'use client'

import React from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getVerified } from '@/server/actions/login'
import LoginForm from '@/components/LoginForm'
import Logo from '@/components/misc/Logo'
import NFCLogin from '@/components/NFCLogin'
import QRLogin from '@/components/QRLogin'
import { env } from '@/env'
import { useRouter } from 'next-nprogress-bar'
import { useToast } from '@/lib/providers/ToastProvider'
import { login } from '@/server/actions/login'

export default async function LoginPage() {
  const token = cookies().get('user_token')
  
  if (token && await getVerified()) {
    redirect('/dash')
  }
  
  const router = useRouter()
  const { showToast } = useToast()
  
  // Обработчик получения данных аутентификации через NFC
  const handleAuthReceived = async (iin: string, password: string, deviceId: string) => {
    // Сохраняем ID устройства и учетные данные
    try {
      localStorage.setItem('samga-current-device-id', deviceId || `device-${Date.now()}`)
      localStorage.setItem('user-iin', iin)
      localStorage.setItem('user-password', password)
      
      showToast('Выполняется вход...', 'info')
      
      // Выполняем вход
      const result = await login(iin, password)
      if (result.success) {
        showToast('Вход выполнен успешно через NFC', 'success')
        router.push('/')
      } else {
        showToast('Ошибка при входе: неверные данные аутентификации', 'error')
      }
    } catch (e) {
      console.error('Ошибка при обработке аутентификации через NFC:', e)
      showToast('Не удалось выполнить вход', 'error')
    }
  }
  
  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Logo className="mx-auto" width={80} height={80} />
          <h1 className="text-2xl font-semibold tracking-tight">
            Вход в SAMGA
          </h1>
          <p className="text-sm text-muted-foreground">
            Введите логин и пароль от своей учетной записи
          </p>
        </div>
        
        <div className="grid gap-6">
          <LoginForm />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Или войдите с помощью
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <QRLogin />
            <NFCLogin onAuthReceived={handleAuthReceived} />
          </div>
        </div>
        
        <p className="px-6 text-center text-sm text-muted-foreground">
          Используя наше приложение, вы соглашаетесь с 
          <a 
            href="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            {' '}условиями использования
          </a>
        </p>
      </div>
    </div>
  )
}
