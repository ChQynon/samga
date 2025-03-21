import { Metadata } from 'next'
import dynamic from 'next/dynamic'

// Используем динамический импорт для клиентского компонента
const TermsOfUseContent = dynamic(() => import('@/components/pages/TermsOfUseContent'), {
  ssr: true,
})

export const metadata: Metadata = {
  title: 'Условия использования | samga.nis',
  description: 'Ознакомьтесь с условиями использования samga.nis - правилами доступа и использования нашего сайта.',
}

export default function TermsOfUsePage() {
  return <TermsOfUseContent />
} 