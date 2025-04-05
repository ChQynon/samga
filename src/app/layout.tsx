import 'server-only'
// import { Analytics } from '@/components/Analytics'
// import './globals.css'
import { Inter as FontSans } from 'next/font/google'
import { cn } from '@/lib/utils'
// import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/lib/providers/ThemeProvider'
// import { SpeedInsights } from '@vercel/speed-insights/next'
import Script from 'next/script'
import { Metadata } from 'next'
import React, { PropsWithChildren } from 'react'

import '@/app/globals.scss'
import IconProvider from '@/lib/providers/IconProvider'
import ProgressProvider from '@/lib/providers/ProgressProvider'
import QueryProvider from '@/lib/providers/QueryProvider'
import ToastProvider from '@/lib/providers/ToastProvider'
import PreloadPages from '@/components/misc/PreloadPages'
// import { env } from '@/env.mjs'
// import { siteConfig } from '@/config/site'

const fontSans = FontSans({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'SAMGA - Быстрый и удобный электронный дневник НИШ',
  description: 'Самга (SAMGA) - быстрая и удобная альтернатива nis.mektep.kz для школьников НИШ. Современный дизайн, мгновенный доступ к оценкам, расписанию и домашним заданиям для учеников, учителей и родителей.',
  keywords: 'самга, samga, самгау, samgay, samga nis, электронный дневник, ниш, nis, мектеп, суш, дневник, электронный журнал, школа, suschnazarbaev, eni2, ениш, kundelik, күнделік, электронный дневник, НИШ, samga top, самга, альтернатива nis.mektep, nis.mektep.kz',
  icons: [
    { rel: 'icon', url: '/favicon.ico', type: 'image/x-icon' },
    { rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'icon', url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    { rel: 'icon', url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    { rel: 'apple-touch-icon', url: '/apple-touch-icon.png' },
    { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#3498db' },
    { rel: 'shortcut icon', url: '/favicon.ico', type: 'image/x-icon' },
  ],
  manifest: '/site.webmanifest',
  appleWebApp: {
    title: 'SAMGA NIS',
    statusBarStyle: 'black-translucent',
    capable: true,
    startupImage: [
      '/apple-icon-180.png'
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://samga.top/',
    title: 'SAMGA - Быстрый и удобный электронный дневник НИШ',
    description: 'Самга (SAMGA) - быстрая и удобная альтернатива nis.mektep.kz. Современный дизайн, мгновенный доступ к оценкам, расписанию и домашним заданиям.',
    siteName: 'SAMGA - Электронный дневник НИШ',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SAMGA - Электронный дневник НИШ'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SAMGA - Быстрый и удобный электронный дневник НИШ',
    description: 'Самга (SAMGA) - быстрая и удобная альтернатива nis.mektep.kz. Современный дизайн, мгновенный доступ к оценкам, расписанию и домашним заданиям.',
    images: ['/og-image.jpg']
  },
  alternates: {
    canonical: 'https://samga.top/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    }
  },
  metadataBase: new URL('https://samga.top'),
}

export const viewport = {
  themeColor: '#3498db',
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
        )}
      >
        <div
          vaul-drawer-wrapper=""
          className={cn(
            'min-h-screen bg-background font-sans antialiased',
            fontSans.variable,
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
