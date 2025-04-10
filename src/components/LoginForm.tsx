'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from '@/server/actions/login'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const [iin, setIin] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  
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
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4">
        <div>
          <Input
            id="iin"
            placeholder="110423503812"
            type="text"
            value={iin}
            onChange={(e) => setIin(e.target.value)}
            disabled={loading}
            required
            className="bg-[#f0f4f9] border-0 py-6 px-4 rounded-md"
          />
        </div>
        
        <div className="relative">
          <Input
            id="password"
            placeholder="••••••••••••••"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            className="bg-[#f0f4f9] border-0 py-6 px-4 rounded-md"
          />
          <button 
            type="button" 
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        
        {error && (
          <div className="text-sm font-medium text-destructive">
            {error}
          </div>
        )}
        
        <Button 
          disabled={loading} 
          type="submit" 
          className="w-full bg-[#1e9de3] hover:bg-[#1788c7] py-6 text-white rounded-md flex items-center justify-center"
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2" />
          ) : (
            <>
              Продолжить <span className="ml-2">→</span>
            </>
          )}
        </Button>
      </div>
    </form>
  )
} 