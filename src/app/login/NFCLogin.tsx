'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useNFC } from '@/lib/hooks/useNFC'
import { useRouter } from 'next/navigation'
import { Spinner, QrCode, ArrowsClockwise } from '@phosphor-icons/react'
import QrScanner from 'react-qr-scanner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/lib/providers/ToastProvider'
import { login } from '@/server/actions/login'

interface AuthData {
  iin: string
  password: string
  deviceId: string
  sourceDevice?: {
    name: string
    id: string
  }
}

const NFCLogin = () => {
  const { isAvailable, status, error, startReading } = useNFC()
  const { showToast } = useToast()
  const router = useRouter()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState<string>(isAvailable ? 'nfc' : 'qr')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  
  useEffect(() => {
    // Если NFC недоступен, переключаемся на вкладку QR
    if (!isAvailable && activeTab === 'nfc') {
      setActiveTab('qr')
    }
    
    // Запускаем NFC чтение сразу при открытии вкладки NFC
    if (isAvailable && activeTab === 'nfc' && status === 'idle') {
      handleStartNFCReading()
    }
    
    // Обработка ошибок NFC
    if (status === 'error' && error) {
      showToast(`Ошибка NFC: ${error.message}`, 'error')
    }
  }, [isAvailable, activeTab, status, error])
  
  // Запуск чтения NFC
  const handleStartNFCReading = async () => {
    try {
      await startReading()
    } catch (e) {
      console.error('Ошибка при запуске чтения NFC:', e)
      showToast('Не удалось запустить чтение NFC', 'error')
    }
  }
  
  // Обработка QR кода
  const handleScan = async (data: any) => {
    if (data && data.text && !isProcessing) {
      handleAuthData(data.text)
    }
  }
  
  // Обработка ошибки сканера
  const handleError = (err: any) => {
    console.error('Ошибка сканера QR-кода:', err)
  }
  
  // Обработка полученных данных (общая для NFC и QR)
  const handleAuthData = async (data: string) => {
    setIsProcessing(true)
    
    try {
      // Пытаемся распарсить данные
      const authData: AuthData = JSON.parse(data)
      
      if (!authData.iin || !authData.password) {
        showToast('Неверный формат данных аутентификации', 'error')
        setIsProcessing(false)
        return
      }
      
      // Сохраняем информацию об устройстве-источнике
      if (authData.sourceDevice) {
        localStorage.setItem('last-auth-source', JSON.stringify({
          sourceDevice: authData.sourceDevice
        }))
      }
      
      // Сохраняем ID устройства в localStorage
      localStorage.setItem('samga-current-device-id', authData.deviceId)
      
      // Сохраняем учетные данные для авторизации новых устройств
      localStorage.setItem('user-iin', authData.iin)
      localStorage.setItem('user-password', authData.password)
      
      showToast('Данные аутентификации получены, выполняем вход...', 'info')
      
      // Выполняем вход
      try {
        const result = await login(authData.iin, authData.password)
        
        if (result.success) {
          showToast('Вход выполнен успешно!', 'success')
          router.push('/')
        } else {
          const errorMessage = result.errors?.password || result.errors?.iin || 'Не удалось войти в систему'
          showToast(errorMessage, 'error')
          setIsProcessing(false)
        }
      } catch (e) {
        console.error('Ошибка при выполнении входа:', e)
        showToast('Ошибка при выполнении входа', 'error')
        setIsProcessing(false)
      }
    } catch (e) {
      console.error('Ошибка при обработке данных аутентификации:', e)
      showToast('Неверный формат данных аутентификации', 'error')
      setIsProcessing(false)
    }
  }
  
  // Переключение камеры
  const handleToggleCamera = () => {
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment')
  }
  
  return (
    <div className="rounded-md border p-6 space-y-4 max-w-lg mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-lg font-medium">Вход с помощью другого устройства</h2>
        <p className="text-sm text-muted-foreground">
          Используйте авторизованное устройство для быстрого входа в систему.
        </p>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          {isAvailable && (
            <TabsTrigger value="nfc">NFC</TabsTrigger>
          )}
          <TabsTrigger value="qr" className={isAvailable ? '' : 'col-span-2'}>QR-код</TabsTrigger>
        </TabsList>
        
        {isAvailable && (
          <TabsContent value="nfc" className="flex flex-col items-center justify-center py-6">
            <div className="h-48 flex flex-col items-center justify-center">
              {status === 'reading' ? (
                <>
                  <Spinner size={48} className="animate-spin text-primary" />
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    Поднесите устройство к другому телефону...
                  </p>
                </>
              ) : isProcessing ? (
                <>
                  <Spinner size={48} className="animate-spin text-primary" />
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    Выполняем вход...
                  </p>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="h-20 w-20 rounded-full"
                    onClick={handleStartNFCReading}
                  >
                    <Spinner size={32} className="text-primary" />
                  </Button>
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    Нажмите, чтобы начать сканирование NFC
                  </p>
                </>
              )}
            </div>
            
            {error && (
              <p className="text-center text-sm text-red-600 mt-4">
                {error.message}
              </p>
            )}
          </TabsContent>
        )}
        
        <TabsContent value="qr" className="py-6">
          <div className="relative">
            {!isProcessing ? (
              <>
                <div className="mb-2 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleToggleCamera}
                  >
                    <ArrowsClockwise className="h-4 w-4" />
                  </Button>
                </div>
                <div className="overflow-hidden rounded-md border">
                  <QrScanner
                    key={facingMode} // Важно для переключения камеры
                    delay={300}
                    onError={handleError}
                    onScan={handleScan}
                    constraints={{
                      video: {
                        facingMode: facingMode
                      },
                    }}
                    style={{ width: '100%', height: '100%' }}
                  />
                  <div className="absolute inset-0 pointer-events-none border-4 border-primary/30 rounded-md"></div>
                </div>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  {facingMode === 'user' ? 'Используется фронтальная камера' : 'Используется основная камера'}
                </p>
              </>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center">
                <Spinner size={48} className="animate-spin text-primary" />
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Выполняем вход...
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <p className="text-center text-xs text-muted-foreground">
        Для использования этого метода входа необходимо предварительно авторизовать устройство в настройках аккаунта.
      </p>
    </div>
  )
}

export default NFCLogin 