import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Политика конфиденциальности',
  description: 'Политика конфиденциальности и обработки персональных данных Myfair',
}

export default function PrivacyLayout({
  children,
}: { children: React.ReactNode }) {
  return children
}
