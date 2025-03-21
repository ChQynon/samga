'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Logo from '@/components/misc/Logo'

export const metadata = {
  title: 'Цели | samga.nis',
}

const GoalsPage = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-8 py-10">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <motion.div
          animate={{ 
            rotateY: 360,
            rotateX: 360,
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="h-32 w-32 rounded-xl border-4 border-primary/30" />
        </motion.div>
        
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative z-10"
        >
          <Logo width={120} height={120} className="drop-shadow-lg" />
        </motion.div>
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-center"
      >
        <h1 className="mb-4 text-3xl font-bold">Страница в разработке</h1>
        <p className="mb-6 text-muted-foreground">
          Мы работаем над созданием системы целей, которая поможет вам лучше организовать учебный процесс.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center">
          <p className="text-sm text-muted-foreground">
            P.S. Идея сайта была начата в декабре 2024
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default GoalsPage 