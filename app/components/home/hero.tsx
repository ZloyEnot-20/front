'use client'

import Link from 'next/link'
import { useLocale } from '@/lib/i18n'
import { useAuth } from '@/lib/auth-context'

export function Hero() {
  const { t } = useLocale()
  const { user } = useAuth()
  const showRegister = !user || (user.role !== 'exhibitor')
  return (
    <section className="border-b border-border/40" style={{ minHeight: '320px' }}>
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
            {t('heroTitle')}{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('heroTitleHighlight')}
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-balance">
            {t('heroSubtitle')}
          </p>
          <div className="flex gap-4 flex-wrap">
            <a
              href="#exhibitions"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-11 px-8 hover:bg-primary/90"
            >
              {t('viewExhibitions')}
            </a>
            {showRegister && (
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background h-11 px-8 hover:bg-accent"
              >
                {t('registerNow')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
