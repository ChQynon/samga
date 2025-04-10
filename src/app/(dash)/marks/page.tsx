'use server'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function MarksPage() {
  return (
    <div className="py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Оценки</h1>
        <p className="text-muted-foreground mt-1">Успеваемость и текущие оценки</p>
      </div>
      
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-center h-40 flex-col">
          <div className="text-muted-foreground mb-4 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium">Загрузка оценок временно недоступна</h3>
            <p className="mt-1 text-sm text-gray-500">
              Мы работаем над восстановлением подключения к API сервера оценок.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dash">
              Вернуться на главную
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <h2 className="text-lg font-medium mb-2">Средний балл</h2>
          <div className="flex items-center">
            <span className="text-3xl font-bold">--</span>
            <span className="text-muted-foreground ml-2">(Данные недоступны)</span>
          </div>
        </div>
        
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <h2 className="text-lg font-medium mb-2">Последнее обновление</h2>
          <p className="text-muted-foreground">Не удалось получить данные</p>
        </div>
      </div>
    </div>
  )
} 