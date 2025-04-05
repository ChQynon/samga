'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from '@/server/actions/login'
import { Loader2 } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const [iin, setIin] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    try {
      const deviceId = `device-${Date.now()}`
      localStorage.setItem('samga-current-device-id', deviceId)
      localStorage.setItem('user-iin', iin)
      
      const result = await login(iin, password)
      
      if (result.success) {
        router.push('/dash')
      } else {
        let errorMessage = 'Ошибка при входе'
        if (result.errors) {
          if (result.errors.iin) errorMessage = result.errors.iin
          else if (result.errors.password) errorMessage = result.errors.password
          else if (result.errors.general) errorMessage = result.errors.general
        }
        setError(errorMessage)
      }
    } catch (err) {
      setError('Произошла ошибка при попытке входа')
      console.error('Ошибка входа:', err)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="iin">ИИН или логин</Label>
          <Input
            id="iin"
            placeholder="Введите ваш ИИН или логин"
            type="text"
            value={iin}
            onChange={(e) => setIin(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Пароль</Label>
            <a
              href="#"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Забыли пароль?
            </a>
          </div>
          <Input
            id="password"
            placeholder="Введите ваш пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        
        {error && (
          <div className="text-sm font-medium text-destructive">
            {error}
          </div>
        )}
        
        <Button disabled={loading} type="submit" className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Войти
        </Button>
      </div>
    </form>
  )
} 