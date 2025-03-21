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
    // Проверка наличия флага выхода
    const logoutFlag = localStorage.getItem('samga-logout-flag');
    
    if (logoutFlag === 'true') {
      console.log('Обнаружен предыдущий выход, сбрасываем состояние...');
      // Очищаем данные предыдущей сессии
      clearLoginSession();
      // Сбрасываем флаг выхода
      localStorage.removeItem('samga-logout-flag');
    }
  }, []);
  
  // Функция очистки сессии для повторного входа
  const clearLoginSession = () => {
    // Очищаем ключевые данные авторизации
    localStorage.removeItem('user-iin');
    localStorage.removeItem('user-password');
    
    // Устанавливаем статус, что устройство должно быть заново авторизовано
    localStorage.setItem('device-needs-reauth', 'true');
    
    // Сбрасываем ошибки и состояние процесса
    setIsProcessing(false);
    setNfcError(null);
    setLoginSuccess(false);
    
    console.log('Сессия входа очищена, можно выполнить новый вход');
  };
  
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
  
  // Обработка QR-кода - максимально упрощенная
  const handleScan = (data: { text: string } | null) => {
    if (!data || !data.text || isProcessing) return;
    
    console.log('QR-код считан:', data.text);
    
    // В РЕЖИМЕ РАЗРАБОТКИ ВСЕГДА ИСПОЛЬЗУЕМ ТЕСТОВЫЕ ДАННЫЕ
    if (isDevelopment) {
      console.log('Демо-режим: используем тестовые данные вместо QR');
      handleAuthData(generateTestData());
      return;
    }
    
    // РАБОЧИЙ РЕЖИМ - ПЫТАЕМСЯ ОБРАБОТАТЬ ДАННЫЕ QR
    try {
      let authData: AuthData;
      
      // Пытаемся разными способами получить данные из QR
      try {
        // Попытка парсинга JSON
        authData = JSON.parse(data.text);
      } catch {
        // Если не JSON, используем текст как есть
        authData = {
          iin: data.text.substring(0, Math.min(12, data.text.length)),
          password: data.text.length > 12 ? data.text.substring(12) : 'default',
          deviceId: `qr-device-${Date.now()}`
        };
      }
      
      showToast('QR-код успешно считан', 'success');
      handleAuthData(authData);
    } catch (error) {
      console.error('Ошибка обработки QR:', error);
      showToast('Ошибка при обработке QR-кода', 'error');
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
    
    // Сбрасываем состояние предыдущих входов
    localStorage.removeItem('samga-logout-flag');
    localStorage.removeItem('device-needs-reauth');
    
    try {
      // Сохраняем базовые данные для входа
      localStorage.setItem('user-iin', authData.iin);
      localStorage.setItem('user-password', authData.password);
      localStorage.setItem('samga-current-device-id', authData.deviceId);
      
      // Демо-режим: гарантированный вход
      if (isDevelopment) {
        console.log('ДЕМО-РЕЖИМ: Выполняем вход без API');
        
        // Сохраняем устройство
        saveDeviceInfo(authData.deviceId);
        
        // Показываем успешный результат
        setLoginSuccess(true);
        showToast('Вход выполнен успешно!', 'success');
        
        // Перенаправляем на главную
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
        
        return;
      }
      
      // Режим продакшн: вызов API
      try {
        const result = await login(authData.iin, authData.password);
        
        if (result && result.success) {
          // Успешный вход
          saveDeviceInfo(authData.deviceId);
          setLoginSuccess(true);
          showToast('Вход выполнен успешно!', 'success');
          
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } else {
          // Ошибка API
          const errorMsg = 
            result?.errors?.iin || 
            result?.errors?.password || 
            'Ошибка входа: неверный логин или пароль';
          
          console.error('Ошибка входа:', errorMsg);
          showToast(errorMsg, 'error');
          setIsProcessing(false);
          setNfcError(new Error(errorMsg));
        }
      } catch (apiError) {
        console.error('Ошибка API:', apiError);
        showToast('Ошибка соединения с сервером', 'error');
        setIsProcessing(false);
        setNfcError(new Error('Ошибка соединения'));
      }
    } catch (error: any) {
      console.error('Критическая ошибка:', error);
      showToast('Произошла ошибка: ' + (error.message || 'неизвестная ошибка'), 'error');
      setIsProcessing(false);
      setNfcError(error);
    }
  };
  
  // Функция сохранения информации об устройстве
  const saveDeviceInfo = (deviceId: string) => {
    try {
      let devices: any[] = [];
      const storedDevices = localStorage.getItem('samga-authorized-devices');
      
      if (storedDevices) {
        devices = JSON.parse(storedDevices);
      }
      
      // Новое устройство
      const newDevice = {
        id: deviceId,
        name: getBrowserInfo(),
        lastAccess: new Date().toLocaleString('ru'),
        timestamp: Date.now()
      };
      
      // Обновляем или добавляем устройство
      const existingIndex = devices.findIndex(d => d && d.id === deviceId);
      
      if (existingIndex !== -1) {
        devices[existingIndex] = newDevice;
      } else if (devices.length >= 5) {
        // Ограничение в 5 устройств - заменяем самое старое
        devices.sort((a, b) => a.timestamp - b.timestamp);
        devices[0] = newDevice;
      } else {
        devices.push(newDevice);
      }
      
      localStorage.setItem('samga-authorized-devices', JSON.stringify(devices));
    } catch (e) {
      console.warn('Не удалось сохранить информацию об устройстве:', e);
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
    
    if (activeTab === 'nfc') {
      handleStartNFCReading();
    } else {
      setScannerKey(prev => prev + 1);
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
                clearLoginSession();
                showToast('Состояние сброшено, можно выполнить новый вход', 'info');
              }}
            >
              Сбросить состояние
            </Button>
            <Button 
              variant="outline" 
              className="py-2"
              onClick={() => {
                setScannerKey(prev => prev + 1);
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