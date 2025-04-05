'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { NfcIcon } from 'lucide-react'

interface NFCLoginProps {
  onAuthReceived?: (deviceId: string, iin: string, password: string) => void;
}

export default function NFCLogin({ onAuthReceived }: NFCLoginProps) {
  const [supported, setSupported] = useState<boolean | null>(null)
  const [scanning, setScanning] = useState(false)
  
  useEffect(() => {
    // Проверяем поддержку NFC в браузере
    if (typeof window !== 'undefined') {
      // @ts-ignore - NDEFReader может отсутствовать в типах
      setSupported(!!window.NDEFReader)
    }
  }, [])
  
  const handleScan = async () => {
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
                if (onAuthReceived && deviceId && iin && password) {
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
      onClick={handleScan} 
      disabled={scanning}
      className="w-full"
    >
      <NfcIcon className="mr-2 h-4 w-4" />
      {scanning ? 'Сканирование...' : 'NFC вход'}
    </Button>
  )
} 