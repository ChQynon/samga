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
    prepareAuthData 
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
    if (!devices) return [];
    
    // Получаем ID текущего устройства
    let currentDeviceId = null;
    if (typeof window !== 'undefined') {
      try {
        currentDeviceId = localStorage.getItem('samga-current-device-id');
      } catch (error) {
        console.error('Ошибка при чтении из localStorage:', error);
      }
    }
    
    return devices.map(device => {
      // Флаг текущего устройства
      const isCurrent = device.id === currentDeviceId;
      
      return {
        ...device,
        formattedTime: formatTime(device.timestamp),
        isCurrent // Добавляем признак текущего устройства
      };
    });
  };
  
  // Получаем форматированный список устройств
  const formattedDevices = formatDeviceList(authorizedDevices);
  
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
        
        // Имитация успешного подключения для демонстрации анимации
        if (authData !== 'error' && process.env.NODE_ENV === 'development') {
          setTimeout(() => {
            // Создаем имитацию успешно подключенного устройства
            const dummyDevice: DeviceInfo = {
              id: 'test-device-id',
              name: 'iPhone на iOS (Демо)',
              browser: 'Safari',
              lastAccess: new Date().toLocaleString('ru'),
              timestamp: new Date().getTime()
            }
            setLastConnectedDevice(dummyDevice)
            
            // Имитация информации об источнике
            setSourceDevice({
              name: 'Chrome на Windows (Текущее устройство)',
              id: 'main-device'
            })
            
            setShowSuccess(true)
          }, 5000) // Показываем через 5 секунд для демонстрации
        }
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
  
  // Получаем последнее добавленное устройство при обновлении списка устройств
  useEffect(() => {
    if (authorizedDevices.length > 0 && showQrDialog) {
      const lastDevice = authorizedDevices[authorizedDevices.length - 1]
      if (lastDevice) {
        setLastConnectedDevice(lastDevice)
        setShowSuccess(true)
        
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
      
      {/* Информация о лимите устройств */}
      <div className="rounded-lg border p-4 flex justify-between items-center">
        <div>
          <p className="text-sm font-medium">Подключенные устройства</p>
          <p className="text-xs text-muted-foreground">
            {authorizedDevices.length} из 5 устройств используются
          </p>
        </div>
        <div className="flex items-center gap-1">
          {Array(5).fill(0).map((_, index) => (
            <div 
              key={index} 
              className={`w-2 h-5 rounded-sm ${index < authorizedDevices.length ? 'bg-primary' : 'bg-muted'}`}
            ></div>
          ))}
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
                  </p>
                </div>
              </div>
              
              {!device.isCurrent && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRequestRevoke(device.id)}
                >
                  <X size={16} />
                </Button>
              )}
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
                      <div className="relative">
                        <QRCodeSVG value={authQrData} size={200} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-full rounded-lg border-4 border-primary/30 animate-pulse" />
                        </div>
                      </div>
                      <p className="mt-4 text-center text-sm text-muted-foreground">
                        Отсканируйте этот QR-код на устройстве, на котором вы хотите авторизоваться.
                        <br />
                        На странице входа выберите "Войти с помощью другого устройства".
                      </p>
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
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle size={40} className="text-green-600" weight="fill" />
                </div>
                <h3 className="text-lg font-medium text-green-700">
                  Подключено успешно!
                </h3>
              </div>
              
              {lastConnectedDevice && (
                <div className="w-full bg-slate-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <p className="font-medium">{lastConnectedDevice.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Устройство получило доступ {lastConnectedDevice.lastAccess}
                  </p>
                  
                  {sourceDevice && (
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span>Авторизовано через:</span>
                        <span className="font-medium">{sourceDevice.name}</span>
                      </p>
                    </div>
                  )}
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
    </div>
  )
}

export default DeviceAuthorization 