'use client'

import { LoginForm } from '@/components/auth/login-form'
import { useLocale } from '@/lib/i18n'

export default function LoginPage() {
  const { t } = useLocale()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            {t('appName')}
          </h1>
          <p className="text-muted-foreground">{t('platformSubtitle')}</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
