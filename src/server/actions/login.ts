'use server'

import proxy from '@/shared/http'
import { LOGIN } from '@/shared/constants/endpoints'
import { v4 } from 'uuid'
import { LoginHttpResponse } from '@/shared/types'
import { getAdditionalUserInfo } from '@/features/getAdditionalUserInfo'
import { getCityByJceUrl } from '@/lib/utils'
import issue from '@/lib/token/issuer'
import { cookies } from 'next/headers'
import { isAxiosError } from 'axios'
import { env } from '@/env'

type LoginActionType = {
  errors?: {
    iin?: string
    password?: string
  }
  success: boolean
}

// Заглушка для функции верификации
export async function getVerified(): Promise<boolean> {
  const token = cookies().get('user_token')
  return !!token
}

// Заглушка для функции входа
export async function login(iin: string, password: string): Promise<LoginActionType> {
  try {
    // В реальном приложении здесь была бы проверка логина через API
    // Здесь мы просто создаем фейковый токен для демонстрации
    const token = `demo_token_${Date.now()}`
    
    // Устанавливаем куки с токеном сессии
    cookies().set('user_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 дней
    })
    
    return { success: true }
  } catch (error) {
    console.error('Ошибка аутентификации:', error)
    return { 
      success: false, 
      errors: { 
        auth: 'Ошибка аутентификации'
      } 
    }
  }
}
