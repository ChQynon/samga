import React from 'react'
import AuthForm from '@/widgets/login/AuthForm'
import Logo from '@/components/misc/Logo'
import { env } from '@/env'

const Page = () => {
  return (
    <div className="items-left mx-auto flex h-screen max-w-96 flex-col justify-center p-4 text-left page-transition">
      <div className="mb-6 flex items-center">
        <Logo width={48} height={48} className="mr-3" withText={true} />
      </div>
      
      <h2 className="w-full scroll-m-20 text-left text-3xl font-semibold leading-none tracking-tight first:mt-0">
        Вход
      </h2>

      <p className="w-full text-left leading-7 text-muted-foreground">
        Используйте свой аккаунт СУШ
      </p>

      <AuthForm />
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <a href={env.NEXT_PUBLIC_CONTACT_LINK} target="_blank" rel="noopener" className="hover:text-primary transition-colors">
          Создано qynon
        </a>
      </div>
    </div>
  )
}

export default Page
