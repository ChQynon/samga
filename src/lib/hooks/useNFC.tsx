'use client'

import { useState, useCallback, useEffect } from 'react'

// Тип для статуса NFC
type NFCStatus = 'idle' | 'reading' | 'writing' | 'error' | 'ready' | 'not-started'

// Тип для событий NFC Reader
export type NDEFReaderEventResult = {
  message?: {
    records: Array<{
      recordType?: string
      mediaType?: string
      data?: ArrayBuffer
      encoding?: string
      lang?: string
    }>
  }
  serialNumber?: string
}

// Интерфейс взаимодействия с NFC
export interface NFCHook {
  isAvailable: boolean
  status: NFCStatus
  error: Error | null
  startReading: () => Promise<void>
  startWriting: (message: string) => Promise<void>
  stopNFC: () => void
  isSupported: boolean
  isScanning: boolean
  startScan: (callback: (data: NDEFReaderEventResult) => void) => void
}

// Тип для хранения информации об устройстве
export interface DeviceInfo {
  id: string
  name: string
  browser: string
  lastAccess: string
  timestamp: number
}

export const useNFC = (): NFCHook => {
  const [isAvailable, setIsAvailable] = useState(false)
  const [status, setStatus] = useState<NFCStatus>('idle')
  const [error, setError] = useState<Error | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  
  // Проверяем доступность NFC API при монтировании
  useEffect(() => {
    // Проверка поддержки Web NFC API
    if ('NDEFReader' in window) {
      setIsAvailable(true)
    } else {
      setIsAvailable(false)
    }
  }, [])
  
  // Остановка NFC операций
  const stopNFC = useCallback(() => {
    setStatus('idle')
    setError(null)
    setIsScanning(false)
  }, [])

  // Запуск сканирования NFC с колбэком
  const startScan = useCallback((callback: (data: NDEFReaderEventResult) => void) => {
    if (!isAvailable) {
      setError(new Error('NFC не поддерживается на этом устройстве'))
      return
    }
    
    try {
      setStatus('reading')
      setError(null)
      setIsScanning(true)
      
      // @ts-ignore - Web NFC API может не быть в TypeScript определениях
      const ndef = new window.NDEFReader()
      
      ndef.scan().then(() => {
        ndef.addEventListener("reading", (event: NDEFReaderEventResult) => {
          callback(event)
        })
      }).catch((error: Error) => {
        setError(error)
        setStatus('error')
        setIsScanning(false)
      })
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Ошибка инициализации NFC'))
      setStatus('error')
      setIsScanning(false)
    }
  }, [isAvailable])
  
  // Начать чтение NFC
  const startReading = useCallback(async () => {
    if (!isAvailable) {
      setError(new Error('NFC не поддерживается на этом устройстве'))
      return
    }
    
    try {
      setStatus('reading')
      setError(null)
      
      // @ts-ignore - Web NFC API может не быть в TypeScript определениях
      const ndef = new window.NDEFReader()
      await ndef.scan()
      
      ndef.addEventListener("reading", ({ message, serialNumber }: any) => {
        // Обработка прочитанных данных
        try {
          if (message.records && message.records.length > 0) {
            const decoder = new TextDecoder()
            const record = message.records[0]
            
            // Декодируем данные
            if (record.recordType === "text") {
              const textDecoder = new TextDecoder(record.encoding || 'utf-8')
              const decodedData = textDecoder.decode(record.data)
              
              // Предположим, что данные имеют формат JSON с учетными данными
              try {
                const authData = JSON.parse(decodedData)
                
                // Dispatch событие, которое будет перехвачено на странице логина
                const event = new CustomEvent('nfc-auth-data', { 
                  detail: authData 
                })
                window.dispatchEvent(event)
                
                setStatus('idle')
              } catch (e) {
                setError(new Error('Неверный формат данных'))
                setStatus('error')
              }
            }
          }
        } catch (e) {
          setError(e instanceof Error ? e : new Error('Ошибка чтения NFC'))
          setStatus('error')
        }
      })
      
      ndef.addEventListener("error", (e: any) => {
        setError(new Error(e.message || 'Ошибка при сканировании NFC'))
        setStatus('error')
      })
      
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Ошибка инициализации NFC'))
      setStatus('error')
    }
  }, [isAvailable])
  
  // Запись данных на NFC
  const startWriting = useCallback(async (message: string) => {
    if (!isAvailable) {
      setError(new Error('NFC не поддерживается на этом устройстве'))
      return
    }
    
    try {
      setStatus('writing')
      setError(null)
      
      // @ts-ignore - Web NFC API может не быть в TypeScript определениях
      const ndef = new window.NDEFReader()
      
      // Создаем сообщение для записи
      const encoder = new TextEncoder()
      const encodedData = encoder.encode(message)
      
      // Записываем сообщение на NFC-метку
      await ndef.write({
        records: [
          {
            recordType: "text",
            data: encodedData,
            lang: "ru"
          }
        ]
      })
      
      setStatus('idle')
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Ошибка записи на NFC-метку'))
      setStatus('error')
    }
  }, [isAvailable])
  
  return {
    isAvailable,
    status,
    error,
    startReading,
    startWriting,
    stopNFC,
    isSupported: isAvailable,
    isScanning,
    startScan
  }
} 