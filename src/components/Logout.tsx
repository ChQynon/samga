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
      // Упрощенный процесс выхода без задержек
      localStorage.setItem('samga-logout-flag', 'true')
      localStorage.setItem('samga-fast-reauth', 'true')
      
      // Мгновенное уведомление
      showToast('Выполняется выход...', 'info')
      
      // Немедленное перенаправление
      window.location.href = redirectPath
    } catch (error) {
      console.error('Ошибка при выходе:', error)
      showToast('Ошибка при выходе из системы', 'error')
      
      // Запасной вариант при ошибке
      setTimeout(() => {
        window.location.href = redirectPath
      }, 100)
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