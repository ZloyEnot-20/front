'use client'

import { useLocale } from '@/lib/i18n'
import { getLandingMobileAppStoreUrls } from '@/lib/landing-mobile-app-urls'
import { cn } from '@/lib/utils'

/** Те же файлы, что `app/profile/apple.svg` и `app/profile/google-play.svg`, копия в `public/profile/` для URL. */
const PROFILE_APPLE_SVG = '/profile/apple.svg'
const PROFILE_GOOGLE_PLAY_SVG = '/profile/google-play.svg'

const profileIconClass = 'size-8 shrink-0 object-contain brightness-0 invert'

/** Единый фон для всех блоков «скачать приложение» */
const appDownloadSectionBg =
  'border-[#c8e8f6]/70 bg-gradient-to-b from-[#e3f5fc] via-[#f0faff] to-white'

type LandingAppDownloadVariant = 'afterHero' | 'middle' | 'end'

export function LandingAppDownloadBand({ variant }: { variant: LandingAppDownloadVariant }) {
  const { t } = useLocale()
  const { ios, android } = getLandingMobileAppStoreUrls()

  const btnShell = cn(
    'inline-flex min-h-[44px] w-full max-w-[200px] items-center justify-start gap-2.5 rounded-xl px-3 py-2 shadow-md transition-colors sm:w-auto sm:min-w-[168px] sm:max-w-none',
    'bg-neutral-950 text-white ring-1 ring-white/10 hover:bg-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#01AEF9]',
  )

  const inner = (
    <>
      <p className="landing-section-heading mb-4 text-center text-xl font-bold md:text-2xl">
        {t('landingAppDownloadTitle')}
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
        <a
          href={ios}
          target="_blank"
          rel="noopener noreferrer"
          className={btnShell}
          aria-label={t('landingAppDownloadAppStoreAlt')}
        >
          <img
            src={PROFILE_APPLE_SVG}
            alt=""
            width={32}
            height={32}
            className={profileIconClass}
            aria-hidden
            decoding="async"
          />
          <span className="min-w-0 flex-1 text-left leading-tight">
            <span className="block text-[0.65rem] font-medium tracking-wide text-white/85 sm:text-[0.7rem]">
              {t('landingAppDownloadIosLine1')}
            </span>
            <span className="block text-sm font-semibold sm:text-base">{t('landingAppDownloadIosLine2')}</span>
          </span>
        </a>
        <a
          href={android}
          target="_blank"
          rel="noopener noreferrer"
          className={btnShell}
          aria-label={t('landingAppDownloadGooglePlayAlt')}
        >
          <img
            src={PROFILE_GOOGLE_PLAY_SVG}
            alt=""
            width={32}
            height={32}
            className={profileIconClass}
            aria-hidden
            decoding="async"
          />
          <span className="min-w-0 flex-1 text-left leading-tight">
            <span className="block text-[0.65rem] font-medium tracking-wide text-white/85 sm:text-[0.7rem]">
              {t('landingAppDownloadAndroidLine1')}
            </span>
            <span className="block text-sm font-semibold sm:text-base">{t('landingAppDownloadAndroidLine2')}</span>
          </span>
        </a>
      </div>
    </>
  )

  if (variant === 'afterHero') {
    return (
      <section className={cn('border-b py-8 md:py-10', appDownloadSectionBg)} aria-label={t('landingAppDownloadTitle')}>
        <div className="container mx-auto max-w-6xl px-4">{inner}</div>
      </section>
    )
  }

  if (variant === 'middle') {
    return (
      <section className={cn('border-y py-12 md:py-14', appDownloadSectionBg)} aria-label={t('landingAppDownloadTitle')}>
        <div className="container mx-auto max-w-6xl px-4">{inner}</div>
      </section>
    )
  }

  return (
    <section className={cn('border-t py-12 md:py-16', appDownloadSectionBg)} aria-label={t('landingAppDownloadTitle')}>
      <div className="container mx-auto max-w-6xl px-4">{inner}</div>
    </section>
  )
}
