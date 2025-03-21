'use client'

import React, { useState } from 'react'
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
import { Spinner, Trash, PhoneSlash, QrCode } from '@phosphor-icons/react'
import { useToast } from '@/lib/providers/ToastProvider'
import { QRCodeSVG } from 'qrcode.react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const DeviceAuthorization = () => {
  const { authorizedDevices, revokeDevice, prepareAuthData } = useDeviceAuth()
  const { isAvailable, startWriting, status, error } = useNFC()
  const { showToast } = useToast()
  
  const [isNFCDialogOpen, setIsNFCDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [authQrData, setAuthQrData] = useState<string>('')
  const [activeTab, setActiveTab] = useState<string>(isAvailable ? 'nfc' : 'qr')
  
  // Начать процесс авторизации (общий метод)
  const handleStartAuth = async () => {
    setIsNFCDialogOpen(true)
    try {
      const authData = prepareAuthData()
      if (authData) {
        setAuthQrData(authData)
        
        if (isAvailable && activeTab === 'nfc') {
          await startWriting(authData)
        }
        
        showToast('Данные готовы к передаче', 'success')
      } else {
        showToast('Не удалось подготовить данные для передачи', 'error')
        setIsNFCDialogOpen(false)
      }
    } catch (e) {
      showToast('Ошибка при подготовке данных', 'error')
      setIsNFCDialogOpen(false)
    }
  }
  
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
      
      {/* Список авторизованных устройств */}
      {authorizedDevices.length > 0 ? (
        <div className="space-y-4">
          {authorizedDevices.map((device) => (
            <Card key={device.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{device.name}</CardTitle>
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
              Поднесите устройство или отсканируйте QR-код для авторизации.
            </DialogDescription>
          </DialogHeader>
          
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
                <>
                  <QRCodeSVG value={authQrData} size={200} />
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    Отсканируйте этот QR-код на устройстве, на котором вы хотите авторизоваться.
                    <br />
                    На странице входа выберите "Войти с помощью другого устройства".
                  </p>
                </>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  Подготовка QR-кода...
                </p>
              )}
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsNFCDialogOpen(false)}>
              Закрыть
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