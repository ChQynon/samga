'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Logo from '@/components/misc/Logo'
import { GraduationCap, Rocket, Target } from 'lucide-react'

const GoalsPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  const icons = [Target, Rocket, GraduationCap]
  
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-8 py-10">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7 }}
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
          <div className="h-36 w-36 rounded-2xl border-4 border-primary/30 bg-primary/5" />
        </motion.div>
        
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative z-10"
        >
          <Logo width={140} height={140} className="drop-shadow-lg" />
        </motion.div>
      </motion.div>
      
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="text-center"
      >
        <h1 className="mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-4xl font-bold text-transparent">
          Страница в разработке
        </h1>
        <p className="mb-8 max-w-md text-lg text-muted-foreground">
          Мы работаем над созданием системы целей, которая поможет вам лучше организовать учебный процесс.
        </p>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mt-6 flex flex-wrap justify-center gap-6"
        >
          {icons.map((Icon, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="flex h-24 w-24 flex-col items-center justify-center rounded-xl bg-secondary/10 p-4 shadow-sm"
            >
              <Icon className="mb-2 h-10 w-10 text-primary" />
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="mt-12 flex flex-col items-center justify-center"
        >
          <p className="rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
            P.S. Идея сайта была начата в декабре 2024
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default GoalsPage 