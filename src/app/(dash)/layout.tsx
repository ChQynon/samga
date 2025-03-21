import NavBar from '@/widgets/navbar/NavBar'
import React, { FC, PropsWithChildren } from 'react'
import Header from '@/widgets/header/Header'
import Logo from '@/components/misc/Logo'
import { Button } from '@/components/ui/button'
import { TelegramLogo } from '@phosphor-icons/react/dist/ssr'
import { env } from '@/env'
import Link from 'next/link'
import { motion } from 'framer-motion'

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
      <footer className="mx-auto mb-3 mt-10 flex w-[92.5%] flex-col space-y-4 sm:max-w-[47rem]">
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
          </div>
        </div>
        
        <div className="mt-2 flex flex-col items-center justify-center gap-2">
          <a href="https://t.me/samgay_nis" target="_blank" rel="noopener" className="flex items-center gap-2 rounded-lg border border-muted p-2 hover:bg-muted/50">
            <TelegramLogo className="h-5 w-5" />
            <span className="text-sm font-medium">Наш Telegram канал</span>
          </a>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3 border-t border-muted pt-3 text-center"
        >
          <Link href="/privacy-policy" className="text-xs text-muted-foreground hover:text-primary hover:underline">
            Политика конфиденциальности
          </Link>
          <Link href="/terms-of-use" className="text-xs text-muted-foreground hover:text-primary hover:underline">
            Условия использования
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-lg border border-yellow-200/30 bg-yellow-50/50 p-3 dark:border-yellow-900/30 dark:bg-yellow-950/20"
        >
          <p className="text-center text-xs text-muted-foreground">
            Данный сайт не имеет официальной связи с <a href="https://www.nis.edu.kz/" target="_blank" rel="noopener" className="font-medium text-primary hover:underline">АОО "Назарбаев Интеллектуальные школы"</a> и является независимым проектом.
          </p>
        </motion.div>
      </footer>
    </>
  )
}

export default Layout
