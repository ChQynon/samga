'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { QrCodeIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

// Мы можем добавить QR сканер позже
// import QrScanner from 'react-qr-scanner'

export default function QRLogin() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  
  const handleOpenDialog = () => {
    setDialogOpen(true)
    setScanError(null)
  }

  const handleClose = () => {
    setDialogOpen(false)
  }
  
  return (
    <>
      <Button 
        variant="outline" 
        onClick={handleOpenDialog}
        className="w-full"
      >
        <QrCodeIcon className="mr-2 h-4 w-4" />
        QR-код
      </Button>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Вход через QR-код</DialogTitle>
            <DialogDescription>
              QR-сканер здесь будет добавлен позже
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 text-center">
            <div className="p-6 border border-dashed rounded-md mb-4">
              <p className="text-sm text-muted-foreground">
                Функция QR-сканирования находится в разработке
              </p>
            </div>
            
            {scanError && (
              <div className="mt-4 p-2 bg-destructive/10 text-destructive rounded text-sm">
                {scanError}
              </div>
            )}
          </div>
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
            >
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 