'use server'

import { cookies } from 'next/headers'
import { env } from '@/env'

type LoginActionType = {
  errors?: {
    iin?: string
    password?: string
    general?: string
  }
  success: boolean
}

// Функция для проверки авторизации
export async function getVerified(): Promise<boolean> {
  const token = cookies().get('user_token')
  return !!token
}

// Функция логина с имитацией проверки учетных данных
export async function login(iin: string, password: string): Promise<LoginActionType> {
  try {
    console.log(`Попытка входа с логином: ${iin}`)
    
    // Проверка формата ИИН (12 цифр) или логина
    if (!iin || iin.trim() === '') {
      return {
        success: false,
        errors: { iin: 'Логин не может быть пустым' }
      }
    }
    
    // Проверка пароля
    if (!password || password.length < 4) {
      return {
        success: false,
        errors: { password: 'Пароль должен содержать не менее 4 символов' }
      }
    }
    
    // Демо-режим: принимаем любые корректные учетные данные
    const token = `demo_token_${Date.now()}_${iin}`
    
    // Устанавливаем куки с токеном сессии
    cookies().set('user_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 дней
    })
    
    // Добавляем задержку для имитации запроса к серверу
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return { success: true }
  } catch (error) {
    console.error('Ошибка аутентификации:', error)
    return { 
      success: false, 
      errors: { 
        general: 'Ошибка аутентификации. Пожалуйста, попробуйте позже.'
      } 
    }
  }
}
