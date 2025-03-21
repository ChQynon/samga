import NavBar from '@/widgets/navbar/NavBar'
import React, { FC, PropsWithChildren } from 'react'
import Header from '@/widgets/header/Header'
import Logo from '@/components/misc/Logo'
import { Button } from '@/components/ui/button'
import { TelegramLogo } from '@phosphor-icons/react/dist/ssr'
import { env } from '@/env'

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <div className="mx-auto flex w-[92.5%] flex-col justify-center sm:max-w-[47rem]">
        <div className="mb-8 flex w-full flex-col">
          <Header />

          <div className="page-transition">
            {children}
          </div>
        </div>

        <NavBar />
      </div>
      <footer className="mx-auto mb-3 mt-10 flex w-[92.5%] flex-col sm:max-w-[47rem]">
        <div className="flex flex-row items-center justify-between">
          <div className="flex w-fit flex-row items-center pl-2 text-muted-foreground sm:mx-0">
            <Logo width={19} height={19} className="my-0" withText={true} />
          </div>
          
          <div className="flex flex-row justify-center gap-2">
            <a href={env.NEXT_PUBLIC_CONTACT_LINK} target="_blank" rel="noopener">
              <Button variant="link" className="p-1 px-2">
                <span className="text-muted-foreground">Создано qynon</span>
              </Button>
            </a>
            
            <a href="https://t.me/samgay_nis" target="_blank" rel="noopener">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <TelegramLogo className="h-4 w-4" />
                <span className="sr-only">Наш канал</span>
              </Button>
            </a>
          </div>
        </div>
        
        <div className="mt-2 flex flex-col items-center justify-center gap-2">
          <a href="https://t.me/samgay_nis" target="_blank" rel="noopener" className="flex items-center gap-2 rounded-lg border border-muted p-2 hover:bg-muted/50">
            <TelegramLogo className="h-5 w-5" />
            <span className="text-sm font-medium">Наш Telegram канал</span>
          </a>
          <p className="text-xs text-muted-foreground">
            P.S. Интересный факт: этот сайт создал 8 классник
          </p>
        </div>
      </footer>
    </>
  )
}

export default Layout
