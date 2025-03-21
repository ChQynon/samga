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

// Для демонстрационных целей - создаем тестовые данные (только в режиме разработки)
const generateTestData = (): AuthData => {
  return {
    iin: '123456789012',
    password: 'test123',
    deviceId: 'demo-device-' + Math.floor(Math.random() * 100000)
  };
};

const NFCLogin = () => {
  const { isAvailable, status, error, startReading } = useNFC()
  const { showToast } = useToast()
  const router = useRouter()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState<string>(isAvailable ? 'nfc' : 'qr')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [scannerKey, setScannerKey] = useState(0)
  const [scanAnimation, setScanAnimation] = useState(false)
  const [lastScannedData, setLastScannedData] = useState<string | null>(null)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [nfcError, setNfcError] = useState<Error | null>(null)
  const [qrScanning, setQrScanning] = useState(false)
  
  // Анимация сканера
  const scannerRef = useRef<HTMLDivElement>(null)
  
  // Заменяем проверку режима разработки во всём файле
  const isDevelopment = typeof process !== 'undefined' && 
    typeof process.env !== 'undefined' && 
    process.env.NODE_ENV === 'development';
  
  // Установка интервала для проверки и демонстрационного режима
  useEffect(() => {
    // В режиме разработки для QR-кода
    if (isDevelopment && activeTab === 'qr' && !isProcessing && qrScanning) {
      const demoTimer = setTimeout(() => {
        console.log('Демонстрационный режим: Симуляция сканирования QR-кода');
        const testData = generateTestData();
        handleAuthData(testData);
      }, 5000);
      
      return () => clearTimeout(demoTimer);
    }
    
    // В режиме разработки для NFC
    if (isDevelopment && activeTab === 'nfc' && status === 'reading') {
      const demoTimer = setTimeout(() => {
        console.log('Демонстрационный режим: Симуляция считывания NFC');
        const testData = generateTestData();
        const event = new CustomEvent('nfc-auth-data', { 
          detail: testData 
        });
        window.dispatchEvent(event);
      }, 5000);
      
      return () => clearTimeout(demoTimer);
    }
  }, [activeTab, status, isProcessing, qrScanning]);
  
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
      // Устанавливаем состояние сканирования для QR
      setQrScanning(true)
    } else {
      setScanAnimation(false)
      setQrScanning(false)
    }
  }, [activeTab, isProcessing])
  
  // Обработчик для NFC событий
  useEffect(() => {
    const handleNFCAuthData = (event: Event) => {
      const customEvent = event as CustomEvent<any>
      if (customEvent.detail) {
        console.log('Получены данные от NFC:', customEvent.detail);
        try {
          // Проверяем, содержит ли объект все необходимые данные
          const authData = customEvent.detail;
          if (!authData.iin || !authData.password || !authData.deviceId) {
            throw new Error('Неполные данные для авторизации');
          }
          handleAuthData(authData);
        } catch (error) {
          console.error('Ошибка обработки NFC данных:', error);
          showToast('Ошибка обработки NFC данных', 'error');
        }
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
      setNfcError(null)
      console.log('Начинаем чтение NFC...');
      await startReading()
      showToast('NFC сканирование активировано', 'info')
    } catch (e) {
      console.error('Ошибка при запуске чтения NFC:', e)
      showToast('Не удалось запустить чтение NFC', 'error')
    }
  }
  
  // Улучшенный обработчик сканирования QR-кода
  const handleScan = useCallback(
    (data: { text: string } | null) => {
      if (data && data.text && !isProcessing) {
        try {
          console.log('QR-код считан, данные:', data.text);
          
          // Проверяем, возможно это просто строка без JSON формата
          let authData: AuthData;
          
          try {
            // Пробуем распарсить JSON
            authData = JSON.parse(data.text);
          } catch (parseError) {
            // Если не JSON, пытаемся проверить другие форматы
            // Формат может быть simple: iin:password:deviceId
            const parts = data.text.split(':');
            if (parts.length >= 2) {
              // Безопасный доступ к элементам массива с значениями по умолчанию
              const iin = parts[0] || '';
              const password = parts[1] || '';
              const deviceId = parts[2] || `device-${Date.now().toString()}`;
              
              authData = {
                iin,
                password,
                deviceId
              };
            } else {
              // Если текст не содержит ':' и не является JSON, 
              // проверяем, возможно это просто ИИН и пароль через пробел или другие разделители
              const cleanText = data.text.trim().replace(/[\s,-_]/g, ':');
              const altParts = cleanText.split(':');
              
              if (altParts.length >= 2) {
                authData = {
                  iin: altParts[0] || '',
                  password: altParts[1] || '',
                  deviceId: `device-${Date.now().toString()}`
                };
              } else if (data.text.length >= 12) {
                // Если длина строки достаточна для ИИН (12 символов), 
                // предполагаем что это ИИН, а остальное пароль
                authData = {
                  iin: data.text.substring(0, 12),
                  password: data.text.substring(12) || 'defaultPassword',
                  deviceId: `device-${Date.now().toString()}`
                };
              } else {
                throw new Error('Формат QR-кода не распознан. Требуется формат JSON или iin:password');
              }
            }
          }
          
          // Проверяем наличие необходимых данных
          if (!authData.iin || !authData.password) {
            throw new Error('QR-код не содержит необходимых данных ИИН и пароля для авторизации');
          }
          
          // Добавляем deviceId если не передан
          if (!authData.deviceId) {
            authData.deviceId = `device-${Date.now().toString()}`;
          }
          
          console.log('Данные QR-кода успешно распознаны, ИИН:', authData.iin, 'ID:', authData.deviceId);
          
          // Показываем уведомление об успешном сканировании
          showToast('QR-код успешно считан! Выполняем авторизацию...', 'success');
          
          // Обрабатываем полученные данные
          handleAuthData(authData);
        } catch (error: any) {
          // В режиме разработки для демонстрации
          if (isDevelopment) {
            console.log('Режим разработки: Создаем тестовые данные для авторизации');
            const testData = generateTestData();
            handleAuthData(testData);
            return;
          }
          
          // Для разработки отображаем полное сообщение об ошибке
          const errorMsg = isDevelopment 
            ? `Ошибка сканирования: ${error.message}. Данные: ${data.text}`
            : 'Ошибка при сканировании QR-кода. Проверьте формат и попробуйте снова.';
          
          console.error('Ошибка сканирования QR-кода:', error);
          setNfcError(new Error(errorMsg));
          showToast(errorMsg, 'error');
        }
      }
    },
    [isProcessing, showToast, isDevelopment]
  );
  
  // Обработка ошибки сканера
  const handleError = (err: any) => {
    console.error('Ошибка сканера QR-кода:', err)
    if (err && err.name !== 'NotAllowedError') {
      // NotAllowedError происходит при отмене доступа к камере, не показываем уведомление в этом случае
      showToast(`Ошибка сканера: ${err.message || 'Неизвестная ошибка'}`, 'error')
    }
  }
  
  // Улучшенная функция обработки данных аутентификации
  const handleAuthData = async (authData: AuthData) => {
    console.log('Начинаем обработку данных аутентификации:', JSON.stringify(authData));
    setIsProcessing(true);
    setQrScanning(false);
    
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
      
      showToast('Данные получены, выполняем авторизацию...', 'info');
      
      // Оптимизация для демонстрационного режима - если нужно
      if (isDevelopment) {
        setLoginSuccess(true);
        showToast("Устройство успешно авторизовано", 'success');
        
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        return;
      }
      
      // Реальный API вызов для продакшен
      console.log('Вызываем API для входа с ИИН:', authData.iin);
      const result = await login(authData.iin, authData.password);
      console.log('Результат API входа:', result);
      
      if (result.success) {
        // Обновляем список авторизованных устройств
        try {
          let devices: ExtendedDeviceInfo[] = [];
          const storedDevices = localStorage.getItem('samga-authorized-devices');
          if (storedDevices) {
            devices = JSON.parse(storedDevices);
          }
          
          // Создаем новое устройство
          const now = new Date();
          const newDevice: ExtendedDeviceInfo = {
            id: authData.deviceId,
            name: getBrowserInfo(),
            browser: navigator.userAgent,
            lastAccess: now.toLocaleString('ru'),
            timestamp: now.getTime(),
            source: sourceDevice
          };
          
          // Обновляем или добавляем устройство
          const existingDeviceIndex = devices.findIndex(d => d && d.id === authData.deviceId);
          if (existingDeviceIndex !== -1 && devices[existingDeviceIndex]) {
            const existingDevice = devices[existingDeviceIndex];
            devices[existingDeviceIndex] = {
              id: existingDevice.id,
              name: existingDevice.name,
              browser: existingDevice.browser,
              lastAccess: now.toLocaleString('ru'),
              timestamp: now.getTime(),
              source: sourceDevice
            };
          } else {
            // Проверяем лимит устройств
            if (devices.length >= 5) {
              // Находим самое старое устройство для замены
              let oldestIdx = 0;
              let oldestTimestamp = Number.MAX_SAFE_INTEGER;
              
              // Проходим по всем устройствам и ищем с самым старым timestamp
              for (let i = 0; i < devices.length; i++) {
                const device = devices[i];
                if (device && typeof device.timestamp === 'number' && device.timestamp < oldestTimestamp) {
                  oldestTimestamp = device.timestamp;
                  oldestIdx = i;
                }
              }
              
              // Заменяем самое старое устройство
              devices[oldestIdx] = newDevice;
            } else {
              // Добавляем новое устройство
              devices.push(newDevice);
            }
          }
          
          localStorage.setItem('samga-authorized-devices', JSON.stringify(devices));
        } catch (e) {
          console.error('Ошибка при обновлении списка устройств:', e);
        }
        
        setLoginSuccess(true);
        showToast("Вход выполнен успешно!", 'success');
        
        // Перенаправляем после короткой задержки
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        // Если вход не удался, показываем ошибку
        const errorMsg = result.errors?.iin || result.errors?.password || 'Ошибка входа: неверный ИИН или пароль';
        console.error('Ошибка входа:', errorMsg);
        showToast(errorMsg, 'error');
        setIsProcessing(false);
        setQrScanning(true); // Возобновляем сканирование
      }
    } catch (error: any) {
      console.error('Ошибка при обработке данных авторизации:', error);
      showToast("Ошибка авторизации: " + (error.message || 'произошла неизвестная ошибка'), 'error');
      
      // Сбрасываем состояние обработки
      setIsProcessing(false);
      setQrScanning(true);
    }
  };
  
  // Переключение камеры
  const handleToggleCamera = () => {
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment')
    setScannerKey(prev => prev + 1) // Обновляем ключ для пересоздания компонента сканера
    showToast(`Переключение на ${facingMode === 'environment' ? 'фронтальную' : 'основную'} камеру...`, 'info')
  }
  
  // Повторное сканирование
  const handleRescan = () => {
    setIsProcessing(false)
    setLastScannedData(null)
    setNfcError(null)
    if (activeTab === 'nfc') {
      handleStartNFCReading()
    } else {
      setQrScanning(true)
      setScannerKey(prev => prev + 1)
      showToast('Сканирование перезапущено', 'info')
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
                  {process.env.NODE_ENV === 'development' && (
                    <p className="mt-2 text-xs text-blue-500">
                      [Демо режим: ожидание 5 секунд для симуляции]
                    </p>
                  )}
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
                <div className="overflow-hidden rounded-md" ref={scannerRef}>
                  <QrScanner
                    key={scannerKey}
                    delay={300}
                    onError={handleError}
                    onScan={handleScan}
                    constraints={{
                      video: {
                        facingMode: facingMode,
                      }
                    }}
                    style={{ width: '100%', height: '300px' }}
                  />
                  
                  {/* Заменяем анимированный сканер на более простой, без рамок */}
                  <div className="absolute inset-0 pointer-events-none">
                    {scanAnimation && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* Только сканирующая линия - без рамок */}
                        <div 
                          className="absolute w-full h-1 bg-primary/70 opacity-50"
                          style={{
                            animation: 'qrScanAnimation 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  {facingMode === 'user' ? 'Используется фронтальная камера' : 'Используется основная камера'}
                </p>
                {process.env.NODE_ENV === 'development' && qrScanning && (
                  <p className="mt-2 text-center text-xs text-blue-500">
                    [Демо режим: ожидание 5 секунд для симуляции сканирования]
                  </p>
                )}
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
              {nfcError && (
                <div className="mt-4">
                  <p className="text-sm text-red-600">
                    {nfcError.message}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-2"
                    onClick={handleRescan}
                  >
                    Перезапустить сканирование
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <p className="text-center text-xs text-muted-foreground">
        Для использования этого метода входа необходимо предварительно авторизовать устройство в настройках аккаунта.
      </p>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-800 mb-2 font-medium">Демонстрационный режим</p>
          <p className="text-xs text-blue-600">
            В данном режиме разработки имитируется успешное сканирование через 5 секунд.
            В реальной среде необходимо сканировать настоящий QR-код или использовать NFC.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            className="mt-2 w-full"
            onClick={() => handleAuthData(generateTestData())}
          >
            Симулировать успешное подключение устройства
          </Button>
        </div>
      )}
      
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