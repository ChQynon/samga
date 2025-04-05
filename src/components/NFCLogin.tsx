'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useNFC } from '@/lib/hooks/useNFC'
import type { NDEFReaderEventResult, DeviceInfo } from '@/lib/hooks/useNFC'
import { Spinner, X, QrCode, ArrowsClockwise, Camera } from '@phosphor-icons/react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { PhoneCall } from '@phosphor-icons/react'
import QrScanner from 'react-qr-scanner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '@/lib/providers/ToastProvider'
import { LoadingIcon } from './icons'
import { NfcIcon } from 'lucide-react'

// Интерфейс для взаимодействия с сервером
interface SignInResult {
  success: boolean
  error?: string
}

// Имитация функции входа
const signIn = async (credentials: { iin: string, password: string }): Promise<SignInResult> => {
  // В реальной реализации здесь будет вызов API
  console.log('Выполняем вход с данными:', credentials)
  return { success: true }
}

type AuthData = {
  iin: string
  password: string
  deviceId: string
}

interface NFCLoginProps {
  onAuthReceived?: (deviceId: string, iin: string, password: string) => void;
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

export default function NFCLogin({ onAuthReceived }: NFCLoginProps) {
  const { isAvailable, startReading, status, stopNFC, startScan, isScanning, isSupported } = useNFC()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>(isAvailable ? 'nfc' : 'qr')
  const [scanError, setScanError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [key, setKey] = useState<number>(0)
  const { showToast: toast } = useToast()
  const [qrValue, setQrValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [supported, setSupported] = useState<boolean | null>(null)
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    const handleAuthData = (event: Event) => {
      const customEvent = event as CustomEvent<AuthData>
      const { iin, password, deviceId } = customEvent.detail
      
      // Добавляем устройство в список авторизованных
      try {
        // Получаем текущий список устройств
        const storedDevices = localStorage.getItem('samga-authorized-devices') || '[]'
        const devices = JSON.parse(storedDevices) as DeviceInfo[]
        
        // Создаем новое устройство
        const now = new Date()
        const newDevice: DeviceInfo = {
          id: deviceId,
          name: getBrowserInfo(),
          browser: navigator.userAgent,
          lastAccess: now.toLocaleString('ru'),
          timestamp: now.getTime()
        }
        
        // Проверяем, не превышен ли лимит (5 устройств)
        if (devices.length >= 5) {
          toast('Вы достигли максимального количества подключенных устройств (5)', 'error')
          return
        }
        
        // Добавляем новое устройство
        devices.push(newDevice)
        localStorage.setItem('samga-authorized-devices', JSON.stringify(devices))
      } catch (e) {
        console.error('Ошибка при добавлении устройства в список:', e)
      }
      
      setDialogOpen(false)
      
      if (onAuthReceived) {
        onAuthReceived(deviceId, iin, password)
      }
    }
    
    window.addEventListener('nfc-auth-data', handleAuthData)
    
    return () => {
      window.removeEventListener('nfc-auth-data', handleAuthData)
    }
  }, [onAuthReceived, toast])
  
  useEffect(() => {
    // Проверяем поддержку NFC в браузере
    if (typeof window !== 'undefined') {
      setSupported(!!window.NDEFReader)
    }
  }, [])
  
  const handleStartScanning = async () => {
    setDialogOpen(true)
    setScanError(null)
    
    if (isAvailable && activeTab === 'nfc') {
      await startReading()
    }
  }
  
  const handleClose = () => {
    setDialogOpen(false)
    if (isAvailable) {
      stopNFC()
    }
  }
  
  const handleQrScan = (data: any) => {
    if (data && data.text) {
      try {
        const authData = JSON.parse(data.text)
        if (authData.iin && authData.password && authData.deviceId) {
          setDialogOpen(false)
          
          if (onAuthReceived) {
            onAuthReceived(authData.deviceId, authData.iin, authData.password)
          }
        } else {
          setScanError('Неверный формат QR-кода')
        }
      } catch (e) {
        console.error('Ошибка при обработке QR-кода:', e)
        setScanError('Не удалось обработать QR-код')
      }
    }
  }
  
  const handleQrError = (err: any) => {
    console.error('Ошибка сканирования QR-кода:', err)
    setScanError('Ошибка сканирования QR-кода')
  }
  
  const toggleCamera = () => {
    setFacingMode(prevMode => prevMode === 'environment' ? 'user' : 'environment')
    setKey(prevKey => prevKey + 1)
  }

  // Обработка данных, полученных от QR-кода
  const handleScan = useCallback(
    (data: { text: string } | null) => {
      if (data && data.text && !isLoading) {
        try {
          setQrValue(data.text)
          const authData = JSON.parse(data.text)
          handleAuth(authData)
        } catch (e) {
          console.error('Ошибка при обработке QR-кода:', e)
        }
      }
    },
    [isLoading]
  )

  // Обработка данных авторизации
  const handleAuth = useCallback(async (authData: {
    iin: string
    password: string
    deviceId: string
    sourceDevice?: {
      name: string
      id: string
    }
  }) => {
    try {
      console.log('Получены данные:', authData)
      
      // Для текущего устройства сохраняем его ID
      localStorage.setItem('samga-current-device-id', authData.deviceId)
      
      // Устанавливаем флаг, что устройство авторизовано через NFC
      localStorage.setItem('device-nfc-authorized', 'true')
      
      // Сохраняем информацию об источнике для последующего отображения
      if (authData.sourceDevice) {
        console.log('Сохраняем информацию об устройстве-источнике:', authData.sourceDevice)
        localStorage.setItem('last-auth-source', JSON.stringify({
          sourceDevice: authData.sourceDevice
        }))
      } else {
        console.warn('Нет информации об устройстве-источнике')
      }
      
      // ГАРАНТИРОВАННО ДОБАВЛЯЕМ УСТРОЙСТВО В СПИСОК
      try {
        // Получаем текущий список устройств
        let devices = [];
        const storedDevices = localStorage.getItem('samga-authorized-devices');
        
        if (storedDevices) {
          try {
            devices = JSON.parse(storedDevices);
            console.log('Загружено устройств:', devices.length);
          } catch (e) {
            console.error('Ошибка при парсинге списка устройств:', e);
            devices = [];
          }
        }
        
        // Добавляем новое устройство в список, если оно еще не существует
        const exists = devices.some((dev: any) => dev.id === authData.deviceId);
        
        if (!exists) {
          // Создаем информацию об устройстве
          const deviceInfo = {
            id: authData.deviceId,
            name: getBrowserInfo(),
            browser: navigator.userAgent,
            lastAccess: new Date().toLocaleString('ru'),
            timestamp: new Date().getTime(),
            isNFCAuthorized: true // Важно для отображения
          };
          
          // Проверяем лимит устройств
          if (devices.length >= 5) {
            // Если лимит достигнут, удаляем самое старое устройство
            devices.sort((a: any, b: any) => a.timestamp - b.timestamp);
            devices.shift(); // Удаляем самое старое
          }
          
          // Добавляем новое устройство
          devices.push(deviceInfo);
          
          // Сохраняем обновленный список
          localStorage.setItem('samga-authorized-devices', JSON.stringify(devices));
          console.log('Устройство добавлено в список:', deviceInfo.id);
          
          // Сохраняем дополнительную информацию
          localStorage.setItem('current-device-info', JSON.stringify(deviceInfo));
        } else {
          console.log('Устройство уже существует в списке:', authData.deviceId);
        }
      } catch (e) {
        console.error('Ошибка при добавлении устройства в список:', e);
      }
      
      // Устанавливаем флаг для обновления списка устройств
      localStorage.setItem('force-update-devices', 'true');
      
      setIsLoading(true)
      
      // Выполняем авторизацию
      const result = await signIn({
        iin: authData.iin,
        password: authData.password
      })
      
      setIsLoading(false)
      
      if (result.success) {
        toast('Успешная авторизация', 'success')
        setLoginSuccess(true)
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
      } else {
        toast('Ошибка авторизации', 'error')
      }
    } catch (error) {
      console.error('Ошибка при обработке данных:', error)
      toast('Ошибка при обработке данных авторизации', 'error')
      setIsLoading(false)
    }
  }, [signIn, toast])

  // Обработчик данных с NFC
  const handleNFCData = useCallback(
    (data: NDEFReaderEventResult) => {
      try {
        // Проверяем наличие сообщения NFC
        if (data.message) {
          // Извлекаем первую запись
          const record = data.message.records[0]
          if (record && record.data) {
            // Декодируем данные
            const decoder = new TextDecoder()
            const text = decoder.decode(record.data)
            const authData = JSON.parse(text)
            
            // Обрабатываем данные авторизации
            handleAuth(authData)
          }
        }
      } catch (error) {
        console.error('Ошибка при обработке NFC данных:', error)
        toast('Ошибка NFC', 'error')
      }
    },
    [handleAuth]
  )

  // Запускаем сканирование NFC при нажатии на кнопку
  const handleStartNFC = useCallback(() => {
    if (!isSupported) {
      toast('NFC не поддерживается', 'error')
      return
    }

    startScan(handleNFCData)
  }, [isSupported, startScan, handleNFCData])

  const handleScanNFC = async () => {
    if (!supported) return
    
    try {
      setScanning(true)
      
      // @ts-ignore - NDEFReader не включен в типы TypeScript по умолчанию
      const ndef = new window.NDEFReader()
      
      await ndef.scan()
      
      ndef.addEventListener("reading", ({ message }: any) => {
        for (const record of message.records) {
          if (record.recordType === "text") {
            const textDecoder = new TextDecoder()
            const text = textDecoder.decode(record.data)
            
            try {
              // Ожидаем формат: deviceId|iin|password
              const parts = text.split('|')
              if (parts.length === 3) {
                const [deviceId, iin, password] = parts
                if (onAuthReceived) {
                  onAuthReceived(deviceId, iin, password)
                }
              }
            } catch (e) {
              console.error('Ошибка обработки NFC данных:', e)
            }
          }
        }
      })
    } catch (error) {
      console.error('Ошибка при сканировании NFC:', error)
    } finally {
      setScanning(false)
    }
  }

  if (supported === null) {
    return <Button variant="outline" disabled className="w-full">
      <NfcIcon className="mr-2 h-4 w-4" />
      Проверка NFC...
    </Button>
  }
  
  if (supported === false) {
    return <Button variant="outline" disabled className="w-full">
      <NfcIcon className="mr-2 h-4 w-4" />
      NFC не поддерживается
    </Button>
  }
  
  return (
    <Button 
      variant="outline" 
      onClick={handleScanNFC} 
      disabled={scanning}
      className="w-full"
    >
      <NfcIcon className="mr-2 h-4 w-4" />
      {scanning ? 'Сканирование...' : 'NFC вход'}
    </Button>
  )
} 