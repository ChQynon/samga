import 'server-only'
// import { Analytics } from '@/components/Analytics'
import './globals.css'
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'
// import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/lib/providers/ThemeProvider'
// import { SpeedInsights } from '@vercel/speed-insights/next'
import Script from 'next/script'
import type { Metadata } from 'next'
import React, { PropsWithChildren } from 'react'

import '@/app/globals.scss'
import IconProvider from '@/lib/providers/IconProvider'
import ProgressProvider from '@/lib/providers/ProgressProvider'
import QueryProvider from '@/lib/providers/QueryProvider'
import ToastProvider from '@/lib/providers/ToastProvider'
import PreloadPages from '@/components/misc/PreloadPages'
// import { env } from '@/env.mjs'
// import { siteConfig } from '@/config/site'

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'SAMGA',
  description: 'Система автоматической генерации отчётов SAMGA',
  manifest: '/manifest.json',
  icons: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      url: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png',
      sizes: '180x180'
    },
    {
      rel: 'apple-touch-icon',
      url: '/icon-192.png',
      sizes: '192x192'
    },
    {
      rel: 'apple-touch-icon',
      url: '/icon-512.png',
      sizes: '512x512'
    },
  ],
}

export const viewport = {
  themeColor: '#3498db',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head />
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.variable)}>
        <div
          vaul-drawer-wrapper=""
          className={cn(
            'min-h-screen bg-background font-sans antialiased',
            inter.variable,
          )}
        >
          <ProgressProvider>
            <QueryProvider>
              <ThemeProvider>
                <IconProvider>
                  <ToastProvider>
                    <PreloadPages />
                    {children}
                  </ToastProvider>
                </IconProvider>
              </ThemeProvider>
            </QueryProvider>
          </ProgressProvider>
        </div>
      </body>
    </html>
  )
}
