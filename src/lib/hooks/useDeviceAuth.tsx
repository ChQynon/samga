'use client'

import { useState, useCallback, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { DeviceInfo } from './useNFC'

// Интерфейс хука
export interface DeviceAuthHook {
  // Список устройств, авторизованных текущим пользователем
  authorizedDevices: DeviceInfo[]
  // Авторизация нового устройства
  authorizeDevice: (iin: string, password: string) => DeviceInfo | null
  // Отзыв доступа для устройства
  revokeDevice: (deviceId: string) => boolean
  // Подготовка данных для передачи через NFC
  prepareAuthData: () => string
  // Текущее устройство авторизовано через другое устройство?
  isCurrentDeviceShared: boolean
  // Проверка, может ли устройство авторизовать другие устройства
  canAuthorizeOthers: boolean
  // Сколько осталось мест для подключения устройств
  remainingSlots: number
}

// Ключ для localStorage
const DEVICES_STORAGE_KEY = 'samga-authorized-devices'
const CURRENT_DEVICE_KEY = 'samga-current-device-id'
const MAIN_DEVICE_KEY = 'samga-main-device-id'
// Максимальное время жизни устройства без обновления (в миллисекундах) - 7 дней
const MAX_DEVICE_LIFETIME = 7 * 24 * 60 * 60 * 1000;
// Максимальное количество устройств, которые можно авторизовать
const MAX_DEVICES = 5;

// Получить браузер и ОС
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
  } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) {
    browserName = 'Internet Explorer'
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

export const useDeviceAuth = (): DeviceAuthHook => {
  // Список устройств
  const [authorizedDevices, setAuthorizedDevices] = useState<DeviceInfo[]>([])
  // Статус текущего устройства
  const [isCurrentDeviceShared, setIsCurrentDeviceShared] = useState(false)
  // Может ли текущее устройство авторизовать другие
  const [canAuthorizeOthers, setCanAuthorizeOthers] = useState(true)
  // Оставшееся количество слотов для устройств
  const [remainingSlots, setRemainingSlots] = useState(MAX_DEVICES)
  // ID основного устройства
  const [mainDeviceId, setMainDeviceId] = useState<string | null>(null)
  
  // Загрузка списка устройств при инициализации
  useEffect(() => {
    try {
      // Проверяем, является ли это устройство основным
      const isMainDevice = !localStorage.getItem(MAIN_DEVICE_KEY)
      
      // Если это первый запуск и это основное устройство, сгенерируем ID
      if (isMainDevice) {
        const deviceId = uuidv4()
        localStorage.setItem(MAIN_DEVICE_KEY, deviceId)
        setMainDeviceId(deviceId)
      } else {
        // Если это не основное устройство, получаем ID из хранилища
        setMainDeviceId(localStorage.getItem(MAIN_DEVICE_KEY))
      }
      
      // Получаем список устройств из localStorage
      const storedDevices = localStorage.getItem(DEVICES_STORAGE_KEY)
      if (storedDevices) {
        const devices = JSON.parse(storedDevices) as DeviceInfo[]
        // Фильтруем устаревшие устройства
        const currentTime = new Date().getTime();
        const validDevices = devices.filter(device => 
          (currentTime - device.timestamp) < MAX_DEVICE_LIFETIME
        );
        
        // Если мы удалили какие-то устройства, сохраняем обновленный список
        if (validDevices.length !== devices.length) {
          localStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(validDevices));
        }
        
        // Устанавливаем список устройств и обновляем оставшееся количество слотов
        setAuthorizedDevices(validDevices)
        setRemainingSlots(MAX_DEVICES - validDevices.length)
      }
      
      // Проверяем, является ли текущее устройство "шаренным"
      const currentDeviceId = localStorage.getItem(CURRENT_DEVICE_KEY)
      if (currentDeviceId) {
        setIsCurrentDeviceShared(true)
        // Шаренные устройства не могут авторизовать другие устройства
        setCanAuthorizeOthers(false)
      }
    } catch (e) {
      console.error('Ошибка при загрузке данных об устройствах:', e)
    }
  }, [])
  
  // Сохранение списка устройств
  const saveDevices = useCallback((devices: DeviceInfo[]) => {
    try {
      localStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(devices))
      setRemainingSlots(MAX_DEVICES - devices.length)
    } catch (e) {
      console.error('Ошибка при сохранении данных об устройствах:', e)
    }
  }, [])
  
  // Авторизация нового устройства
  const authorizeDevice = useCallback((iin: string, password: string): DeviceInfo | null => {
    // Проверяем, не превышен ли лимит устройств
    if (authorizedDevices.length >= MAX_DEVICES) {
      console.error('Достигнут максимальный лимит устройств (5)')
      return null
    }
    
    const now = new Date()
    const deviceId = uuidv4()
    
    // Создаем информацию об устройстве
    const deviceInfo: DeviceInfo = {
      id: deviceId,
      name: getBrowserInfo(),
      browser: navigator.userAgent,
      lastAccess: now.toLocaleString('ru'),
      timestamp: now.getTime()
    }
    
    // Добавляем устройство в список
    const updatedDevices = [...authorizedDevices, deviceInfo]
    setAuthorizedDevices(updatedDevices)
    saveDevices(updatedDevices)
    
    return deviceInfo
  }, [authorizedDevices, saveDevices])
  
  // Отзыв доступа для устройства
  const revokeDevice = useCallback((deviceId: string): boolean => {
    try {
      // Фильтруем список устройств, исключая устройство с указанным ID
      const updatedDevices = authorizedDevices.filter(device => device.id !== deviceId)
      
      // Если размер списка не изменился, значит устройство не найдено
      if (updatedDevices.length === authorizedDevices.length) {
        return false
      }
      
      // Обновляем список устройств
      setAuthorizedDevices(updatedDevices)
      saveDevices(updatedDevices)
      
      return true
    } catch (e) {
      console.error('Ошибка при отзыве доступа устройства:', e)
      return false
    }
  }, [authorizedDevices, saveDevices])
  
  // Подготовка данных для передачи через NFC
  const prepareAuthData = useCallback((): string => {
    try {
      // Запрещаем авторизацию с устройства, которое само было авторизовано через другое устройство
      if (isCurrentDeviceShared) {
        console.error('Нельзя авторизовать другие устройства с устройства, которое само было авторизовано')
        return ''
      }
      
      // Проверяем, не превышен ли лимит устройств
      if (authorizedDevices.length >= MAX_DEVICES) {
        console.error('Достигнут максимальный лимит устройств (5)')
        return 'limit_exceeded'
      }
      
      // Получаем данные из localStorage
      const iin = localStorage.getItem('user-iin')
      const password = localStorage.getItem('user-password')
      
      // Проверяем наличие данных
      if (!iin || !password) {
        console.error('Учетные данные не найдены в localStorage')
        
        // Если нет данных, используем хардкод для демонстрации
        if (process.env.NODE_ENV === 'development') {
          const testIin = '123456789012'
          const testPassword = 'password123'
          
          // Создаем устройство с тестовыми данными
          const deviceInfo = authorizeDevice(testIin, testPassword)
          
          if (!deviceInfo) {
            return 'limit_exceeded'
          }
          
          // Формируем тестовые данные для передачи
          const demoAuthData = {
            iin: testIin,
            password: testPassword,
            deviceId: deviceInfo.id,
            sourceDevice: {
              name: getBrowserInfo(),
              id: mainDeviceId || 'unknown'
            }
          }
          
          return JSON.stringify(demoAuthData)
        }
        
        return ''
      }
      
      // Создаем новое устройство
      const deviceInfo = authorizeDevice(iin, password)
      
      if (!deviceInfo) {
        return 'limit_exceeded'
      }
      
      // Формируем данные для передачи
      const authData = {
        iin,
        password,
        deviceId: deviceInfo.id,
        sourceDevice: {
          name: getBrowserInfo(),
          id: mainDeviceId || 'unknown'
        }
      }
      
      return JSON.stringify(authData)
    } catch (e) {
      console.error('Ошибка при подготовке данных аутентификации:', e)
      return ''
    }
  }, [authorizeDevice, isCurrentDeviceShared, authorizedDevices.length, mainDeviceId])
  
  // Обновление времени последнего доступа для текущего устройства
  const updateCurrentDeviceTimestamp = useCallback(() => {
    try {
      const currentDeviceId = localStorage.getItem(CURRENT_DEVICE_KEY)
      if (currentDeviceId) {
        // Обновляем только если устройство найдено в списке
        const updatedDevices = authorizedDevices.map(device => {
          if (device.id === currentDeviceId) {
            const now = new Date()
            return {
              ...device,
              lastAccess: now.toLocaleString('ru'),
              timestamp: now.getTime()
            }
          }
          return device
        })
        
        setAuthorizedDevices(updatedDevices)
        saveDevices(updatedDevices)
      }
    } catch (e) {
      console.error('Ошибка при обновлении времени доступа:', e)
    }
  }, [authorizedDevices, saveDevices])
  
  // Обновляем время последнего доступа при активности пользователя
  useEffect(() => {
    if (isCurrentDeviceShared) {
      // Обновляем временную метку при загрузке и каждый час
      updateCurrentDeviceTimestamp()
      const intervalId = setInterval(updateCurrentDeviceTimestamp, 60 * 60 * 1000)
      
      return () => clearInterval(intervalId)
    }
  }, [isCurrentDeviceShared, updateCurrentDeviceTimestamp])
  
  return {
    authorizedDevices,
    authorizeDevice,
    revokeDevice,
    prepareAuthData,
    isCurrentDeviceShared,
    canAuthorizeOthers,
    remainingSlots
  }
} 