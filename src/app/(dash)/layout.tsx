import NavBar from '@/widgets/navbar/NavBar'
import React, { FC, PropsWithChildren } from 'react'
import Header from '@/widgets/header/Header'
import Logo from '@/components/misc/Logo'
import { Button } from '@/components/ui/button'
import { TelegramLogo } from '@phosphor-icons/react/dist/ssr'
import { env } from '@/env'
import Link from 'next/link'

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

        <div className="mb-20 flex flex-col items-center justify-center gap-3">
          <a href="https://t.me/samgay_nis" target="_blank" rel="noopener">
            <Button variant="outline" size="default" className="w-full flex items-center gap-2">
              <TelegramLogo className="h-5 w-5" />
              <span className="text-sm font-medium">Наш Telegram канал</span>
            </Button>
          </a>
          
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:underline" prefetch>
              Политика конфиденциальности
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:underline" prefetch>
              Условия использования
            </Link>
          </div>
          
          <div className="text-center text-xs text-muted-foreground/70">
            <p>SAMGA - быстрая и удобная альтернатива nis.mektep</p>
            <p className="mt-1">приложение 1.3 BETA (содержутся ошибки!)</p>
          </div>
        </div>

        <NavBar />
      </div>
      <footer className="mx-auto mb-3 mt-6 flex w-[92.5%] flex-col sm:max-w-[47rem]">
        <div className="flex flex-row items-center justify-between">
          <div className="flex w-fit flex-row items-center pl-2 text-muted-foreground sm:mx-0">
            <Logo width={19} height={19} className="my-0" withText={true} />
          </div>
          
          <div className="flex flex-row justify-center gap-2">
            <a href={env.NEXT_PUBLIC_CONTACT_LINK} target="_blank" rel="noopener">
              <Button variant="samga" size="sm" className="p-1 px-3">
                <span className="text-white">Создано qynon</span>
              </Button>
            </a>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Layout
