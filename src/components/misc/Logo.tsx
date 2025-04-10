import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  width?: number
  height?: number
  className?: string
  withText?: boolean
}

export default function Logo({ 
  width = 40, 
  height = 40, 
  className = '',
  withText = false 
}: LogoProps) {
  return (
    <Link href="/" className={`inline-flex items-center ${className}`}>
      <div className="relative" style={{ width, height }}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width={width} height={height}>
          <path d="M50 100C77.6142 100 100 77.6142 100 50C100 22.3858 77.6142 0 50 0C22.3858 0 0 22.3858 0 50C0 77.6142 22.3858 100 50 100Z" fill="#1E9DE3"/>
          <path d="M32.5 30L50 40V80L32.5 70V30Z" fill="white"/>
          <path d="M67.5 30L50 40V80L67.5 70V30Z" fill="white"/>
          <path d="M50 20L32.5 30L50 40L67.5 30L50 20Z" fill="white"/>
        </svg>
      </div>
      
      {withText && (
        <div className="ml-2 flex flex-col">
          <span className="text-[#1E9DE3] font-bold text-lg leading-none">samga</span>
          <span className="text-gray-600 text-xs">.nis</span>
        </div>
      )}
    </Link>
  )
}
