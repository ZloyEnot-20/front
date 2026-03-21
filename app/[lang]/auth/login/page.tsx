'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'
import { useLocale } from '@/lib/i18n'
import { isLandingLang, type LandingLang } from '@/lib/i18n/landing-lang'

export default function LocalizedLoginPage() {
  const params = useParams()
  const raw = typeof params.lang === 'string' ? params.lang : 'uz'
  const lang: LandingLang = isLandingLang(raw) ? raw : 'uz'
  const { t } = useLocale()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 px-4 py-8">
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <Link href={`/${lang}`} className="mb-8 block cursor-pointer text-center transition-opacity hover:opacity-90">
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
