'use client'

import React, { PropsWithChildren } from 'react'
import { usePathname } from 'next/navigation'

const PageTransition: React.FC<PropsWithChildren> = ({ children }) => {
  const pathname = usePathname()

  return (
    <div key={pathname} className="transition-opacity duration-300">
      {children}
    </div>
  )
}

export default PageTransition 