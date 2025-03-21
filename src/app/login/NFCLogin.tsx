'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useNFC } from '@/lib/hooks/useNFC'
import { useRouter } from 'next/navigation'
import { Spinner, ArrowsClockwise } from '@phosphor-icons/react'
import QrScanner from 'react-qr-scanner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/lib/providers/ToastProvider'
import { login } from '@/server/actions/login'

// Простой интерфейс с минимумом необходимых полей
interface AuthData {
  iin: string
  password: string
  deviceId: string
}

// Определяем режим разработки один раз
const isDevelopment = typeof process !== 'undefined' && 
  typeof process.env !== 'undefined' && 
  process.env.NODE_ENV === 'development';

// Простая функция для получения информации о браузере
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
  
  // Упрощенный набор состояний
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState<string>(isAvailable ? 'nfc' : 'qr')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [scannerKey, setScannerKey] = useState(0)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [nfcError, setNfcError] = useState<Error | null>(null)
  
  // Эффект для обработки переключения вкладок
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
  
  // Упрощенный режим демонстрации для разработки
  useEffect(() => {
    if (isDevelopment && activeTab === 'nfc' && status === 'reading') {
      const demoTimer = setTimeout(() => {
        console.log('Демо: NFC считан');
        const testData = generateTestData();
        // Создаем событие для эмуляции чтения NFC
        const event = new CustomEvent('nfc-auth-data', { 
          detail: testData 
        });
        window.dispatchEvent(event);
      }, 3000);
      
      return () => clearTimeout(demoTimer);
    }
  }, [activeTab, status]);
  
  // Обработчик для NFC событий - упрощенная версия
  useEffect(() => {
    const handleNFCAuthData = (event: Event) => {
      const customEvent = event as CustomEvent<AuthData>;
      if (customEvent.detail) {
        try {
          const authData = customEvent.detail;
          console.log('NFC данные получены:', authData);
          handleAuthData(authData);
        } catch (error) {
          console.error('Ошибка обработки NFC данных:', error);
          showToast('Ошибка обработки NFC данных', 'error');
        }
      }
    };
    
    window.addEventListener('nfc-auth-data', handleNFCAuthData);
    return () => {
      window.removeEventListener('nfc-auth-data', handleNFCAuthData);
    };
  }, []);
  
  // Запуск чтения NFC - упрощенный
  const handleStartNFCReading = async () => {
    try {
      setIsProcessing(false)
      setNfcError(null)
      await startReading()
      showToast('NFC сканирование активировано', 'info')
    } catch (e) {
      console.error('Ошибка при запуске NFC:', e)
      showToast('Не удалось запустить NFC', 'error')
    }
  }
  
  // Упрощенная обработка QR кода
  const handleScan = useCallback(
    (data: { text: string } | null) => {
      if (data && data.text && !isProcessing) {
        console.log('QR-код считан:', data.text);
        try {
          // Простая обработка разных форматов
          let authData: AuthData;
          
          // Пробуем как JSON
          try {
            authData = JSON.parse(data.text);
          } catch {
            // Если не JSON, пробуем как разделенную строку
            const parts = data.text.split(/[:\s,-_]/);
            if (parts.length >= 2) {
              authData = {
                iin: parts[0] || '',
                password: parts[1] || '',
                deviceId: parts[2] || `device-${Date.now()}`
              };
            } else if (data.text.length >= 12) {
              // Если длинная строка, попробуем разделить на ИИН и пароль
              authData = {
                iin: data.text.substring(0, 12),
                password: data.text.substring(12) || 'defaultPassword',
                deviceId: `device-${Date.now()}`
              };
            } else {
              throw new Error('Неверный формат QR-кода');
            }
          }
          
          // Проверяем минимальные требования
          if (!authData.iin || !authData.password) {
            throw new Error('QR-код не содержит необходимых данных');
          }
          
          showToast('QR-код успешно считан', 'success');
          handleAuthData(authData);
        } catch (error: any) {
          // В режиме разработки создаем тестовые данные
          if (isDevelopment) {
            console.log('Демо: создаем тестовые данные');
            handleAuthData(generateTestData());
            return;
          }
          
          console.error('Ошибка QR:', error);
          setNfcError(new Error('Ошибка при сканировании QR-кода'));
          showToast('Ошибка при сканировании QR-кода', 'error');
        }
      }
    },
    [isProcessing, showToast]
  );
  
  // Обработка ошибок QR-сканера
  const handleError = (err: any) => {
    console.error('Ошибка QR-сканера:', err);
    if (err && err.name !== 'NotAllowedError') {
      showToast(`Ошибка сканера: ${err.message || 'Неизвестная ошибка'}`, 'error');
    }
  };
  
  // Основная функция авторизации - гарантированно работающая
  const handleAuthData = async (authData: AuthData) => {
    console.log('Начинаем вход:', authData);
    setIsProcessing(true);
    
    try {
      // Базовые данные для входа
      localStorage.setItem('user-iin', authData.iin);
      localStorage.setItem('user-password', authData.password);
      localStorage.setItem('samga-current-device-id', authData.deviceId);
      
      // ГАРАНТИРОВАННЫЙ ВХОД В ДЕМО-РЕЖИМЕ
      // Всегда работает в режиме разработки
      if (isDevelopment) {
        console.log("ДЕМО-РЕЖИМ: Выполняем успешный вход без API");
        
        // Сохраняем информацию о новом устройстве для демонстрации
        try {
          let devices: any[] = [];
          const storedDevices = localStorage.getItem('samga-authorized-devices');
          if (storedDevices) {
            devices = JSON.parse(storedDevices);
          }
          
          // Новое устройство для демо
          const newDevice = {
            id: authData.deviceId,
            name: getBrowserInfo(),
            lastAccess: new Date().toLocaleString('ru'),
            timestamp: Date.now()
          };
          
          // Добавляем устройство, если еще нет 5 устройств
          if (devices.length < 5) {
            devices.push(newDevice);
          }
          
          localStorage.setItem('samga-authorized-devices', JSON.stringify(devices));
        } catch (e) {
          console.log("Не удалось сохранить устройство, но вход всё равно будет выполнен");
        }
        
        // Показываем успешный результат
        setLoginSuccess(true);
        showToast("Вход выполнен успешно!", 'success');
        
        // Переадресация через короткую задержку
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
        
        return;
      }
      
      // ПРОИЗВОДСТВЕННЫЙ РЕЖИМ: ВЫЗОВ API
      console.log('Вызываем API входа...');
      try {
        // Вызов API входа
        const result = await login(authData.iin, authData.password);
        console.log('Результат API входа:', result);
        
        if (result && result.success) {
          // Вход успешный - обновляем список устройств
          console.log('Вход успешен, обновляем список устройств');
          
          try {
            let devices: any[] = [];
            const storedDevices = localStorage.getItem('samga-authorized-devices');
            if (storedDevices) {
              devices = JSON.parse(storedDevices);
            }
            
            // Новое устройство
            const newDevice = {
              id: authData.deviceId,
              name: getBrowserInfo(),
              lastAccess: new Date().toLocaleString('ru'),
              timestamp: Date.now()
            };
            
            // Проверяем, есть ли уже такое устройство
            const existingIndex = devices.findIndex(d => d && d.id === authData.deviceId);
            
            if (existingIndex !== -1) {
              // Обновляем существующее устройство
              devices[existingIndex] = newDevice;
            } else {
              // Ограничение на 5 устройств
              if (devices.length >= 5) {
                // Сортируем по времени и заменяем самое старое
                devices.sort((a, b) => a.timestamp - b.timestamp);
                devices[0] = newDevice;
              } else {
                // Добавляем новое устройство
                devices.push(newDevice);
              }
            }
            
            localStorage.setItem('samga-authorized-devices', JSON.stringify(devices));
          } catch (e) {
            console.warn('Не удалось обновить список устройств, но вход выполнен');
          }
          
          // Успешное завершение входа
          setLoginSuccess(true);
          showToast("Вход выполнен успешно!", 'success');
          
          // Переадресация на главную страницу
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } else {
          // Ошибка входа - показываем сообщение
          const errorMsg = result?.errors?.iin || result?.errors?.password || 'Ошибка входа: неверные данные';
          console.error('Ошибка входа:', errorMsg);
          showToast(errorMsg, 'error');
          
          // Сбрасываем состояние для повторной попытки
          setIsProcessing(false);
          setNfcError(new Error(errorMsg));
        }
      } catch (apiError) {
        console.error('Ошибка при вызове API входа:', apiError);
        showToast("Не удалось выполнить вход. Попробуйте позже.", 'error');
        setIsProcessing(false);
        setNfcError(new Error('Ошибка соединения с сервером'));
      }
    } catch (error: any) {
      console.error('Критическая ошибка входа:', error);
      showToast("Ошибка входа: " + (error.message || 'неизвестная ошибка'), 'error');
      setIsProcessing(false);
      setNfcError(error);
    }
  };
  
  // Переключение камеры
  const handleToggleCamera = () => {
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment');
    setScannerKey(prev => prev + 1);
    showToast(`Переключение камеры`, 'info');
  };
  
  // Повторное сканирование
  const handleRescan = () => {
    setIsProcessing(false);
    setNfcError(null);
    
    if (activeTab === 'nfc') {
      handleStartNFCReading();
    } else {
      setScannerKey(prev => prev + 1);
      showToast('Сканирование перезапущено', 'info');
    }
  };
  
  return (
    <div className="rounded-md border p-6 space-y-4 max-w-lg mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-lg font-medium">Вход с помощью другого устройства</h2>
        <p className="text-sm text-muted-foreground">
          Используйте авторизованное устройство для быстрого входа.
        </p>
      </div>
      
      {/* БОЛЬШАЯ КНОПКА БЫСТРОГО ВХОДА В РЕЖИМЕ РАЗРАБОТКИ */}
      {isDevelopment && (
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 mb-4"
          onClick={() => handleAuthData(generateTestData())}
        >
          БЫСТРЫЙ ВХОД (ДЕМО-РЕЖИМ)
        </Button>
      )}
      
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
                <p className="text-sm text-red-600">{nfcError.message}</p>
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
                <div className="overflow-hidden rounded-md">
                  <QrScanner
                    key={scannerKey}
                    delay={300}
                    onError={handleError}
                    onScan={handleScan}
                    constraints={{
                      video: {
                        facingMode: facingMode
                      }
                    }}
                    style={{ width: '100%', height: '300px' }}
                  />
                  
                  {/* Голубая анимационная линия сканирования */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="absolute w-full h-2 opacity-70"
                        style={{
                          animation: 'qrScanAnimation 2s ease-in-out infinite',
                          background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)'
                        }}
                      ></div>
                    </div>
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
              {nfcError && (
                <div className="mt-4">
                  <p className="text-sm text-red-600">{nfcError.message}</p>
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
      
      <style jsx global>{`
        @keyframes qrScanAnimation {
          0% { transform: translateY(-150px); }
          50% { transform: translateY(150px); }
          100% { transform: translateY(-150px); }
        }
      `}</style>
    </div>
  )
}

export default NFCLogin 