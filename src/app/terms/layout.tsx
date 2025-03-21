import React from 'react'
import { metadata as baseMetadata } from '../layout'

export const metadata = {
  ...baseMetadata,
  title: 'Условия использования | SAMGA',
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Предзагрузка критических ресурсов */}
      <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="preload" href="/" as="document" />
      
      <div className="bg-background min-h-screen overflow-hidden">
        {children}
      </div>
    </>
  )
} 