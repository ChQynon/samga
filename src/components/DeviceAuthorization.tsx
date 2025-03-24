'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useDeviceAuth } from '@/lib/hooks/useDeviceAuth'
import { DeviceInfo } from '@/lib/hooks/useNFC'
import { useNFC } from '@/lib/hooks/useNFC'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter,
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Spinner, Trash, PhoneSlash, QrCode, CheckCircle, Warning, X } from '@phosphor-icons/react'
import { Phone as Smartphone } from '@phosphor-icons/react'
import { useToast } from '@/lib/providers/ToastProvider'
import { QRCodeSVG } from 'qrcode.react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface SourceDevice {
  name: string;
  id: string;
}

interface FormattedDevice extends DeviceInfo {
  formattedTime?: string;
  isCurrent?: boolean;
  isNFCAuthorized?: boolean;
}

const DeviceAuthorization = () => {
  const [showQrDialog, setShowQrDialog] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showRevokeDialog, setShowRevokeDialog] = useState(false)
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('qr')
  const { showToast } = useToast()
  
  const { 
    authorizedDevices, 
    remainingSlots,
    authorizeDevice, 
    revokeDevice, 
    prepareAuthData,
    clearAllDevices
  } = useDeviceAuth()
  
  const { isAvailable, startWriting, status, error } = useNFC()
  
  const [lastConnectedDevice, setLastConnectedDevice] = useState<DeviceInfo | null>(null)
  const [sourceDevice, setSourceDevice] = useState<SourceDevice | null>(null)
  const [authQrData, setAuthQrData] = useState<string>('')
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Вспомогательная функция для форматирования времени
  const formatTime = (timestamp?: number): string => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Форматирование списка устройств с добавлением признака текущего
  const formatDeviceList = (devices: DeviceInfo[] | null): FormattedDevice[] => {
    if (!devices) {
      console.log('Нет устройств для форматирования');
      return [];
    }
    
    console.log('Форматируем список устройств, количество:', devices.length);
    
    // Получаем ID текущего устройства
    let currentDeviceId = null;
    if (typeof window !== 'undefined') {
      try {
        currentDeviceId = localStorage.getItem('samga-current-device-id');
        console.log('ID текущего устройства:', currentDeviceId);
      } catch (error) {
        console.error('Ошибка при чтении из localStorage:', error);
      }
    }
    
    // Проверка на emergency-device-id
    if (!currentDeviceId && typeof window !== 'undefined') {
      try {
        const emergencyId = localStorage.getItem('emergency-device-id');
        if (emergencyId) {
          console.log('Найден аварийный ID устройства:', emergencyId);
          currentDeviceId = emergencyId;
        }
      } catch (e) {
        console.error('Ошибка при проверке аварийного ID:', e);
      }
    }
    
    // Логируем все устройства для отладки
    devices.forEach((device, index) => {
      console.log(`Устройство ${index+1}:`, device.id, device.name);
    });
    
    const formattedList = devices.map(device => {
      // Флаг текущего устройства
      const isCurrent = device.id === currentDeviceId;
      if (isCurrent) {
        console.log('Найдено текущее устройство:', device.id);
      }
      
      // Проверяем флаг isNFCAuthorized или типичные признаки NFC устройства
      const isNFCAuth = device.isNFCAuthorized || 
                        (typeof window !== 'undefined' && 
                         localStorage.getItem('device-nfc-authorized') === 'true' && 
                         isCurrent);
      
      return {
        ...device,
        formattedTime: formatTime(device.timestamp),
        isCurrent,
        isNFCAuthorized: isNFCAuth
      };
    });
    
    console.log('Форматирование завершено, форматированных устройств:', formattedList.length);
    return formattedList;
  };
  
  // Получаем форматированный список устройств
  const formattedDevices = formatDeviceList(authorizedDevices);
  
  // Состояние для отслеживания устройства, подключенного через NFC/QR
  const [isNfcAuthorized, setIsNfcAuthorized] = useState(false);
  
  // Принудительная перезагрузка списка устройств из localStorage при монтировании компонента
  useEffect(() => {
    try {
      console.log('Принудительная перезагрузка списка устройств');
      
      // Проверяем, подключено ли устройство через NFC/QR
      if (typeof window !== 'undefined') {
        const isNfcAuth = localStorage.getItem('device-nfc-authorized') === 'true';
        setIsNfcAuthorized(isNfcAuth);
        
        // Проверка на обновление списка устройств
        const forceUpdate = localStorage.getItem('force-update-devices');
        if (forceUpdate) {
          // Пытаемся принудительно найти текущее устройство
          const currentId = localStorage.getItem('samga-current-device-id');
          
          if (currentId) {
            // Перезагружаем список устройств
            const storedDevices = localStorage.getItem('samga-authorized-devices');
            if (storedDevices) {
              try {
                const devices = JSON.parse(storedDevices);
                console.log('Проверка на наличие текущего устройства в списке');
                
                // Проверяем, есть ли текущее устройство в списке
                const hasCurrentDevice = devices.some((dev: any) => dev.id === currentId);
                
                if (!hasCurrentDevice) {
                  // Если устройства нет в списке, принудительно обновляем страницу
                  console.log('Устройство не найдено в списке, обновляем страницу');
                  setTimeout(() => window.location.reload(), 500);
                }
              } catch (e) {
                console.error('Ошибка при проверке списка устройств:', e);
              }
            }
          }
          
          // Удаляем флаг обновления
          localStorage.removeItem('force-update-devices');
        }
      }
      
      const storedDevices = localStorage.getItem('samga-authorized-devices');
      if (storedDevices) {
        try {
          const devices = JSON.parse(storedDevices);
          console.log('Загружено устройств напрямую из localStorage:', devices.length);
          
          // Проверяем, что это массив
          if (Array.isArray(devices) && devices.length > 0) {
            console.log('Устройства найдены в localStorage:', devices.length);
            // Отладочная информация о первом устройстве
            if (devices[0]) {
              console.log('Пример устройства:', devices[0].id, devices[0].name);
            }
          } else {
            console.warn('В localStorage нет устройств или данные повреждены');
          }
        } catch (e) {
          console.error('Ошибка при парсинге устройств из localStorage:', e);
        }
      } else {
        console.log('В localStorage нет сохраненных устройств');
      }
    } catch (e) {
      console.error('Ошибка при прямом чтении из localStorage:', e);
    }
  }, []);
  
  // Начать процесс авторизации (общий метод)
  const handleStartAuth = async () => {
    // Если достигнут лимит устройств
    if (remainingSlots <= 0) {
      showToast(`Достигнут лимит в 5 устройств. Отзовите доступ у неиспользуемых устройств.`, 'error')
      return
    }
    
    // Если текущее устройство авторизовано через другое устройство, запрещаем авторизацию
    if (!authorizeDevice) {
      showToast('Нельзя авторизовать другие устройства с устройства, которое само было авторизовано', 'error')
      return
    }
    
    setShowQrDialog(true)
    setShowSuccess(false)
    setLastConnectedDevice(null)
    setSourceDevice(null)
    
    try {
      const authData = prepareAuthData()
      if (authData && authData !== 'limit_exceeded') {
        setAuthQrData(authData)
        
        if (isAvailable && activeTab === 'nfc') {
          await startWriting(authData)
        }
        
        showToast('Данные готовы к передаче', 'success')
        
        // ОТКЛЮЧАЕМ автоматическое демо-подключение на production
        // в режиме разработки, демо подключение происходит только при нажатии кнопки
        // if (authData !== 'error' && process.env.NODE_ENV === 'development') {
        //   setTimeout(() => {
        //     // Создаем имитацию успешно подключенного устройства
        //     const dummyDevice: DeviceInfo = {
        //       id: 'test-device-id-' + Date.now(),
        //       name: 'iPhone на iOS (Демо)',
        //       browser: 'Safari',
        //       lastAccess: new Date().toLocaleString('ru'),
        //       timestamp: new Date().getTime(),
        //       isNFCAuthorized: true
        //     }
        //     setLastConnectedDevice(dummyDevice)
        //     
        //     // Имитация информации об источнике
        //     setSourceDevice({
        //       name: 'Chrome на Windows (Текущее устройство)',
        //       id: 'main-device'
        //     })
        //     
        //     // Добавляем реальное устройство в список
        //     const updatedDevices = [...authorizedDevices, dummyDevice];
        //     localStorage.setItem('samga-authorized-devices', JSON.stringify(updatedDevices));
        //     // Показать анимацию зеленого свечения
        //     document.body.classList.add('connection-success-glow');
        //     setTimeout(() => {
        //       document.body.classList.remove('connection-success-glow');
        //     }, 2000);
        //     
        //     setShowSuccess(true)
        //     window.location.reload(); // Перезагружаем страницу для обновления списка
        //   }, 3000) // Показываем через 3 секунды для демонстрации
        // }
      } else if (authData === 'limit_exceeded') {
        showToast(`Достигнут лимит в 5 устройств. Отзовите доступ у неиспользуемых устройств.`, 'error')
        setShowQrDialog(false)
      } else {
        showToast('Не удалось подготовить данные для передачи. Возможно, вы не вошли в систему или не сохранили данные при входе.', 'error')
        // Не закрываем диалог, показываем сообщение об ошибке
        setAuthQrData('error')
      }
    } catch (e) {
      console.error('Ошибка при подготовке данных:', e)
      showToast('Ошибка при подготовке данных', 'error')
      setAuthQrData('error')
    }
  }
  
  // Храним текущее количество устройств для определения, когда добавилось новое
  const [prevDevicesLength, setPrevDevicesLength] = useState(0);
  
  // Получаем последнее добавленное устройство при обновлении списка устройств
  useEffect(() => {
    // Проверяем, что добавилось новое устройство, а не отображается старое
    if (authorizedDevices.length > prevDevicesLength && showQrDialog) {
      const lastDevice = authorizedDevices[authorizedDevices.length - 1]
      if (lastDevice) {
        // Обновляем счетчик устройств
        setPrevDevicesLength(authorizedDevices.length);
        
        setLastConnectedDevice(lastDevice)
        setShowSuccess(true)
        
        // Показать анимацию зеленого свечения
        document.body.classList.add('connection-success-glow');
        setTimeout(() => {
          document.body.classList.remove('connection-success-glow');
        }, 2000);
        
        // Попытка извлечь информацию об устройстве-источнике из localStorage
        try {
          if (typeof window !== 'undefined') {
            const authDataJson = localStorage.getItem('last-auth-source')
            if (authDataJson) {
              const authData = JSON.parse(authDataJson)
              if (authData.sourceDevice) {
                setSourceDevice(authData.sourceDevice)
              }
            }
          }
        } catch (error) {
          console.error('Ошибка при получении информации об устройстве-источнике:', error)
        }
      }
    } else {
      // Обновляем счетчик устройств без показа диалога
      setPrevDevicesLength(authorizedDevices.length);
    }
  }, [authorizedDevices, showQrDialog])
  
  // Запрос на отзыв доступа
  const handleRequestRevoke = (deviceId: string) => {
    setSelectedDeviceId(deviceId)
    setShowRevokeDialog(true)
  }
  
  // Подтверждение отзыва доступа
  const handleConfirmRevoke = () => {
    if (selectedDeviceId) {
      const success = revokeDevice(selectedDeviceId)
      if (success) {
        showToast('Доступ устройства отозван', 'success')
      } else {
        showToast('Не удалось отозвать доступ устройства', 'error')
      }
    }
    setShowRevokeDialog(false)
    setSelectedDeviceId(null)
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-medium">Устройства с доступом к аккаунту</h3>
        <p className="text-sm text-muted-foreground">
          Здесь вы можете управлять устройствами, которым был предоставлен доступ к вашему аккаунту.
          Максимальное количество устройств: 5.
        </p>
      </div>
      
      {/* Предупреждение для устройств, авторизованных через другие устройства */}
      {!authorizeDevice && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          <p className="font-medium">Ограниченный доступ</p>
          <p className="mt-1">
            Это устройство было авторизовано через другое устройство. 
            Вы не можете использовать его для авторизации новых устройств.
          </p>
        </div>
      )}
      
      {/* Дополнительное предупреждение для устройств, авторизованных через NFC/QR */}
      {isNfcAuthorized && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 mt-2">
          <p className="font-medium">Подключено через NFC/QR</p>
          <p className="mt-1">
            Это устройство было подключено через NFC или QR-код.
            Оно имеет ограниченный доступ и не может авторизовать другие устройства.
          </p>
        </div>
      )}
      
      {/* Информация о лимите устройств */}
      <div className="rounded-lg border p-4 flex justify-between items-center">
        <div>
          <p className="text-sm font-medium">Подключенные устройства</p>
          <p className="text-xs text-muted-foreground">
            {authorizedDevices.length} из 5 устройств используются
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {Array(5).fill(0).map((_, index) => (
              <div 
                key={index} 
                className={`w-2 h-5 rounded-sm ${index < authorizedDevices.length ? 'bg-primary' : 'bg-muted'}`}
              ></div>
            ))}
          </div>
          {process.env.NODE_ENV === 'development' && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-muted-foreground/70 hover:text-destructive"
              onClick={() => {
                if (clearAllDevices) {
                  clearAllDevices();
                  showToast('Все устройства удалены', 'success');
                  setTimeout(() => window.location.reload(), 500);
                }
              }}
              title="Сбросить все устройства (для отладки)"
            >
              <Trash size={16} />
            </Button>
          )}
        </div>
      </div>
      
      {/* Список устройств */}
      <div className="space-y-2 mt-3">
        {formattedDevices.length > 0 ? (
          formattedDevices.map((device) => (
            <div
              key={device.id}
              className={cn(
                "relative flex items-center justify-between p-3 rounded-md shadow-sm",
                device.isCurrent ? "bg-primary/10 border border-primary/30" : "bg-muted"
              )}
            >
              <div className="flex items-center space-x-3">
                {device.isCurrent && (
                  <div className="absolute -left-1 -top-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <span className="text-[10px] font-bold">ВЫ</span>
                  </div>
                )}
                <div className="p-2 rounded-full bg-background">
                  <Smartphone size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium">{device.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {device.isCurrent 
                      ? "Текущее устройство" 
                      : `Подключено: ${device.formattedTime || device.lastAccess || 'неизвестно'}`
                    }
                    {device.isNFCAuthorized && <span className="ml-1 text-blue-500">(через NFC/QR)</span>}
                  </p>
                  {device.isNFCAuthorized && device.isCurrent && (
                    <p className="text-xs text-yellow-600 mt-1">
                      Связанное устройство с ограниченным доступом
                    </p>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleRequestRevoke(device.id)}
                disabled={device.isCurrent}
              >
                <X size={16} />
              </Button>
            </div>
          ))
        ) : (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Нет подключенных устройств</p>
          </div>
        )}
      </div>
      
      {/* Кнопка для добавления нового устройства */}
      <div className="pt-4">
        <Button
          onClick={handleStartAuth}
          className="w-full"
          disabled={!authorizeDevice || remainingSlots <= 0}
        >
          Авторизовать новое устройство
          {remainingSlots > 0 && <span className="ml-2 text-xs">({remainingSlots} из 5 доступно)</span>}
        </Button>
      </div>
      
      {/* Диалог для авторизации */}
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Авторизация устройства</DialogTitle>
            <DialogDescription>
              {!showSuccess 
                ? "Поднесите устройство или отсканируйте QR-код для авторизации." 
                : "Устройство успешно авторизовано!"}
            </DialogDescription>
          </DialogHeader>
          
          {!showSuccess ? (
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                {isAvailable && (
                  <TabsTrigger value="nfc">NFC</TabsTrigger>
                )}
                <TabsTrigger value="qr" className={isAvailable ? '' : 'col-span-2'}>QR-код</TabsTrigger>
              </TabsList>
              
              {isAvailable && (
                <TabsContent value="nfc" className="flex flex-col items-center justify-center py-6">
                  {status === 'writing' && (
                    <>
                      <Spinner size={48} className="animate-spin text-primary" />
                      <p className="mt-4 text-center text-sm text-muted-foreground">
                        Подготовка данных...
                        <br />
                        Поднесите устройство к другому телефону.
                      </p>
                    </>
                  )}
                  
                  {status === 'error' && (
                    <p className="text-center text-sm text-red-600">
                      Произошла ошибка: {error?.message}
                    </p>
                  )}
                  
                  {status === 'idle' && (
                    <p className="text-center text-sm text-green-600">
                      Данные готовы к передаче. Поднесите устройства друг к другу.
                    </p>
                  )}
                </TabsContent>
              )}
              
              <TabsContent value="qr" className="flex flex-col items-center justify-center py-6">
                {authQrData ? (
                  authQrData === 'error' ? (
                    <div className="text-center">
                      <div className="rounded-full bg-red-100 p-3 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                        <PhoneSlash className="h-8 w-8 text-red-600" />
                      </div>
                      <p className="text-center text-sm text-red-600 mb-2">
                        Не удалось подготовить данные для QR-кода.
                      </p>
                      <p className="text-center text-xs text-muted-foreground">
                        Убедитесь, что вы вошли в систему и сохранили данные входа.
                        <br />
                        Если вы используете эту функцию впервые, сначала войдите обычным способом.
                      </p>
                      <Button 
                        className="mt-4" 
                        variant="outline"
                        onClick={() => window.location.href = '/login'}
                      >
                        Перейти на страницу входа
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-base font-medium mb-4">Отсканируйте QR-код</h3>
                        
                        <QRCodeSVG
                          value={authQrData}
                          size={320}
                          level="L"
                          includeMargin={true}
                          bgColor="#FFFFFF"
                          fgColor="#000000"
                        />
                        
                        <p className="mt-4 text-sm text-center text-muted-foreground">
                          Отсканируйте QR-код на устройстве для авторизации
                        </p>
                      </div>
                    </>
                  )
                ) : (
                  <p className="text-center text-sm text-muted-foreground">
                    Подготовка QR-кода...
                  </p>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="py-8 flex flex-col items-center">
              <div className="mb-6 flex flex-col items-center">
                <div className="animate-pulse w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <div className="animate-scale-in">
                    <CheckCircle size={40} className="text-green-600" weight="fill" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-green-700">
                  Подключено успешно!
                </h3>
              </div>
              
              {lastConnectedDevice && (
                <div className="w-full bg-slate-50 rounded-lg p-4 mb-4 animate-slide-in relative success-card">
                  <div className="success-pulse absolute inset-0 rounded-lg"></div>
                  <div className="flex items-center gap-2 mb-2 relative z-10">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <p className="font-medium">{lastConnectedDevice.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground relative z-10">
                    Устройство получило доступ {lastConnectedDevice.lastAccess}
                  </p>
                  
                  {sourceDevice && (
                    <div className="mt-2 pt-2 border-t border-slate-200 relative z-10">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span>Авторизовано через:</span>
                        <span className="font-medium">{sourceDevice.name}</span>
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-3 pt-2 border-t border-slate-200 relative z-10">
                    <p className="text-xs text-yellow-600">
                      <span className="font-medium">Важно:</span> Это устройство имеет ограниченный доступ
                      и не сможет авторизовать другие устройства.
                    </p>
                  </div>
                </div>
              )}
              
              <p className="text-center text-sm text-muted-foreground mb-4">
                Устройство успешно авторизовано и теперь имеет доступ к вашему аккаунту.
                Вы можете отозвать доступ в любое время на этой странице.
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowQrDialog(false)}>
              {showSuccess ? 'Готово' : 'Закрыть'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Диалог подтверждения отзыва доступа */}
      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Подтвердите действие</DialogTitle>
            <DialogDescription>
              Вы действительно хотите отозвать доступ для этого устройства?
              После этого устройство больше не сможет войти в ваш аккаунт.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-2 sm:justify-end">
            <Button 
              variant="secondary" 
              onClick={() => setShowRevokeDialog(false)}
            >
              Отмена
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmRevoke}
            >
              Отозвать доступ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <style jsx global>{`
        @keyframes qrScanAnimation {
          0% { transform: translateY(-150px); }
          50% { transform: translateY(150px); }
          100% { transform: translateY(-150px); }
        }
        
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-slide-in {
          animation: slideIn 0.4s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        
        /* Анимация зеленого свечения при успешном подключении */
        @keyframes connectionSuccessGlow {
          0% { box-shadow: inset 0 0 0 0 rgba(34, 197, 94, 0); }
          40% { box-shadow: inset 0 0 20px 10px rgba(34, 197, 94, 0.3); }
          100% { box-shadow: inset 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        
        .connection-success-glow {
          animation: connectionSuccessGlow 2s ease-out forwards;
        }
        
        /* Пульсирующий эффект в карточке устройства */
        @keyframes successPulse {
          0% { 
            background-color: rgba(34, 197, 94, 0.05);
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.1);
          }
          50% { 
            background-color: rgba(34, 197, 94, 0.1);
            box-shadow: 0 0 10px 5px rgba(34, 197, 94, 0.2);
          }
          100% { 
            background-color: rgba(34, 197, 94, 0.05);
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.1);
          }
        }
        
        .success-pulse {
          animation: successPulse 2s ease-in-out infinite;
        }
        
        .success-card {
          overflow: hidden;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }
      `}</style>
    </div>
  )
}

export default DeviceAuthorization 