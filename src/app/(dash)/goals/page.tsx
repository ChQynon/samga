'use client'

import React, { useEffect, useState } from 'react'
import Logo from '@/components/misc/Logo'
import { GraduationCap, Rocket, Target } from 'lucide-react'

const GoalsPage = () => {
  const icons = [Target, Rocket, GraduationCap]
  const [visible, setVisible] = useState(false)
  const [logoVisible, setLogoVisible] = useState(false)
  const [textVisible, setTextVisible] = useState(false)
  const [iconsVisible, setIconsVisible] = useState(false)
  const [noteVisible, setNoteVisible] = useState(false)
  
  useEffect(() => {
    // Анимация появления элементов с задержкой
    const logoTimer = setTimeout(() => setLogoVisible(true), 100)
    const textTimer = setTimeout(() => setTextVisible(true), 300)
    const iconsTimer = setTimeout(() => setIconsVisible(true), 600)
    const noteTimer = setTimeout(() => setNoteVisible(true), 900)
    
    setVisible(true)
    
    return () => {
      clearTimeout(logoTimer)
      clearTimeout(textTimer)
      clearTimeout(iconsTimer)
      clearTimeout(noteTimer)
    }
  }, [])
  
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-8 py-10">
      <div 
        className={`relative transform transition-all duration-700 ${
          logoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ${logoVisible ? 'rotate-0' : 'rotate-45'}`}>
          <div className="h-36 w-36 rounded-2xl border-4 border-primary/30 bg-primary/5" />
        </div>
        
        <div className="relative z-10">
          <Logo width={140} height={140} className="drop-shadow-lg" />
        </div>
      </div>
      
      <div 
        className={`text-center transform transition-all duration-700 ${
          textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <h1 className="mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-4xl font-bold text-transparent">
          Страница в разработке
        </h1>
        <p className="mb-8 max-w-md text-lg text-muted-foreground">
          Мы работаем над созданием системы целей, которая поможет вам лучше организовать учебный процесс.
        </p>
        
        <div className="mt-6 flex flex-wrap justify-center gap-6">
          {icons.map((Icon, index) => (
            <div
              key={index}
              className={`flex h-24 w-24 flex-col items-center justify-center rounded-xl bg-secondary/10 p-4 shadow-sm hover:scale-105 transition-all duration-500 transform ${
                iconsVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Icon className="mb-2 h-10 w-10 text-primary" />
            </div>
          ))}
        </div>
        
        <div 
          className={`mt-12 flex flex-col items-center justify-center transform transition-all duration-700 ${
            noteVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
            P.S. Идея сайта была начата в декабре 2024
          </p>
        </div>
      </div>
    </div>
  )
}

export default GoalsPage 