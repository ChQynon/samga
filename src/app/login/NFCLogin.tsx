'use client'

import React, { useState, useEffect, useRef } from 'react'
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

const NFCLogin = () => {
  const { isAvailable, status, error, startReading } = useNFC()
  const { showToast } = useToast()
  const router = useRouter()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState<string>(isAvailable ? 'nfc' : 'qr')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [scannerKey, setScannerKey] = useState(0)
  const [scanAnimation, setScanAnimation] = useState(false)
  
  // Анимация сканера
  const scannerRef = useRef<HTMLDivElement>(null)
  
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
  
  // Запускаем анимацию сканера
  useEffect(() => {
    if (activeTab === 'qr' && !isProcessing) {
      setScanAnimation(true)
    } else {
      setScanAnimation(false)
    }
  }, [activeTab, isProcessing])
  
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
      try {
        // Проверка валидности данных перед обработкой
        const parsed = JSON.parse(data.text)
        if (parsed && parsed.iin && parsed.password && parsed.deviceId) {
          handleAuthData(data.text)
        }
      } catch (e) {
        console.error('Неверный формат QR-кода:', e)
      }
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
      
      // Добавляем устройство в список авторизованных
      try {
        // Получаем текущий список устройств
        const storedDevices = localStorage.getItem('samga-authorized-devices') || '[]'
        const devices = JSON.parse(storedDevices)
        
        // Создаем новое устройство
        const now = new Date()
        const newDevice = {
          id: authData.deviceId,
          name: getBrowserInfo(),
          browser: navigator.userAgent,
          lastAccess: now.toLocaleString('ru'),
          timestamp: now.getTime()
        }
        
        // Проверяем, не превышен ли лимит (5 устройств)
        if (devices.length >= 5) {
          // Если превышен, заменяем самое старое устройство
          let oldestIndex = 0
          let oldestTimestamp = devices[0].timestamp
          
          for (let i = 1; i < devices.length; i++) {
            if (devices[i].timestamp < oldestTimestamp) {
              oldestTimestamp = devices[i].timestamp
              oldestIndex = i
            }
          }
          
          devices[oldestIndex] = newDevice
        } else {
          // Добавляем новое устройство
          devices.push(newDevice)
        }
        
        localStorage.setItem('samga-authorized-devices', JSON.stringify(devices))
      } catch (e) {
        console.error('Ошибка при добавлении устройства в список:', e)
      }
      
      showToast('Данные аутентификации получены, выполняем вход...', 'info')
      
      // Выполняем вход
      try {
        const result = await login(authData.iin, authData.password)
        
        if (result.success) {
          showToast('Вход выполнен успешно!', 'success')
          
          // Задержка перед переходом для отображения toast
          setTimeout(() => {
            // Используем window.location.href вместо router.push для полной перезагрузки
            window.location.href = '/'
          }, 1000)
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
    setScannerKey(prev => prev + 1) // Обновляем ключ для пересоздания компонента сканера
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
                <div className="overflow-hidden rounded-md border" ref={scannerRef}>
                  <QrScanner
                    key={scannerKey} // Важно для переключения камеры
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
                  
                  {/* Анимированный сканер */}
                  <div className="absolute inset-0 pointer-events-none">
                    {scanAnimation && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* Внешняя рамка */}
                        <div className="absolute w-64 h-64 border-2 border-primary rounded-md"></div>
                        
                        {/* Сканирующая линия */}
                        <div 
                          className="absolute w-64 h-1 bg-primary/80 opacity-75 rounded-full shadow-lg shadow-primary/50"
                          style={{
                            animation: 'qrScanAnimation 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                          }}
                        ></div>
                        
                        {/* Углы рамки */}
                        <div className="absolute w-64 h-64">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary"></div>
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary"></div>
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary"></div>
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary"></div>
                        </div>
                      </div>
                    )}
                  </div>
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
      
      {/* Добавляем стили для анимации сканирования */}
      <style jsx global>{`
        @keyframes qrScanAnimation {
          0% { transform: translateY(-32px); }
          50% { transform: translateY(32px); }
          100% { transform: translateY(-32px); }
        }
      `}</style>
    </div>
  )
}

export default NFCLogin 