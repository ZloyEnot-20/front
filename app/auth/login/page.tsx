'use client'

import Link from 'next/link'
import { useLocale } from '@/lib/i18n'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  const { t, lang } = useLocale()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 px-4 py-8">
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <Link href="/" className="mb-8 block cursor-pointer text-center transition-opacity hover:opacity-90">
          <img src="/logo.png" alt="" className="mx-auto mb-4 h-16 w-16 rounded-xl object-contain" />
          <h1 className="mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-4xl font-bold text-transparent">
            {t('appName')}
          </h1>
          <p className="text-muted-foreground">{t('platformSubtitle')}</p>
        </Link>
        <LoginForm localePrefix={lang} />
      </div>
    </div>
  )
}
