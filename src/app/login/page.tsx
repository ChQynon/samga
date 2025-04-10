'use server'

import React from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getVerified } from '@/server/actions/login'
import LoginForm from '@/components/LoginForm'
import Logo from '@/components/misc/Logo'
import NFCLogin from '@/components/NFCLogin'
import QRLogin from '@/components/QRLogin'
import { env } from '@/env'

export default async function LoginPage() {
  const token = cookies().get('user_token')
  
  if (token && await getVerified()) {
    redirect('/dash')
  }
  
  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
        <div className="flex flex-col space-y-2 text-center mb-4">
          <div className="flex items-center justify-center mb-1">
            <Logo className="mr-2" width={40} height={40} />
            <div className="flex flex-col items-start">
              <h2 className="text-[#1e9de3] text-2xl font-semibold">samga.nis</h2>
              <p className="text-xs text-gray-500">Взлетай к знаниям!</p>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight text-left pl-1">
            Вход
          </h1>
          <p className="text-sm text-muted-foreground text-left pl-1">
            Используйте свой аккаунт СУШ
          </p>
        </div>
        
        <div className="grid gap-6">
          <LoginForm />

          <div className="flex justify-center">
            <button className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor" />
              </svg>
              Войти с помощью другого устройства
            </button>
          </div>
          
          <p className="text-center text-xs text-gray-500">
            Войдите, используя учетные данные с другого устройства.
            <br />
            NFC не поддерживается на этом устройстве, но можно использовать QR-код.
          </p>
        </div>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <a href={env.NEXT_PUBLIC_CONTACT_LINK} target="_blank" rel="noopener" className="text-gray-400 hover:text-gray-600 transition-colors">
            Создано qynon
          </a>
        </div>
      </div>
    </div>
  )
}
