import { Inter as FontSans } from 'next/font/google'
import React, { PropsWithChildren } from 'react'

import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/lib/providers/ThemeProvider'

import '@/app/globals.scss'
import IconProvider from '@/lib/providers/IconProvider'
import ProgressProvider from '@/lib/providers/ProgressProvider'
import QueryProvider from '@/lib/providers/QueryProvider'
import ToastProvider from '@/lib/providers/ToastProvider'
import PagePreloader from '@/components/PagePreloader'

const fontSans = FontSans({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
})

export const metadata = {
  title: 'samga.nis - Электронный дневник НИШ',
  description: 'samga.nis - Взлетай к знаниям! Электронный дневник и журнал для НИШ, мектеп, самга, eni2. Система учета школьных достижений.',
  keywords: 'nis samga, samgay, самга, eni2, crashed-nis, ниш мектеп кунделык, электронный журнал, электронный дневник, школьный портал',
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
    title: 'samga.nis',
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
    title: 'samga.nis - Электронный дневник НИШ',
    description: 'samga.nis - Взлетай к знаниям! Электронный дневник и журнал для НИШ, мектеп, самга, eni2.',
    siteName: 'samga.nis',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'samga.nis - Электронный дневник НИШ',
    description: 'samga.nis - Взлетай к знаниям! Электронный дневник и журнал для НИШ, мектеп, самга.',
  },
  alternates: {
    canonical: 'https://samga.top/',
  },
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
                    <PagePreloader />
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
