'use client'

import { useLocale } from '@/lib/i18n'
import { getLandingMobileAppStoreUrls } from '@/lib/landing-mobile-app-urls'
import { cn } from '@/lib/utils'

const PROFILE_APPLE_SVG = '/profile/apple.svg'
const PROFILE_GOOGLE_PLAY_SVG = '/profile/google-play.svg'

const profileIconClass = 'size-8 shrink-0 object-contain brightness-0 invert'

const btnShell = cn(
  'inline-flex min-h-[44px] w-full max-w-[200px] items-center justify-start gap-2.5 rounded-xl px-3 py-2 shadow-md transition-colors sm:w-auto sm:min-w-[168px] sm:max-w-none',
  'bg-neutral-950 text-white ring-1 ring-white/10 hover:bg-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
)

export function AppDownloadLinks({
  className,
  titleClassName,
  actionsClassName,
}: {
  className?: string
  titleClassName?: string
  actionsClassName?: string
}) {
  const { t } = useLocale()
  const { ios, android } = getLandingMobileAppStoreUrls()

  return (
    <div className={cn(className)}>
      <p className={cn('mb-4 text-xl font-bold md:text-2xl', titleClassName)}>{t('landingAppDownloadTitle')}</p>
      <div
        className={cn(
          'flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4',
          actionsClassName,
        )}
      >
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
    </div>
  )
}
