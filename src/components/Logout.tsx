'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { SignOut } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/lib/providers/ToastProvider'

interface LogoutProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  showIcon?: boolean
  buttonText?: string
  redirectPath?: string
}

export const Logout = ({
  variant = 'default',
  showIcon = true,
  buttonText = 'Выйти',
  redirectPath = '/login',
}: LogoutProps) => {
  const router = useRouter()
  const { showToast } = useToast()

  const handleLogout = () => {
    try {
      // Устанавливаем флаг, что был выполнен выход
      localStorage.setItem('samga-logout-flag', 'true')
      
      // Удаляем данные авторизации
      localStorage.removeItem('user-iin')
      localStorage.removeItem('user-password')
      
      // Сохраняем ID устройства, но помечаем как требующее повторной авторизации
      const deviceId = localStorage.getItem('samga-current-device-id')
      if (deviceId) {
        localStorage.setItem('device-needs-reauth', 'true')
      }
      
      // Показываем уведомление
      showToast('Вы успешно вышли из системы', 'info')
      
      // Переадресация на страницу входа
      setTimeout(() => {
        router.push(redirectPath)
      }, 300)
    } catch (error) {
      console.error('Ошибка при выходе:', error)
      showToast('Ошибка при выходе из системы', 'error')
    }
  }

  return (
    <Button variant={variant} onClick={handleLogout}>
      {showIcon && <SignOut className="mr-2 h-4 w-4" />}
      {buttonText}
    </Button>
  )
}

export default Logout 