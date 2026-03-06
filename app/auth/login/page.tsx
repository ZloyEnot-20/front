'use client'

import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'
import { useLocale } from '@/lib/i18n'

export default function LoginPage() {
  const { t } = useLocale()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 px-4 py-8">
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        <Link href="/" className="block text-center mb-8 cursor-pointer hover:opacity-90 transition-opacity">
          <img src="/logo.png" alt="" className="w-16 h-16 rounded-xl object-contain mx-auto mb-4" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            {t('appName')}
          </h1>
          <p className="text-muted-foreground">{t('platformSubtitle')}</p>
        </Link>
        <LoginForm />
      </div>
    </div>
  )
}
