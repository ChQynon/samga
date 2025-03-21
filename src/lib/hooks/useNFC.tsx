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
      // Сначала очищаем предыдущие ошибки и сбрасываем статус
      setStatus('reading')
      setError(null)
      
      // В режиме разработки можно имитировать NFC для тестирования
      if (process.env.NODE_ENV === 'development' && !('NDEFReader' in window)) {
        console.log('Режим разработки: имитация NFC чтения');
        
        // Через 5 секунд сгенерируем тестовые данные
        setTimeout(() => {
          const testData = {
            iin: '123456789012',
            password: 'test123',
            deviceId: 'demo-device-' + Math.floor(Math.random() * 100000)
          };
          
          // Создаем кастомное событие для имитации NFC
          const event = new CustomEvent('nfc-auth-data', { detail: testData });
          window.dispatchEvent(event);
        }, 5000);
        
        return;
      }
      
      // @ts-ignore - Web NFC API может не быть в TypeScript определениях
      const ndef = new window.NDEFReader()
      console.log('Запуск NFC сканирования...');
      
      try {
        await ndef.scan();
        console.log('NFC сканирование активировано успешно');
        
        // Обработчик чтения NFC
        ndef.addEventListener("reading", ({ message, serialNumber }: any) => {
          console.log('NFC: получено чтение, обработка данных...');
          
          // Обработка прочитанных данных
          try {
            if (message.records && message.records.length > 0) {
              const record = message.records[0];
              let decodedData = '';
              
              // Декодируем данные в зависимости от типа записи
              if (record.recordType === "text") {
                const textDecoder = new TextDecoder(record.encoding || 'utf-8');
                decodedData = textDecoder.decode(record.data);
              } else if (record.recordType === "url") {
                // Для URL, которые могут содержать параметры
                const textDecoder = new TextDecoder();
                decodedData = textDecoder.decode(record.data);
              } else {
                // Для любого другого типа данных пробуем декодировать как текст
                try {
                  const textDecoder = new TextDecoder();
                  decodedData = textDecoder.decode(record.data);
                } catch (e) {
                  console.error('Ошибка декодирования данных NFC:', e);
                  throw new Error('Неподдерживаемый формат данных NFC');
                }
              }
              
              console.log('NFC: данные декодированы успешно', decodedData);
              
              // Пытаемся распарсить JSON
              try {
                const authData = JSON.parse(decodedData);
                
                // Проверяем обязательные поля
                if (!authData.iin || !authData.password || !authData.deviceId) {
                  throw new Error('Неполные данные авторизации в NFC');
                }
                
                console.log('NFC: данные авторизации получены успешно');
                
                // Передаем данные через событие
                const event = new CustomEvent('nfc-auth-data', { 
                  detail: authData 
                });
                window.dispatchEvent(event);
                
                // Сбрасываем статус после успешного чтения
                setStatus('idle');
              } catch (e) {
                console.error('Ошибка парсинга данных NFC:', e);
                throw new Error('Неверный формат данных в NFC-метке');
              }
            } else {
              throw new Error('NFC-метка не содержит данных');
            }
          } catch (e) {
            console.error('Ошибка при обработке NFC данных:', e);
            setError(e instanceof Error ? e : new Error('Ошибка чтения NFC'));
            setStatus('error');
            
            // Автоматический перезапуск сканирования через 3 секунды после ошибки
            setTimeout(() => {
              startReading();
            }, 3000);
          }
        });
        
        // Обработчик ошибок NFC
        ndef.addEventListener("error", (e: any) => {
          console.error('Ошибка NFC сканера:', e);
          const errorMessage = e.message || 'Ошибка при сканировании NFC';
          setError(new Error(errorMessage));
          setStatus('error');
          
          // Автоматически перезапускаем сканирование при ошибке через 3 секунды
          setTimeout(() => {
            startReading();
          }, 3000);
        });
        
      } catch (scanError) {
        console.error('Ошибка при запуске NFC сканирования:', scanError);
        
        // Специальная обработка разных типов ошибок
        if (scanError instanceof Error) {
          // Для NotAllowedError - попробуем дать подсказку пользователю
          if (scanError.name === 'NotAllowedError') {
            setError(new Error('Доступ к NFC запрещен. Проверьте настройки устройства и разрешения.'));
          } 
          // Для NotSupportedError - уточняем сообщение
          else if (scanError.name === 'NotSupportedError') {
            setError(new Error('NFC не поддерживается на этом устройстве или отключен в настройках.'));
          } 
          // Для других ошибок
          else {
            setError(scanError);
          }
        } else {
          setError(new Error('Неизвестная ошибка при инициализации NFC'));
        }
        
        setStatus('error');
      }
      
    } catch (e) {
      console.error('Ошибка в процессе работы с NFC:', e);
      setError(e instanceof Error ? e : new Error('Ошибка инициализации NFC'));
      setStatus('error');
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