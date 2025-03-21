'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useNFC } from '@/lib/hooks/useNFC'
import { Spinner, X, QrCode } from '@phosphor-icons/react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { PhoneCall } from '@phosphor-icons/react'
import QrScanner from 'react-qr-scanner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
  const [activeTab, setActiveTab] = useState<string>(isAvailable ? 'nfc' : 'qr')
  const [scanError, setScanError] = useState<string | null>(null)
  
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
  
  // Обработчик начала сканирования
  const handleStartScanning = async () => {
    setDialogOpen(true)
    setScanError(null)
    
    if (isAvailable && activeTab === 'nfc') {
      await startReading()
    }
  }
  
  // Закрытие диалога и остановка NFC
  const handleClose = () => {
    setDialogOpen(false)
    if (isAvailable) {
      stopNFC()
    }
  }
  
  // Обработчик успешного сканирования QR-кода
  const handleQrScan = (data: any) => {
    if (data && data.text) {
      try {
        const authData = JSON.parse(data.text)
        if (authData.iin && authData.password && authData.deviceId) {
          // Закрываем диалог
          setDialogOpen(false)
          
          // Вызываем функцию обратного вызова с полученными данными
          onAuthReceived(authData.iin, authData.password, authData.deviceId)
        } else {
          setScanError('Неверный формат QR-кода')
        }
      } catch (e) {
        console.error('Ошибка при обработке QR-кода:', e)
        setScanError('Не удалось обработать QR-код')
      }
    }
  }
  
  // Обработчик ошибки сканирования QR-кода
  const handleQrError = (err: any) => {
    console.error('Ошибка сканирования QR-кода:', err)
    setScanError('Ошибка сканирования QR-кода')
  }
  
  return (
    <>
      <div className="mt-6 flex justify-center">
        <Button
          variant="outline"
          className="flex items-center"
          onClick={handleStartScanning}
        >
          <PhoneCall className="mr-2 h-4 w-4" />
          Войти с помощью другого устройства
        </Button>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Вход через другое устройство</DialogTitle>
            <DialogDescription>
              {isAvailable ? 
                "Выберите способ входа: NFC или QR-код" : 
                "Отсканируйте QR-код с авторизованного устройства"}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              {isAvailable && (
                <TabsTrigger value="nfc">NFC</TabsTrigger>
              )}
              <TabsTrigger value="qr" className={isAvailable ? '' : 'col-span-2'}>QR-код</TabsTrigger>
            </TabsList>
            
            {isAvailable && (
              <TabsContent value="nfc" className="flex flex-col items-center justify-center py-6">
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
              </TabsContent>
            )}
            
            <TabsContent value="qr" className="flex flex-col items-center justify-center py-6">
              <div className="w-full max-w-[300px] h-[250px] mx-auto bg-gray-100 rounded-lg overflow-hidden">
                <QrScanner
                  delay={300}
                  onError={handleQrError}
                  onScan={handleQrScan}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              
              {scanError && (
                <p className="mt-2 text-center text-sm text-red-600">
                  {scanError}
                </p>
              )}
              
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Наведите камеру на QR-код на экране авторизованного устройства
              </p>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="secondary" onClick={handleClose}>
              Отмена
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Войдите, используя учетные данные с другого устройства.
        <br />
        {!isAvailable && "NFC не поддерживается на этом устройстве, но можно использовать QR-код."}
      </p>
    </>
  )
}

export default NFCLogin 