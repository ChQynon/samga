'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useNFC, DeviceInfo } from '@/lib/hooks/useNFC'
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

// Добавляем объявление для ToastProps
interface ExtendedDeviceInfo extends DeviceInfo {
  source?: {
    name: string;
    browser: string;
    timestamp: number;
  };
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
  const { showToast, toast } = useToast()
  const router = useRouter()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState<string>(isAvailable ? 'nfc' : 'qr')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [scannerKey, setScannerKey] = useState(0)
  const [scanAnimation, setScanAnimation] = useState(false)
  const [lastScannedData, setLastScannedData] = useState<string | null>(null)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [nfcError, setNfcError] = useState<Error | null>(null)
  
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
  
  // Обработчик для NFC событий
  useEffect(() => {
    const handleNFCAuthData = (event: Event) => {
      const customEvent = event as CustomEvent<any>
      if (customEvent.detail) {
        const dataString = JSON.stringify(customEvent.detail)
        handleAuthData(JSON.parse(dataString))
      }
    }
    
    window.addEventListener('nfc-auth-data', handleNFCAuthData)
    
    return () => {
      window.removeEventListener('nfc-auth-data', handleNFCAuthData)
    }
  }, [])
  
  // Запуск чтения NFC
  const handleStartNFCReading = async () => {
    try {
      setIsProcessing(false) // Сбрасываем состояние для возможности повторного сканирования
      setLastScannedData(null)
      await startReading()
    } catch (e) {
      console.error('Ошибка при запуске чтения NFC:', e)
      showToast('Не удалось запустить чтение NFC', 'error')
    }
  }
  
  // Обновляем обработчик сканирования QR-кода, чтобы избежать повторной обработки
  const handleScan = useCallback(
    (data: { text: string } | null) => {
      if (data && data.text && data.text !== lastScannedData) {
        setLastScannedData(data.text);
        try {
          // Проверяем структуру данных перед обработкой
          const authData = JSON.parse(data.text);
          if (authData && authData.deviceId && authData.iin && authData.password) {
            console.log('QR код успешно отсканирован:', authData);
            handleAuthData(authData);
          } else {
            throw new Error('Некорректный формат данных QR-кода');
          }
        } catch (error: any) {
          const errorMsg = error.message || 'Ошибка при сканировании QR-кода';
          console.error('Ошибка сканирования QR-кода:', errorMsg);
          setNfcError(new Error(errorMsg));
          showToast(errorMsg, 'error');
        }
      }
    },
    [lastScannedData]
  );
  
  // Обработка ошибки сканера
  const handleError = (err: any) => {
    console.error('Ошибка сканера QR-кода:', err)
    if (err && err.name !== 'NotAllowedError') {
      // NotAllowedError происходит при отмене доступа к камере, не показываем уведомление в этом случае
      showToast(`Ошибка сканера: ${err.message || 'Неизвестная ошибка'}`, 'error')
    }
  }
  
  // Улучшаем функцию обработки данных аутентификации
  const handleAuthData = async (authData: AuthData) => {
    setIsProcessing(true);
    try {
      // Получаем данные текущего устройства
      const sourceDevice = {
        name: getBrowserInfo(),
        browser: navigator.userAgent,
        timestamp: new Date().getTime()
      };
      
      // Сохраняем данные для авторизации
      localStorage.setItem('user-iin', authData.iin);
      localStorage.setItem('user-password', authData.password);
      localStorage.setItem('samga-current-device-id', authData.deviceId);
      
      // Обрабатываем список устройств
      const now = new Date();
      let devices: ExtendedDeviceInfo[] = [];
      
      try {
        const storedDevices = localStorage.getItem('samga-authorized-devices');
        if (storedDevices) {
          devices = JSON.parse(storedDevices);
        }
      } catch (e) {
        console.error('Ошибка при чтении списка устройств:', e);
      }
      
      // Создаем новое устройство
      const newDevice: ExtendedDeviceInfo = {
        id: authData.deviceId,
        name: getBrowserInfo(),
        browser: navigator.userAgent,
        lastAccess: now.toLocaleString('ru'),
        timestamp: now.getTime(),
        source: sourceDevice // Добавляем информацию об устройстве, с которого был выполнен вход
      };
      
      // Проверяем, существует ли уже это устройство
      const existingDeviceIndex = devices.findIndex(device => device && device.id === authData.deviceId);
      
      // Исправляем обновление существующего устройства
      if (existingDeviceIndex !== -1 && devices[existingDeviceIndex]) {
        // Обновляем существующее устройство
        const existingDevice = devices[existingDeviceIndex];
        devices[existingDeviceIndex] = {
          id: existingDevice.id || authData.deviceId,
          name: existingDevice.name || getBrowserInfo(),
          browser: existingDevice.browser || navigator.userAgent,
          lastAccess: now.toLocaleString('ru'),
          timestamp: now.getTime(),
          source: sourceDevice
        };
      } else {
        // Проверяем, не превышен ли лимит (5 устройств)
        if (devices.length >= 5) {
          // Если превышен, заменяем самое старое устройство
          let oldestIndex = 0;
          let oldestTimestamp = devices[0]?.timestamp || 0;
          
          for (let i = 1; i < devices.length; i++) {
            const device = devices[i];
            if (device && device.timestamp < oldestTimestamp) {
              oldestTimestamp = device.timestamp;
              oldestIndex = i;
            }
          }
          
          // Показываем уведомление о замене устройства
          showToast("Достигнут лимит устройств. Самое старое устройство было заменено.", 'info');
          
          devices[oldestIndex] = newDevice;
        } else {
          // Добавляем новое устройство
          devices.push(newDevice);
        }
      }
      
      // Сохраняем обновленный список устройств
      localStorage.setItem('samga-authorized-devices', JSON.stringify(devices));
      
      // Показываем сообщение об успешном входе
      setLoginSuccess(true);
      showToast("Устройство успешно авторизовано", 'success');
      
      // Пытаемся выполнить вход
      try {
        const result = await login(authData.iin, authData.password);
        
        if (result.success) {
          // Перенаправляем после короткой задержки
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          const errorMsg = result.errors?.iin || result.errors?.password || 'Ошибка входа';
          showToast(errorMsg, 'error');
          setIsProcessing(false);
        }
      } catch (error: any) {
        console.error('Ошибка при выполнении входа:', error);
        showToast("Не удалось выполнить вход: " + (error.message || 'неизвестная ошибка'), 'error');
        setIsProcessing(false);
      }
      
    } catch (error: any) {
      console.error('Ошибка при обработке данных авторизации:', error);
      setNfcError(new Error('Не удалось авторизовать устройство: ' + (error.message || 'неизвестная ошибка')));
      showToast("Не удалось авторизовать устройство", 'error');
      
      // По завершении обработки в любом случае
      setTimeout(() => {
        setIsProcessing(false);
        handleRescan(); // Сбрасываем всё для возможности нового сканирования
      }, 2000);
    }
  };
  
  // Переключение камеры
  const handleToggleCamera = () => {
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment')
    setScannerKey(prev => prev + 1) // Обновляем ключ для пересоздания компонента сканера
  }
  
  // Повторное сканирование
  const handleRescan = () => {
    setIsProcessing(false)
    setLastScannedData(null)
    if (activeTab === 'nfc') {
      handleStartNFCReading()
    } else {
      setScannerKey(prev => prev + 1)
    }
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
                  {loginSuccess ? (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12L10 17L20 7" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p className="mt-2 text-center text-sm font-medium text-green-600">
                        Вход выполнен успешно!
                      </p>
                      <p className="text-center text-xs text-muted-foreground">
                        Перенаправление...
                      </p>
                    </div>
                  ) : (
                    <>
                      <Spinner size={48} className="animate-spin text-primary" />
                      <p className="mt-4 text-center text-sm text-muted-foreground">
                        Выполняем вход...
                      </p>
                    </>
                  )}
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
            
            {nfcError && (
              <div className="mt-4 text-center">
                <p className="text-sm text-red-600">
                  {nfcError.message}
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-2"
                  onClick={handleRescan}
                >
                  Повторить сканирование
                </Button>
              </div>
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
                      }
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
                {loginSuccess ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12L10 17L20 7" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="mt-2 text-center text-sm font-medium text-green-600">
                      Вход выполнен успешно!
                    </p>
                    <p className="text-center text-xs text-muted-foreground">
                      Перенаправление...
                    </p>
                  </div>
                ) : (
                  <>
                    <Spinner size={48} className="animate-spin text-primary" />
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                      Выполняем вход...
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
          
          {!isProcessing && (
            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                Наведите камеру на QR-код для автоматического сканирования
              </p>
            </div>
          )}
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