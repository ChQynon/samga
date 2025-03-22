'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import ResponsiveModal from '@/components/ui/responsive-modal'
import { SignOut } from '@phosphor-icons/react'
import { useToast } from '@/lib/providers/ToastProvider'
import { logout } from '@/server/actions/logout'
import { useRouter } from 'next-nprogress-bar'
import { useQueryClient } from '@tanstack/react-query'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import useSettingsStore from '@/lib/hooks/store/useSettingsStore'
import ThemeSwitcher from '@/components/ui/theme-switcher'
import DeviceAuthorization from '@/components/DeviceAuthorization'

const Page = () => {
  const { showToast } = useToast()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [sort, setSort] = useState<'asc' | 'score-up' | 'score-down'>('score-down')
  const { updateSort } = useSettingsStore()
  
  // Безопасная инициализация состояния из хранилища
  useEffect(() => {
    // Получаем состояние из хранилища только на клиенте
    const settings = useSettingsStore.getState()
    setSort(settings.sort)
  }, [])
  
  // Обработчик изменения сортировки
  const handleSortChange = (newSort: 'asc' | 'score-up' | 'score-down') => {
    setSort(newSort)
    updateSort(newSort)
  }

  // Безопасное удаление данных при выходе
  const handleLogout = () => {
    queryClient.removeQueries()
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('user-iin')
        localStorage.removeItem('user-password')
        localStorage.removeItem('samga-current-device-id')
        localStorage.removeItem('samga-authorized-devices')
      } catch (error) {
        console.error('Ошибка при очистке хранилища:', error)
      }
    }
    showToast('Выход выполнен успешно', 'success')
    logout().then(() => router.push('/login'))
  }

  return (
    <div className="mx-auto page-transition">
      <h2 className="scroll-m-20 pb-2 text-3xl font-semibold leading-tight tracking-tight first:mt-0">
        Настройки
      </h2>

      <div className="mt-6">
        <h3 className="scroll-m-20 text-xl font-semibold leading-tight tracking-tight">
          Основные
        </h3>
        <Separator className="my-4" />
        
        <div className="space-y-4">
          <div className="flex flex-row items-center justify-between py-1.5">
            <p className="text-lg">Тема оформления</p>
            <ThemeSwitcher />
          </div>
          
          <div className="flex flex-row items-center justify-between py-1.5">
            <p className="text-lg">Сортировка</p>
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent position="item-aligned">
                <SelectItem value="asc">По алфавиту</SelectItem>
                <SelectItem value="score-up">По возрастанию</SelectItem>
                <SelectItem value="score-down">По убыванию</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="scroll-m-20 text-xl font-semibold leading-tight tracking-tight">
          Устройства
        </h3>
        <Separator className="my-4" />
        <DeviceAuthorization />
      </div>
      
      <Separator className="my-8" />
      
      <div className="flex flex-row items-center justify-between py-1.5">
        <p className="text-xl lg:text-2xl">Выход</p>
        <ResponsiveModal
          trigger={
            <Button>
              <SignOut size={18} className="mr-1.5" /> Выйти
            </Button>
          }
          title={
            <span className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl">
              Подтвердите действие
            </span>
          }
          close={<Button variant="outline">Отмена</Button>}
        >
          Выход из аккаунта сотрёт все локальные данные о вас, вам придётся
          заново входить в свой аккаунт. Вы уверены?
          <Button
            className="mt-3 w-full"
            onClick={handleLogout}
          >
            Подтвердить выход
          </Button>
        </ResponsiveModal>
      </div>

      <p className="-mb-12 mt-4 text-muted-foreground sm:-mb-0">
        Приложение не имеет никакого отношения к АОО НИШ. Некоторые данные
        хранятся локально на вашем устройстве. Они никуда не передаются, не
        обрабатываются.
      </p>
    </div>
  )
}

export default Page
