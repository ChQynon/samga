import { Metadata } from 'next'
import TermsOfUseContent from '@/components/pages/TermsOfUseContent'

export const metadata: Metadata = {
  title: 'Условия использования | samga.nis',
  description: 'Ознакомьтесь с условиями использования samga.nis - правилами доступа и использования нашего сайта.',
}

export default function TermsOfUsePage() {
  return <TermsOfUseContent />
} 