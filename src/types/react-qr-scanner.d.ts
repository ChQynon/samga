declare module 'react-qr-scanner' {
  import React from 'react'
  
  interface QrScannerProps {
    delay?: number
    style?: React.CSSProperties
    onError?: (error: Error) => void
    onScan?: (data: { text: string } | null) => void
    resolution?: number
    facingMode?: 'environment' | 'user'
    className?: string
  }
  
  const QrScanner: React.FC<QrScannerProps>
  
  export default QrScanner
} 