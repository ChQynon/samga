import { Metadata } from 'next'
import dynamic from 'next/dynamic'

// Используем динамический импорт для клиентского компонента
const PrivacyPolicyContent = dynamic(() => import('@/components/pages/PrivacyPolicyContent'), {
  ssr: true,
})

export const metadata: Metadata = {
  title: 'Политика конфиденциальности | samga.nis',
  description: 'Ознакомьтесь с политикой конфиденциальности samga.nis - как мы собираем, используем и защищаем вашу информацию.',
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />
} 