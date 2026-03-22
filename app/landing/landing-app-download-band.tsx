'use client'

import { AppDownloadLinks } from '@/components/app-download-links'
import { useLocale } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/** Единый фон для всех блоков «скачать приложение» (кроме полосы в герое лендинга) */
const appDownloadSectionBg =
  'border-[#c8e8f6]/70 bg-gradient-to-b from-[#e3f5fc] via-[#f0faff] to-white'

type LandingAppDownloadVariant = 'afterHero' | 'middle' | 'end'

export function LandingAppDownloadBand({ variant }: { variant: LandingAppDownloadVariant }) {
  const { t } = useLocale()

  const titleClassName = cn(
    'text-center',
    variant === 'afterHero' ? 'text-white drop-shadow-sm' : 'landing-section-heading',
  )

  const inner = (
    <div className="container mx-auto max-w-6xl px-4">
      <AppDownloadLinks titleClassName={titleClassName} />
    </div>
  )

  if (variant === 'afterHero') {
    return (
      <section className="py-8 md:py-10" aria-label={t('landingAppDownloadTitle')}>
        {inner}
      </section>
    )
  }

  if (variant === 'middle') {
    return (
      <section className={cn('border-y py-12 md:py-14', appDownloadSectionBg)} aria-label={t('landingAppDownloadTitle')}>
        {inner}
      </section>
    )
  }

  return (
    <section className={cn('border-t py-12 md:py-16', appDownloadSectionBg)} aria-label={t('landingAppDownloadTitle')}>
      {inner}
    </section>
  )
}
