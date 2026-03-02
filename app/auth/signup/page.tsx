'use client'

import { VisitorSignupForm } from '@/components/auth/visitor-signup-form'
import { useLocale } from '@/lib/i18n'

export default function SignupPage() {
  const { t } = useLocale()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            {t('appName')}
          </h1>
          <p className="text-muted-foreground">{t('platformSubtitle')}</p>
        </div>
        <VisitorSignupForm />
      </div>
    </div>
  )
}
