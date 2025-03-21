'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from '@/components/misc/Logo'
import { GraduationCap, Rocket, Target, CheckCircle, Calendar, Brain, Lightbulb } from 'lucide-react'

const GoalsPage = () => {
  const [clicked, setClicked] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }

  const floatingIconVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200
      }
    }
  }

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0, rotateZ: -10 },
    show: { 
      scale: 1, 
      opacity: 1, 
      rotateZ: 0,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 300,
        duration: 0.8
      }
    }
  }

  const orbitVariants = {
    hidden: { opacity: 0, scale: 0.6 },
    show: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5, 
        delay: 0.3 
      }
    },
    exit: {
      opacity: 0,
      scale: 1.5,
      transition: { duration: 0.5 }
    }
  }

  // Различные иконки для плавающих элементов
  const floatingIcons = [Target, Rocket, GraduationCap, CheckCircle, Calendar, Brain, Lightbulb];

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-8 py-10">
      <motion.div
        initial="hidden"
        animate="show"
        variants={logoVariants}
        className="relative"
        onClick={() => setClicked(!clicked)}
      >
        <AnimatePresence>
          {!clicked && (
            <motion.div
              variants={orbitVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary/20"
            >
              {/* Плавающие иконки по орбите */}
              {floatingIcons.slice(0, 6).map((Icon, idx) => (
                <motion.div
                  key={idx}
                  className="absolute"
                  style={{
                    left: `calc(50% + ${Math.cos(idx * (Math.PI * 2) / 6) * 80}px)`,
                    top: `calc(50% + ${Math.sin(idx * (Math.PI * 2) / 6) * 80}px)`,
                  }}
                  animate={{
                    x: [0, Math.random() * 10 - 5, 0],
                    y: [0, Math.random() * 10 - 5, 0],
                    opacity: [1, 0.8, 1],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  <Icon className="h-8 w-8 text-primary/80" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div
          className="relative z-10 cursor-pointer overflow-hidden rounded-full shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            boxShadow: clicked ? "0 0 30px rgba(59, 130, 246, 0.7)" : "0 0 10px rgba(59, 130, 246, 0.3)"
          }}
          transition={{ duration: 0.3 }}
        >
          <Logo width={140} height={140} className="drop-shadow-lg" />
          
          <AnimatePresence>
            {clicked && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-primary/60 backdrop-blur-sm"
              >
                <CheckCircle className="h-16 w-16 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
      
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="text-center"
      >
        <h1 className="mb-6 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-4xl font-bold text-transparent">
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
          {floatingIcons.slice(0, 3).map((Icon, index) => (
            <motion.div
              key={index}
              variants={floatingIconVariants}
              whileHover={{ 
                scale: 1.1, 
                rotateZ: 5,
                backgroundColor: 'rgba(var(--primary), 0.1)',
              }}
              className="group flex h-24 w-24 flex-col items-center justify-center rounded-2xl bg-secondary/10 p-4 shadow-sm transition-colors"
            >
              <motion.div
                animate={{ 
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: index * 0.3
                }}
                className="relative"
              >
                <Icon className="mb-2 h-10 w-10 text-primary group-hover:text-primary/90" />
                <motion.div
                  className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary/40"
                  animate={{ 
                    width: ["0%", "80%", "0%"],
                    opacity: [0, 1, 0] 
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: index * 0.3
                  }}
                />
              </motion.div>
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