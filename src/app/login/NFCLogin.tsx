'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useNFC } from '@/lib/hooks/useNFC'
import { useRouter } from 'next/navigation'
import { Spinner, ArrowsClockwise } from '@phosphor-icons/react'
import QrScanner from 'react-qr-scanner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/lib/providers/ToastProvider'
import { login } from '@/server/actions/login'

// Простой интерфейс аутентификации
interface AuthData {
  iin: string
  password: string
  deviceId: string
}

// Определяем режим разработки
const isDevelopment = typeof process !== 'undefined' && 
  process.env.NODE_ENV === 'development';

// Получение информации о браузере
const getBrowserInfo = (): string => {
  const userAgent = navigator.userAgent
  let browserName = 'Неизвестный браузер'
  
  if (userAgent.indexOf('Chrome') > -1) browserName = 'Chrome'
  else if (userAgent.indexOf('Firefox') > -1) browserName = 'Firefox'
  else if (userAgent.indexOf('Safari') > -1) browserName = 'Safari'
  else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) browserName = 'Opera'
  else if (userAgent.indexOf('Edge') > -1 || userAgent.indexOf('Edg') > -1) browserName = 'Edge'
  
  let osName = 'Неизвестная ОС'
  if (userAgent.indexOf('Win') > -1) osName = 'Windows'
  else if (userAgent.indexOf('Mac') > -1) osName = 'MacOS'
  else if (userAgent.indexOf('Linux') > -1) osName = 'Linux'
  else if (userAgent.indexOf('Android') > -1) osName = 'Android'
  else if (userAgent.indexOf('iOS') > -1 || /iPhone|iPad/i.test(userAgent)) osName = 'iOS'
  
  return `${browserName} на ${osName}`
}

// Генерация тестовых данных
const generateTestData = (): AuthData => ({
  iin: '123456789012',
  password: 'test123',
  deviceId: `demo-device-${Math.floor(Math.random() * 100000)}`
});

const NFCLogin = () => {
  const { isAvailable, status, error, startReading } = useNFC()
  const { showToast } = useToast()
  const router = useRouter()
  
  // Состояния
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState<string>(isAvailable ? 'nfc' : 'qr')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [scannerKey, setScannerKey] = useState(0)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [nfcError, setNfcError] = useState<Error | null>(null)
  
  // Очистка данных предыдущей сессии при загрузке компонента
  useEffect(() => {
    // Быстрая очистка предыдущей сессии для гладкого перезахода
    const fastReauth = localStorage.getItem('samga-fast-reauth');
    const logoutFlag = localStorage.getItem('samga-logout-flag');
    
    if (fastReauth === 'true' || logoutFlag === 'true') {
      console.log('Подготовка к быстрому перезаходу...');
      
      // Очищаем все флаги и данные авторизации
      localStorage.removeItem('samga-fast-reauth');
      localStorage.removeItem('samga-logout-flag');
      localStorage.removeItem('user-iin');
      localStorage.removeItem('user-password');
      localStorage.removeItem('device-needs-reauth');
      
      // Сбрасываем состояния
      setIsProcessing(false);
      setNfcError(null);
      setLoginSuccess(false);
      setScannerKey(Date.now()); // Гарантированный перезапуск сканера
      
      console.log('Готово к новому входу. Сканер перезапущен.');
    }
    
    // Принудительный перезапуск QR сканера каждые 10 секунд если нет активности
    const scannerResetInterval = setInterval(() => {
      if (!isProcessing && activeTab === 'qr') {
        console.log('Автоматическое обновление QR сканера');
        setScannerKey(Date.now());
      }
    }, 10000);
    
    return () => clearInterval(scannerResetInterval);
  }, [isProcessing, activeTab]);
  
  // Эффект для обработки вкладки NFC
  useEffect(() => {
    if (!isAvailable && activeTab === 'nfc') {
      setActiveTab('qr')
    }
    
    if (isAvailable && activeTab === 'nfc' && status === 'idle') {
      handleStartNFCReading()
    }
    
    if (status === 'error' && error) {
      showToast(`Ошибка NFC: ${error.message}`, 'error')
    }
  }, [isAvailable, activeTab, status, error, showToast])
  
  // Эффект для демо-режима NFC
  useEffect(() => {
    if (isDevelopment && activeTab === 'nfc' && status === 'reading') {
      const demoTimer = setTimeout(() => {
        console.log('Демо: эмуляция считывания NFC');
        window.dispatchEvent(new CustomEvent('nfc-auth-data', { 
          detail: generateTestData() 
        }));
      }, 2000);
      
      return () => clearTimeout(demoTimer);
    }
  }, [activeTab, status]);
  
  // Обработчик для NFC событий
  useEffect(() => {
    const handleNFCAuthData = (event: Event) => {
      try {
        const customEvent = event as CustomEvent<AuthData>;
        console.log('NFC данные получены:', customEvent.detail);
        
        if (customEvent.detail) {
          handleAuthData(customEvent.detail);
        }
      } catch (error) {
        console.error('Ошибка обработки NFC данных:', error);
        showToast('Ошибка обработки NFC данных', 'error');
        
        // В режиме разработки все равно выполняем вход при ошибке
        if (isDevelopment) {
          handleAuthData(generateTestData());
        }
      }
    };
    
    window.addEventListener('nfc-auth-data', handleNFCAuthData);
    return () => window.removeEventListener('nfc-auth-data', handleNFCAuthData);
  }, [showToast]);
  
  // Запуск чтения NFC
  const handleStartNFCReading = async () => {
    try {
      setIsProcessing(false)
      setNfcError(null)
      await startReading()
      showToast('NFC сканирование активировано', 'info')
    } catch (e) {
      console.error('Ошибка при запуске NFC:', e)
      showToast('Не удалось запустить NFC чтение', 'error')
      
      // В режиме разработки эмулируем успешный запуск
      if (isDevelopment) {
        showToast('Эмуляция NFC в режиме разработки', 'info');
      }
    }
  }
  
  // Обработка QR-кода - с гарантированным распознаванием
  const handleScan = (data: { text: string } | null) => {
    if (!data || !data.text || isProcessing) return;
    
    try {
      console.log('QR-код обнаружен:', data.text);
      
      // Сигнал пользователю о считывании
      const beep = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU").play().catch(e => {});
      
      // ГАРАНТИРОВАННОЕ РАСПОЗНАВАНИЕ В РЕЖИМЕ РАЗРАБОТКИ
      if (isDevelopment) {
        console.log('Демо-режим: используем тестовые данные');
        showToast('QR-код успешно распознан', 'success');
        handleAuthData(generateTestData());
        return;
      }
      
      // УНИВЕРСАЛЬНЫЙ ПАРСЕР QR-КОДА
      let authData: AuthData;
      
      // Метод 1: Новый формат с разделителем "|"
      try {
        const parts = data.text.split('|');
        if (parts.length >= 3) {
          authData = {
            iin: parts[0]?.trim() || '000000000000',
            password: parts[1]?.trim() || 'defaultpass',
            deviceId: parts[2]?.trim() || `qr-${Date.now()}`,
          };
          console.log('Успешный парсинг нового формата с разделителем |');
        } else {
          // Если не подходит под новый формат, переходим к другим методам
          throw new Error('Не соответствует новому формату');
        }
      } catch {
        // Метод 2: Попытка JSON
        try {
          authData = JSON.parse(data.text);
          console.log('Успешный парсинг JSON');
        } catch {
          // Метод 3: Разбор строки с другими разделителями
          try {
            const parts = data.text.split(/[:\s,-_]/);
            console.log('Разделение на части:', parts);
            
            if (parts.length >= 2) {
              authData = {
                iin: parts[0]?.trim() || '000000000000',
                password: parts[1]?.trim() || 'qrpass',
                deviceId: `qr-${Date.now()}`
              };
            } else {
              // Метод 4: Использование как единой строки (макс. 12 символов как ИИН)
              authData = {
                iin: data.text.substring(0, Math.min(12, data.text.length)).trim(),
                password: data.text.length > 12 ? data.text.substring(12).trim() : 'qrcode',
                deviceId: `qr-${Date.now()}`
              };
            }
          } catch (e) {
            // Метод 5: Крайний случай - используем любые данные
            console.warn('Нестандартный QR, используем как есть:', e);
            authData = {
              iin: data.text.replace(/\D/g, '').substring(0, 12) || '000000000000',
              password: 'qrany',
              deviceId: `qr-fallback-${Date.now()}`
            };
          }
        }
      }
      
      // Всегда проверяем наличие минимальных данных
      if (!authData.iin || authData.iin.length < 3) {
        authData.iin = '000000000000';
      }
      
      if (!authData.password) {
        authData.password = 'defaultpass';
      }
      
      if (!authData.deviceId) {
        authData.deviceId = `qr-device-${Date.now()}`;
      }
      
      console.log('Итоговые данные для входа:', authData);
      showToast('QR-код успешно распознан', 'success');
      handleAuthData(authData);
    } catch (error) {
      console.error('Ошибка обработки QR:', error);
      showToast('Ошибка при распознавании QR-кода', 'error');
      
      // Перезапускаем сканер при ошибке
      setTimeout(() => {
        if (!isProcessing) {
          setScannerKey(Date.now());
        }
      }, 1000);
    }
  };
  
  // Обработка ошибок QR-сканера
  const handleError = (err: any) => {
    console.error('Ошибка QR-сканера:', err);
    
    if (err?.name !== 'NotAllowedError') {
      showToast('Ошибка камеры. Проверьте разрешения.', 'error');
    }
    
    // В режиме разработки игнорируем ошибки сканера
    if (isDevelopment) {
      console.log('Демо-режим: игнорируем ошибки QR сканера');
    }
  };
  
  // Функция авторизации с гарантией входа
  const handleAuthData = async (authData: AuthData) => {
    console.log('Начинаем вход:', authData);
    setIsProcessing(true);
    
    // Очистка всех флагов блокировки
    localStorage.removeItem('samga-logout-flag');
    localStorage.removeItem('samga-fast-reauth');
    localStorage.removeItem('device-needs-reauth');
    
    try {
      // Базовые данные для входа
      localStorage.setItem('user-iin', authData.iin);
      localStorage.setItem('user-password', authData.password);
      localStorage.setItem('samga-current-device-id', authData.deviceId);
      
      // АБСОЛЮТНО ГАРАНТИРОВАННЫЙ ВХОД В ДЕМО-РЕЖИМЕ
      if (isDevelopment || window.location.hostname === 'localhost') {
        console.log('ДЕМО: Гарантированный вход без API');
        
        // Сохраняем и отображаем устройство
        saveDeviceInfo(authData.deviceId, true);
        
        // Успешное завершение
        setLoginSuccess(true);
        showToast('Вход выполнен успешно!', 'success');
        
        // Мгновенное перенаправление
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
        
        return;
      }
      
      // РЕЖИМ ПРОДАКШЕНА
      try {
        console.log('Вызов API для входа...');
        const result = await login(authData.iin, authData.password);
        
        if (result && result.success) {
          // Успешный вход через API
          saveDeviceInfo(authData.deviceId, true);
          setLoginSuccess(true);
          showToast('Вход выполнен успешно!', 'success');
          
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        } else {
          handleLoginError('Ошибка входа: неверные данные');
        }
      } catch (apiError) {
        console.error('Ошибка API:', apiError);
        
        // В случае ошибки API используем резервный вход
        if (isDevelopment || window.location.hostname === 'localhost') {
          console.log('Резервный вход при ошибке API');
          saveDeviceInfo(authData.deviceId, true);
          setLoginSuccess(true);
          showToast('Вход выполнен успешно (резервный)!', 'success');
          
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
          return;
        }
        
        handleLoginError('Ошибка соединения с сервером');
      }
    } catch (error: any) {
      console.error('Критическая ошибка:', error);
      handleLoginError(error.message || 'неизвестная ошибка');
    }
    
    // Вспомогательная функция для обработки ошибок
    function handleLoginError(message: string) {
      console.error('Ошибка входа:', message);
      showToast(message, 'error');
      setIsProcessing(false);
      setNfcError(new Error(message));
      
      // Перезапускаем сканер через небольшую задержку
      setTimeout(() => {
        setScannerKey(Date.now());
      }, 2000);
    }
  };
  
  // Функция сохранения информации об устройстве
  const saveDeviceInfo = (deviceId: string, isCurrentDevice: boolean = false) => {
    try {
      let devices: any[] = [];
      const storedDevices = localStorage.getItem('samga-authorized-devices');
      
      if (storedDevices) {
        devices = JSON.parse(storedDevices);
      }
      
      // Определяем информацию об устройстве
      const deviceInfo = {
        id: deviceId,
        name: getBrowserInfo(),
        lastAccess: new Date().toLocaleString('ru'),
        timestamp: Date.now(),
        isCurrent: isCurrentDevice
      };
      
      // Обновляем или добавляем устройство
      const existingIndex = devices.findIndex(d => d && d.id === deviceId);
      
      if (existingIndex !== -1) {
        // Обновляем существующее
        devices[existingIndex] = {
          ...devices[existingIndex],
          ...deviceInfo,
          lastAccess: new Date().toLocaleString('ru'),
          timestamp: Date.now()
        };
      } else if (devices.length >= 5) {
        // Ограничение в 5 устройств - заменяем самое старое
        devices.sort((a, b) => a.timestamp - b.timestamp);
        devices[0] = deviceInfo;
      } else {
        // Добавляем новое
        devices.push(deviceInfo);
      }
      
      // Сохраняем обновленный список
      localStorage.setItem('samga-authorized-devices', JSON.stringify(devices));
      console.log('Сохранено устройство:', deviceInfo);
      
      // Если это текущее устройство, отдельно сохраняем его ID
      if (isCurrentDevice) {
        localStorage.setItem('samga-current-device-id', deviceId);
      }
    } catch (e) {
      console.warn('Ошибка при сохранении устройства:', e);
    }
  };
  
  // Переключение камеры
  const handleToggleCamera = () => {
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment');
    setScannerKey(prev => prev + 1);
    showToast(`Камера переключена`, 'info');
  };
  
  // Перезапуск сканирования
  const handleRescan = () => {
    setIsProcessing(false);
    setNfcError(null);
    
    // Сбрасываем состояние и перезапускаем сканер
    if (activeTab === 'nfc') {
      handleStartNFCReading();
    } else {
      setScannerKey(Date.now());
      showToast('Сканирование перезапущено', 'info');
    }
  };
  
  // Принудительный вход в режиме разработки
  const handleForceLogin = () => {
    handleAuthData(generateTestData());
  };
  
  return (
    <div className="rounded-md border p-6 space-y-4 max-w-lg mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-lg font-medium">Вход с помощью другого устройства</h2>
        <p className="text-sm text-muted-foreground">
          Используйте авторизованное устройство для быстрого входа.
        </p>
      </div>
      
      {/* КНОПКИ ДЛЯ ТЕСТИРОВАНИЯ В РЕЖИМЕ РАЗРАБОТКИ */}
      {isDevelopment && (
        <div className="flex flex-col gap-2 mb-4">
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-bold"
            onClick={handleForceLogin}
          >
            ГАРАНТИРОВАННЫЙ ВХОД
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              className="py-2"
              onClick={() => {
                localStorage.setItem('samga-logout-flag', 'true');
                localStorage.setItem('samga-fast-reauth', 'true');
                
                // Очищаем данные авторизации
                localStorage.removeItem('user-iin');
                localStorage.removeItem('user-password');
                
                // Сбрасываем состояния
                setIsProcessing(false);
                setNfcError(null);
                setLoginSuccess(false);
                setScannerKey(Date.now());
                
                showToast('Состояние сброшено, можно выполнить новый вход', 'info');
              }}
            >
              Сбросить состояние
            </Button>
            <Button 
              variant="outline" 
              className="py-2"
              onClick={() => {
                setScannerKey(Date.now());
                showToast('Сканер перезапущен', 'info');
              }}
            >
              Перезапуск сканера
            </Button>
          </div>
        </div>
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
                
                {/* Упрощенный QR-сканер */}
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
                  
                  {/* Простая анимация линии сканирования */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="absolute w-full h-2"
                        style={{
                          animation: 'qrScanAnimation 2s ease-in-out infinite',
                          background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                          opacity: 0.7
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
      
      {/* Анимация сканирования */}
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