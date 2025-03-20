import NavBar from '@/widgets/navbar/NavBar'
import React, { FC, PropsWithChildren } from 'react'
import Header from '@/widgets/header/Header'
import Logo from '@/components/misc/Logo'
import { Button } from '@/components/ui/button'
import { Ghost, GithubLogo, PiggyBank } from '@phosphor-icons/react/dist/ssr'
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
      <footer className="mx-auto mb-3 mt-10 flex w-[92.5%] flex-row justify-between sm:mt-auto sm:max-w-[47rem] sm:flex-row">
        <div className="flex w-fit flex-row items-center pl-2 text-muted-foreground sm:mx-0">
          <Logo width={19} height={19} className="my-0" withText={true} />
        </div>
        <div className="flex flex-row justify-center text-center">
          <a href={env.NEXT_PUBLIC_CONTACT_LINK} target="_blank" rel="noopener">
            <Button variant="link" className="mx-1 p-1 px-2">
              <span className="text-muted-foreground">Создано qynon</span>
            </Button>
          </a>
        </div>
      </footer>
    </>
  )
}

export default Layout
