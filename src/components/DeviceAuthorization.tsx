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
import { Spinner, Trash, PhoneSlash, QrCode, CheckCircle } from '@phosphor-icons/react'
import { Phone as Smartphone } from '@phosphor-icons/react'
import { useToast } from '@/lib/providers/ToastProvider'
import { QRCodeSVG } from 'qrcode.react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const DeviceAuthorization = () => {
  const { authorizedDevices, revokeDevice, prepareAuthData, isCurrentDeviceShared, canAuthorizeOthers } = useDeviceAuth()
  const { isAvailable, startWriting, status, error } = useNFC()
  const { showToast } = useToast()
  
  const [isNFCDialogOpen, setIsNFCDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [authQrData, setAuthQrData] = useState<string>('')
  const [activeTab, setActiveTab] = useState<string>(isAvailable ? 'nfc' : 'qr')
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastConnectedDevice, setLastConnectedDevice] = useState<DeviceInfo | null>(null)
  
  // Начать процесс авторизации (общий метод)
  const handleStartAuth = async () => {
    // Если текущее устройство авторизовано через другое устройство, запрещаем авторизацию
    if (!canAuthorizeOthers) {
      showToast('Нельзя авторизовать другие устройства с устройства, которое само было авторизовано', 'error')
      return
    }
    
    setIsNFCDialogOpen(true)
    setShowSuccess(false)
    setLastConnectedDevice(null)
    
    try {
      const authData = prepareAuthData()
      if (authData) {
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
            setShowSuccess(true)
          }, 5000) // Показываем через 5 секунд для демонстрации
        }
        
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
    if (authorizedDevices.length > 0 && isNFCDialogOpen) {
      const lastDevice = authorizedDevices[authorizedDevices.length - 1]
      if (lastDevice) {
        setLastConnectedDevice(lastDevice)
        setShowSuccess(true)
      }
    }
  }, [authorizedDevices, isNFCDialogOpen])
  
  // Запрос на отзыв доступа
  const handleRequestRevoke = (deviceId: string) => {
    setSelectedDeviceId(deviceId)
    setConfirmDialogOpen(true)
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
    setConfirmDialogOpen(false)
    setSelectedDeviceId(null)
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-medium">Устройства с доступом к аккаунту</h3>
        <p className="text-sm text-muted-foreground">
          Здесь вы можете управлять устройствами, которым был предоставлен доступ к вашему аккаунту.
        </p>
      </div>
      
      {/* Предупреждение для устройств, авторизованных через другие устройства */}
      {!canAuthorizeOthers && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          <p className="font-medium">Ограниченный доступ</p>
          <p className="mt-1">
            Это устройство было авторизовано через другое устройство. 
            Вы не можете использовать его для авторизации новых устройств.
          </p>
        </div>
      )}
      
      {/* Список авторизованных устройств */}
      {authorizedDevices.length > 0 ? (
        <div className="space-y-4">
          {authorizedDevices.map((device) => (
            <Card key={device.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{device.name}</CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleRequestRevoke(device.id)}
                  >
                    <PhoneSlash className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
                <CardDescription className="text-xs">
                  Последний вход: {device.lastAccess}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">
            У вас нет авторизованных устройств.
          </p>
        </div>
      )}
      
      {/* Кнопка для добавления нового устройства */}
      <div className="pt-4">
        <Button
          onClick={handleStartAuth}
          className="w-full"
          disabled={!canAuthorizeOthers}
        >
          Авторизовать новое устройство
        </Button>
      </div>
      
      {/* Диалог для авторизации */}
      <Dialog open={isNFCDialogOpen} onOpenChange={setIsNFCDialogOpen}>
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
                </div>
              )}
              
              <p className="text-center text-sm text-muted-foreground mb-4">
                Устройство успешно авторизовано и теперь имеет доступ к вашему аккаунту.
                Вы можете отозвать доступ в любое время на этой странице.
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsNFCDialogOpen(false)}>
              {showSuccess ? 'Готово' : 'Закрыть'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Диалог подтверждения отзыва доступа */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
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
              onClick={() => setConfirmDialogOpen(false)}
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