import { Metadata } from 'next'
import PrivacyPolicyContent from '@/components/pages/PrivacyPolicyContent'

export const metadata: Metadata = {
  title: 'Политика конфиденциальности | samga.nis',
  description: 'Ознакомьтесь с политикой конфиденциальности samga.nis - как мы собираем, используем и защищаем вашу информацию.',
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />
} 