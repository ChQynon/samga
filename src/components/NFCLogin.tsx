'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useNFC, NDEFReaderEventResult, DeviceInfo } from '@/lib/hooks/useNFC'
import { Spinner, X, QrCode, ArrowsClockwise, Camera } from '@phosphor-icons/react'
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
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '@/lib/providers/ToastProvider'
import { LoadingIcon } from './icons'

// Интерфейс для взаимодействия с сервером
interface SignInResult {
  success: boolean
  error?: string
}

// Имитация функции входа
const signIn = async (credentials: { iin: string, password: string }): Promise<SignInResult> => {
  // В реальной реализации здесь будет вызов API
  console.log('Выполняем вход с данными:', credentials)
  return { success: true }
}

type AuthData = {
  iin: string
  password: string
  deviceId: string
}

interface NFCLoginProps {
  onAuthReceived: (iin: string, password: string, deviceId: string) => void
}

// Функция для получения информации о браузере
const getBrowserInfo = (): string => {
  const userAgent = navigator.userAgent
  let browserName = 'Неизвестный браузер'
  
  if (userAgent.indexOf('Chrome') > -1) {
    browserName = 'Chrome'
  } else if (userAgent.indexOf('Firefox') > -1) {
    browserName = 'Firefox'
  } else if (userAgent.indexOf('Safari') > -1) {
    browserName = 'Safari'
  } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    browserName = 'Opera'
  } else if (userAgent.indexOf('Edge') > -1 || userAgent.indexOf('Edg') > -1) {
    browserName = 'Edge'
  }
  
  // Определение ОС
  let osName = 'Неизвестная ОС'
  if (userAgent.indexOf('Win') > -1) {
    osName = 'Windows'
  } else if (userAgent.indexOf('Mac') > -1) {
    osName = 'MacOS'
  } else if (userAgent.indexOf('Linux') > -1) {
    osName = 'Linux'
  } else if (userAgent.indexOf('Android') > -1) {
    osName = 'Android'
  } else if (userAgent.indexOf('iOS') > -1 || userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
    osName = 'iOS'
  }
  
  return `${browserName} на ${osName}`
}

const NFCLogin: React.FC<NFCLoginProps> = ({ onAuthReceived }) => {
  const { isAvailable, startReading, status, stopNFC, startScan, isScanning, isSupported } = useNFC()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>(isAvailable ? 'nfc' : 'qr')
  const [scanError, setScanError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [key, setKey] = useState<number>(0)
  const { showToast: toast } = useToast()
  const [qrValue, setQrValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleAuthData = (event: Event) => {
      const customEvent = event as CustomEvent<AuthData>
      const { iin, password, deviceId } = customEvent.detail
      
      // Добавляем устройство в список авторизованных
      try {
        // Получаем текущий список устройств
        const storedDevices = localStorage.getItem('samga-authorized-devices') || '[]'
        const devices = JSON.parse(storedDevices) as DeviceInfo[]
        
        // Создаем новое устройство
        const now = new Date()
        const newDevice: DeviceInfo = {
          id: deviceId,
          name: getBrowserInfo(),
          browser: navigator.userAgent,
          lastAccess: now.toLocaleString('ru'),
          timestamp: now.getTime()
        }
        
        // Проверяем, не превышен ли лимит (5 устройств)
        if (devices.length >= 5) {
          toast('Вы достигли максимального количества подключенных устройств (5)', 'error')
          return
        }
        
        // Добавляем новое устройство
        devices.push(newDevice)
        localStorage.setItem('samga-authorized-devices', JSON.stringify(devices))
      } catch (e) {
        console.error('Ошибка при добавлении устройства в список:', e)
      }
      
      setDialogOpen(false)
      
      onAuthReceived(iin, password, deviceId)
    }
    
    window.addEventListener('nfc-auth-data', handleAuthData)
    
    return () => {
      window.removeEventListener('nfc-auth-data', handleAuthData)
    }
  }, [onAuthReceived, toast])
  
  const handleStartScanning = async () => {
    setDialogOpen(true)
    setScanError(null)
    
    if (isAvailable && activeTab === 'nfc') {
      await startReading()
    }
  }
  
  const handleClose = () => {
    setDialogOpen(false)
    if (isAvailable) {
      stopNFC()
    }
  }
  
  const handleQrScan = (data: any) => {
    if (data && data.text) {
      try {
        const authData = JSON.parse(data.text)
        if (authData.iin && authData.password && authData.deviceId) {
          setDialogOpen(false)
          
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
  
  const handleQrError = (err: any) => {
    console.error('Ошибка сканирования QR-кода:', err)
    setScanError('Ошибка сканирования QR-кода')
  }
  
  const toggleCamera = () => {
    setFacingMode(prevMode => prevMode === 'environment' ? 'user' : 'environment')
    setKey(prevKey => prevKey + 1)
  }

  // Обработка данных, полученных от QR-кода
  const handleScan = useCallback(
    (data: { text: string } | null) => {
      if (data && data.text && !isLoading) {
        try {
          setQrValue(data.text)
          const authData = JSON.parse(data.text)
          handleAuth(authData)
        } catch (e) {
          console.error('Ошибка при обработке QR-кода:', e)
        }
      }
    },
    [isLoading]
  )

  // Обработка данных аутентификации
  const handleAuth = async (authData: {
    iin: string
    password: string
    deviceId: string
  }) => {
    try {
      setIsLoading(true)
      
      // Сохраняем ID устройства и данные пользователя
      localStorage.setItem('samga-current-device-id', authData.deviceId)
      localStorage.setItem('user-iin', authData.iin)
      localStorage.setItem('user-password', authData.password)
      
      // Выполняем вход
      const result = await signIn({
        iin: authData.iin,
        password: authData.password
      })

      if (result.success) {
        toast('Успешная авторизация', 'success')
        window.location.href = '/dashboard'
      } else {
        toast('Ошибка авторизации', 'error')
      }
    } catch (error) {
      console.error('Ошибка при обработке аутентификации:', error)
      toast('Произошла ошибка при авторизации', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Обработчик данных с NFC
  const handleNFCData = useCallback(
    (data: NDEFReaderEventResult) => {
      try {
        // Проверяем наличие сообщения NFC
        if (data.message) {
          // Извлекаем первую запись
          const record = data.message.records[0]
          if (record && record.data) {
            // Декодируем данные
            const decoder = new TextDecoder()
            const text = decoder.decode(record.data)
            const authData = JSON.parse(text)
            
            // Обрабатываем данные авторизации
            handleAuth(authData)
          }
        }
      } catch (error) {
        console.error('Ошибка при обработке NFC данных:', error)
        toast('Ошибка NFC', 'error')
      }
    },
    [handleAuth]
  )

  // Запускаем сканирование NFC при нажатии на кнопку
  const handleStartNFC = useCallback(() => {
    if (!isSupported) {
      toast('NFC не поддерживается', 'error')
      return
    }

    startScan(handleNFCData)
  }, [isSupported, startScan, handleNFCData])

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
          
          {isAvailable ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="nfc">NFC</TabsTrigger>
                <TabsTrigger value="qr">QR-код</TabsTrigger>
              </TabsList>
              
              <TabsContent value="nfc" className="py-4 flex flex-col items-center justify-center">
                {status === 'reading' && (
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="relative w-24 h-24">
                        <Image 
                          src="/images/nfc-icon.png"
                          alt="NFC Icon"
                          fill
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                    </div>
                    <p className="mb-2">Приложите устройство с NFC-меткой</p>
                    <Spinner size={32} className="mx-auto animate-spin text-primary" />
                  </div>
                )}
                
                {status === 'idle' && (
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="relative w-24 h-24">
                        <Image 
                          src="/images/nfc-icon.png"
                          alt="NFC Icon"
                          fill
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                    </div>
                    <p className="mb-4">Нажмите кнопку, чтобы начать сканирование NFC</p>
                    <Button onClick={startReading}>Начать сканирование</Button>
                  </div>
                )}
                
                {status === 'error' && (
                  <div className="text-center text-destructive">
                    <X size={32} className="mx-auto mb-2" />
                    <p>Произошла ошибка при инициализации NFC</p>
                    <Button 
                      className="mt-4" 
                      variant="outline" 
                      onClick={startReading}
                    >
                      Попробовать снова
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="qr" className="py-4">
                <div className="relative">
                  <div className="bg-black rounded-md overflow-hidden">
                    <QrScanner 
                      key={key}
                      delay={300}
                      onError={handleQrError}
                      onScan={handleQrScan}
                      style={{ width: '100%', height: '100%' }}
                      constraints={{
                        video: {
                          facingMode: facingMode
                        },
                        audio: false
                      }}
                    />
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-4 right-4 shadow-md"
                    onClick={toggleCamera}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {facingMode === 'user' ? 'Фронтальная камера' : 'Основная камера'}
                  </Button>
                </div>
                
                {scanError && (
                  <div className="mt-4 p-2 bg-destructive/10 text-destructive rounded text-sm">
                    {scanError}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="py-4">
              <div className="relative">
                <div className="bg-black rounded-md overflow-hidden">
                  <QrScanner 
                    key={key}
                    delay={300}
                    onError={handleQrError}
                    onScan={handleQrScan}
                    style={{ width: '100%', height: '100%' }}
                    constraints={{
                      video: {
                        facingMode: facingMode
                      },
                      audio: false
                    }}
                  />
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-4 right-4 shadow-md"
                  onClick={toggleCamera}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {facingMode === 'user' ? 'Фронтальная камера' : 'Основная камера'}
                </Button>
              </div>
              
              {scanError && (
                <div className="mt-4 p-2 bg-destructive/10 text-destructive rounded text-sm">
                  {scanError}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
            >
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