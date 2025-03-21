'use client'

import { useEffect } from 'react'

const routes = [
  '/', // Главная страница
  '/reports', // Табель
  '/goals', // Цели
  '/settings', // Настройки
  '/privacy', // Политика конфиденциальности
  '/terms', // Условия использования
]

/**
 * Компонент для предзагрузки страниц в определенном порядке
 * Загружает страницы последовательно, начиная с главной
 */
const PagePreloader = () => {
  useEffect(() => {
    // Функция для последовательной предзагрузки страниц
    const preloadPages = async () => {
      for (const route of routes) {
        try {
          // Используем fetch для предзагрузки HTML страницы
          await fetch(route, { 
            // @ts-ignore - приоритет не поддерживается в типах TS
            priority: 'low' 
          })
          // Небольшая пауза, чтобы не перегружать браузер
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (error) {
          console.error(`Failed to preload ${route}:`, error)
        }
      }
    }

    // Запускаем предзагрузку после рендеринга текущей страницы
    if (typeof window !== 'undefined') {
      window.requestIdleCallback 
        ? window.requestIdleCallback(() => preloadPages()) 
        : setTimeout(preloadPages, 200)
    }
  }, [])

  return null // Компонент не рендерит ничего видимого
}

export default PagePreloader 