'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useNFC } from '@/lib/hooks/useNFC'
import { Spinner, X } from '@phosphor-icons/react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { PhoneCall } from '@phosphor-icons/react'

type AuthData = {
  iin: string
  password: string
  deviceId: string
}

interface NFCLoginProps {
  onAuthReceived: (iin: string, password: string, deviceId: string) => void
}

const NFCLogin: React.FC<NFCLoginProps> = ({ onAuthReceived }) => {
  const { isAvailable, startReading, status, stopNFC } = useNFC()
  const [dialogOpen, setDialogOpen] = useState(false)
  
  // Обработчик события получения данных через NFC
  useEffect(() => {
    const handleAuthData = (event: Event) => {
      const customEvent = event as CustomEvent<AuthData>
      const { iin, password, deviceId } = customEvent.detail
      
      // Закрываем диалог
      setDialogOpen(false)
      
      // Вызываем функцию обратного вызова с полученными данными
      onAuthReceived(iin, password, deviceId)
    }
    
    // Добавляем слушатель события
    window.addEventListener('nfc-auth-data', handleAuthData)
    
    // Удаляем слушатель при размонтировании
    return () => {
      window.removeEventListener('nfc-auth-data', handleAuthData)
    }
  }, [onAuthReceived])
  
  // Обработчик начала сканирования NFC
  const handleStartScanning = async () => {
    setDialogOpen(true)
    await startReading()
  }
  
  // Закрытие диалога и остановка NFC
  const handleClose = () => {
    setDialogOpen(false)
    stopNFC()
  }
  
  return (
    <>
      <div className="mt-6 flex justify-center">
        <Button
          variant="outline"
          className="flex items-center"
          onClick={handleStartScanning}
          disabled={!isAvailable}
        >
          <PhoneCall className="mr-2 h-4 w-4" />
          Войти с помощью другого устройства
        </Button>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Сканирование устройства</DialogTitle>
            <DialogDescription>
              Поднесите ваш телефон к устройству, с которого хотите войти.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-6">
            {status === 'reading' && (
              <>
                <Spinner size={48} className="animate-spin text-primary" />
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Ожидание... <br />
                  Поднесите ваш телефон к другому устройству
                </p>
              </>
            )}
            
            {status === 'error' && (
              <>
                <div className="rounded-full bg-red-100 p-3">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <p className="mt-4 text-center text-sm text-red-600">
                  Произошла ошибка при сканировании.
                  <br /> Пожалуйста, попробуйте снова.
                </p>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="secondary" onClick={handleClose}>
              Отмена
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {!isAvailable && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Ваше устройство не поддерживает NFC. 
          <br />
          Эта функция доступна только в Chrome на Android-устройствах.
        </p>
      )}
    </>
  )
}

export default NFCLogin 