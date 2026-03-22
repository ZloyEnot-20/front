'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Facebook, HelpCircle, Info, Instagram, Minus, Play, PlayCircle, Plus, Send, Youtube } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { landingPublicImage } from '@/lib/landing-public-images'
import { getLandingReviewEmbedSrc } from '@/lib/landing-review-youtube'
import { getImageUrl } from '@/lib/api'
import {
  buildUtmQueryFromSearch,
  fetchLandingScheduleExhibitions,
  formatScheduleCardLinesForLang,
  scheduleCardTitleForLang,
  venueLabelForLang,
  venueMapHref,
  type LandingScheduleExhibition,
} from '@/lib/landing-schedule-exhibitions'
import { LANDING_TELEGRAM_TEASER_CARD_IMAGE } from '@/lib/landing-telegram-teaser-cards'
import type { LandingLang } from '@/lib/i18n/landing-lang'
import { useLocale } from '@/lib/i18n'
import { LANDING_ROTATING_CITY_PREFIXES } from '@/lib/landing-rotating-cities'
import { LandingAppDownloadBand } from './landing-app-download-band'
import { LandingOrganizersCarousel } from './organizers-carousel'
import { LandingPartnersCarousel } from './partners-carousel'

const TELEGRAM_HELP_URL = 'https://t.me/myfair_help'

const TELEGRAM_EVENTS_URL = 'https://t.me/myfair_events'

const BLOG_TELEGRAM_ILLUSTRATION = landingPublicImage('fb38cf4e46d02f1b202ce4c2be5cfcb5.png')

const REGISTRATION_ILLUSTRATION = landingPublicImage('594a75bed1ba864085eeac044126d58d.png')

const REVIEW_VIDEO_THUMB = landingPublicImage('7665ed017e5dfd3e3333075462c8b75e.jpg')

const YOUTUBE_MYFAIR_CHANNEL = 'https://www.youtube.com/@myfairuzbekistan'

const ABITURIENT_UZ_URL = 'https://myfair.events/abiturient/uz'

const FOOTER_PORTAL_CTA_IMG = landingPublicImage('465bed6e075a99229a6d5e228830fea3.png')

function LandingFooterTelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
      />
    </svg>
  )
}

const LANDING_FOOTER_SOCIALS = [
  { href: 'https://t.me/myfair_events', label: 'Telegram', Icon: LandingFooterTelegramIcon },
  { href: 'https://www.instagram.com/myfair.events/', label: 'Instagram', Icon: Instagram },
  { href: 'https://facebook.com/myfair.events', label: 'Facebook', Icon: Facebook },
  { href: 'https://youtube.com/@myfairuzbekistan', label: 'YouTube', Icon: Youtube },
] as const

const AUDIENCE_CARD_IMAGES = [
  landingPublicImage('ef2a8cd228fa60716b993dcff3e17585.png'),
  landingPublicImage('3089436914855a105769d3ec3eb08adc.png'),
  landingPublicImage('d1eb2373f77f59d967653bf9f9d4361f.png'),
  landingPublicImage('8aa671cf2a55e290c5d0c29fee6a39de.png'),
] as const

const LANDING_STEP_ASSETS = [
  { tone: 'violet' as const, src: landingPublicImage('ddf7f525eaa8c26529ad2dadc2596fbd.png'), href: '#schedule' as const },
  { tone: 'orange' as const, src: landingPublicImage('33903c6b82c21d9cdde74f59ce680818.png'), href: '#contacts' as const },
  { tone: 'teal' as const, src: landingPublicImage('a5391f7ab3c58347c692cd09f57fb747.png'), href: '#contacts' as const },
  { tone: 'blue' as const, src: landingPublicImage('7cf28d221379ed0da52cf80f5445238a.png'), href: '#contacts' as const },
] as const

function LandingHeroLangButtons({
  lang,
  router,
}: {
  lang: string
  router: { replace: (href: string) => void }
}) {
  return (
    <>
      <button
        type="button"
        onClick={() => router.replace('/ru')}
        className={`landing-lang-btn ${lang === 'ru' ? 'landing-lang-active' : ''}`}
      >
        RU
      </button>
      <button
        type="button"
        onClick={() => router.replace('/en')}
        className={`landing-lang-btn ${lang === 'en' ? 'landing-lang-active' : ''}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => router.replace('/uz')}
        className={`landing-lang-btn ${lang === 'uz' ? 'landing-lang-active' : ''}`}
      >
        UZ
      </button>
    </>
  )
}

function RotatingCityHeadline({ cities }: { cities: readonly string[] }) {
  const [index, setIndex] = useState(0)
  const len = cities.length || 1

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % len)
    }, 2200)
    return () => window.clearInterval(id)
  }, [len])

  const label = cities[index] ?? ''
  return (
    <em className="landing-about-rotating-em" key={label}>
      {label}
    </em>
  )
}

export default function LandingPage({ initialLang: _initialLang }: { initialLang: LandingLang }) {
  const router = useRouter()
  const { t, lang } = useLocale()
  const landingLang = lang as LandingLang
  const rotatingCities = LANDING_ROTATING_CITY_PREFIXES[landingLang]

  const faqItems = useMemo(
    () => [
      { q: t('landingFaq1Q'), a: t('landingFaq1A') },
      { q: t('landingFaq2Q'), a: t('landingFaq2A') },
      { q: t('landingFaq3Q'), a: t('landingFaq3A') },
      { q: t('landingFaq4Q'), a: t('landingFaq4A') },
      { q: t('landingFaq5Q'), a: t('landingFaq5A') },
    ],
    [t],
  )

  const audienceCards = useMemo(
    () => [
      { title: t('landingAudience1Title'), desc: t('landingAudience1Desc'), src: AUDIENCE_CARD_IMAGES[0] },
      { title: t('landingAudience2Title'), desc: t('landingAudience2Desc'), src: AUDIENCE_CARD_IMAGES[1] },
      { title: t('landingAudience3Title'), desc: t('landingAudience3Desc'), src: AUDIENCE_CARD_IMAGES[2] },
      { title: t('landingAudience4Title'), desc: t('landingAudience4Desc'), src: AUDIENCE_CARD_IMAGES[3] },
    ],
    [t],
  )

  const landingSteps = useMemo(
    () => [
      {
        ...LANDING_STEP_ASSETS[0],
        step: t('landingStep1Label'),
        title: t('landingStep1Title'),
        desc: t('landingStep1Desc'),
      },
      {
        ...LANDING_STEP_ASSETS[1],
        step: t('landingStep2Label'),
        title: t('landingStep2Title'),
        desc: t('landingStep2Desc'),
      },
      {
        ...LANDING_STEP_ASSETS[2],
        step: t('landingStep3Label'),
        title: t('landingStep3Title'),
        desc: t('landingStep3Desc'),
      },
      {
        ...LANDING_STEP_ASSETS[3],
        step: t('landingStep4Label'),
        title: t('landingStep4Title'),
        desc: t('landingStep4Desc'),
      },
    ],
    [t],
  )

  const tgTeaserCards = useMemo(
    () => [
      { title: t('landingTg1Title'), description: t('landingTg1Desc'), ctaLabel: t('landingTg1Cta') },
      { title: t('landingTg2Title'), description: t('landingTg2Desc'), ctaLabel: t('landingTg2Cta') },
      { title: t('landingTg3Title'), description: t('landingTg3Desc'), ctaLabel: t('landingTg3Cta') },
      { title: t('landingTg4Title'), description: t('landingTg4Desc'), ctaLabel: t('landingTg4Cta') },
    ],
    [t],
  )

  const [cookieAccepted, setCookieAccepted] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [scheduleExhibitions, setScheduleExhibitions] = useState<LandingScheduleExhibition[]>([])
  const [scheduleLoading, setScheduleLoading] = useState(true)
  const [scheduleUtm, setScheduleUtm] = useState('')
  const [reviewVideoOpen, setReviewVideoOpen] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('landing_cookie_accept')
    if (stored === '1') setCookieAccepted(true)
  }, [])

  useEffect(() => {
    setScheduleUtm(buildUtmQueryFromSearch(typeof window !== 'undefined' ? window.location.search : ''))
  }, [])

  useEffect(() => {
    let cancelled = false
    setScheduleLoading(true)
    fetchLandingScheduleExhibitions()
      .then((list) => {
        if (!cancelled) setScheduleExhibitions(list)
      })
      .finally(() => {
        if (!cancelled) setScheduleLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const reviewEmbedSrc = getLandingReviewEmbedSrc(process.env.NEXT_PUBLIC_LANDING_REVIEW_YOUTUBE_VIDEO_ID)

  const acceptCookie = () => {
    localStorage.setItem('landing_cookie_accept', '1')
    setCookieAccepted(true)
  }

  const reviewChannelHref = `${YOUTUBE_MYFAIR_CHANNEL}${scheduleUtm}`
  const reviewThumb = (
    <div
      className="landing-review-thumb relative aspect-video w-full overflow-hidden rounded-xl bg-gray-200 bg-cover bg-center shadow-md"
      style={{ backgroundImage: `url(${REVIEW_VIDEO_THUMB})` }}
    >
      <span className="landing-review-thumb-overlay absolute inset-0 bg-black/25" aria-hidden />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="landing-review-play-btn flex size-16 items-center justify-center rounded-full bg-white/90 text-[#01AEF9] shadow-lg transition-transform hover:scale-105 md:size-20">
          <Play className="ml-1 size-8 md:size-10" fill="currentColor" aria-hidden />
        </span>
      </span>
    </div>
  )

  return (
    <div className="min-h-screen">
      {!cookieAccepted && (
        <div id="cookie-notification" className="cookie-notification">
          <svg className="cookie-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" aria-hidden>
            <path d="M17.561 17.439a1.5 1.5 0 1 1-2.125 2.117 1.5 1.5 0 0 1 2.125-2.117Zm-10.125-1a1.5 1.5 0 1 0 .003 0h-.003Zm1.125-4.875a1.5 1.5 0 1 0-.487.324c.183-.076.348-.187.487-.327v.003Zm6-.125a1.5 1.5 0 1 0-2.117 2.124 1.5 1.5 0 0 0 2.117-2.124ZM26 13A13 13 0 1 1 13 0a1 1 0 0 1 1 1 5 5 0 0 0 5 5 1 1 0 0 1 1 1 5 5 0 0 0 5 5 1 1 0 0 1 1 1Zm-2.039.924a7.017 7.017 0 0 1-5.898-5.986 7.016 7.016 0 0 1-5.987-5.9 11 11 0 1 0 11.885 11.886Z" />
          </svg>
          <div className="cookie-message">{t('landingCookieMessage')}</div>
          <div className="cookie-buttons">
            <button type="button" className="cookie-btn primary" id="cookie-accept" onClick={acceptCookie}>
              {t('landingCookieOk')}
            </button>
            <Link href="/privacy" className="cookie-btn secondary">
              {t('privacyPolicy')}
            </Link>
          </div>
        </div>
      )}

      <main>
        <section className="landing-hero-first">
          <div className="landing-hero-bg" aria-hidden />
          <div className="landing-hero-inner">
            <div className="landing-hero-content w-full px-4">
              <header className="landing-hero-header landing-hero-nav-bar landing-hero-nav-bar-lang-only md:hidden">
                <nav className="flex w-full justify-center" aria-label={t('landingLangSwitchAria')}>
                  <div className="landing-nav-col-lang flex items-center justify-center gap-2">
                    <LandingHeroLangButtons lang={lang} router={router} />
                  </div>
                </nav>
              </header>

              <header className="landing-hero-header landing-hero-nav-bar hidden md:block">
                <div className="landing-nav-grid">
                  <div className="landing-nav-col landing-nav-col-logo">
                    <Link href={`/${landingLang}`} className="landing-nav-logo" aria-label={t('landingLogoAria')}>
                      <Image src="/logo-landing.webp" alt="" width={54} height={54} className="h-[54px] w-auto" />
                    </Link>
                  </div>
                  <nav className="landing-nav-col landing-nav-col-menu">
                    <a href="#about" className="landing-nav-link">
                      {t('landingNavAbout')}
                    </a>
                    <a href="#schedule" className="landing-nav-link">
                      {t('landingNavSchedule')}
                    </a>
                    <a href="#participants" className="landing-nav-link">
                      {t('landingNavParticipants')}
                    </a>
                    <a href="#review" className="landing-nav-link">
                      {t('landingNavReview')}
                    </a>
                    <a href="#faq" className="landing-nav-link">
                      {t('landingNavFaq')}
                    </a>
                    <a href="#blog" className="landing-nav-link">
                      {t('landingNavBlog')}
                    </a>
                  </nav>
                  <div className="landing-nav-col landing-nav-col-lang">
                    <LandingHeroLangButtons lang={lang} router={router} />
                  </div>
                </div>
              </header>

              <div className="-mx-4">
                <LandingAppDownloadBand variant="afterHero" />
              </div>

              <div className="landing-hero-title-wrap relative">
                <p className="landing-hero-title-line">{t('landingHeroLine1')}</p>
                <p className="landing-hero-title-line">{t('landingHeroLine2')}</p>
              </div>

              <div className="landing-hero-stats grid grid-cols-2 gap-4 py-4 md:grid-cols-4 md:gap-5 md:py-6">
                {[
                  { num: '70+', label: t('landingStat1Label') },
                  { num: '12', label: t('landingStat2Label') },
                  { num: '100+', label: t('landingStat3Label') },
                  { num: '80 000+', label: t('landingStat4Label') },
                ].map((item) => (
                  <div key={item.num} className="landing-hero-stat-card text-center">
                    <div className="landing-bg-digits">{item.num}</div>
                    <div className="landing-bg-digits-cont">{item.label}</div>
                  </div>
                ))}
              </div>

              <div className="landing-hero-strip-wrap w-full overflow-hidden">
                <img
                  src={landingPublicImage('175ab97535444e8f4ca2615e2b2f9ddd.png')}
                  alt=""
                  className="landing-hero-strip-img min-h-[80px] w-full object-contain object-center md:h-full"
                  width={1920}
                  height={200}
                />
              </div>

              <div className="flex flex-col items-center gap-3 py-8 md:grid md:grid-cols-2 md:items-center md:gap-4 md:py-10">
                <div className="flex w-full justify-center md:justify-end">
                  <a
                    href="#review"
                    className="landing-hero-cta-white inline-flex w-full max-w-sm items-center justify-center gap-2 md:w-auto md:max-w-none"
                  >
                    <PlayCircle className="h-4 w-4" aria-hidden />
                    {t('landingCtaWatchVideo')}
                  </a>
                </div>
                <div className="flex w-full justify-center md:justify-start">
                  <a
                    href="#registration"
                    className="landing-hero-cta-white inline-flex w-full max-w-sm items-center justify-center md:w-auto md:max-w-none"
                  >
                    {t('landingCtaFreeTicket')}
                  </a>
                </div>
              </div>
            </div>
            <div className="landing-hero-gradient-bottom" aria-hidden />
          </div>
        </section>

        <section id="about" className="landing-about-section border-b border-gray-200 py-12 md:py-16 lg:py-20">
          <div className="container mx-auto flex max-w-6xl flex-col gap-10 px-4 md:gap-12">
            <div className="landing-about-block transition-transform duration-200 hover:scale-[1.01]">
              <div className="grid items-center gap-8 md:grid-cols-2 md:gap-10">
                <div>
                  <span className="landing-about-date-badge inline-flex items-center rounded-md border-2 border-[#01AEF9] px-3 py-2 text-sm font-medium text-gray-900">
                    {t('landingAboutDateBadge')}
                  </span>
                  <p className="mt-6 text-xl font-bold leading-snug text-gray-900 md:text-2xl">
                    <span className="text-[#01AEF9]">
                      <RotatingCityHeadline cities={rotatingCities} />
                    </span>{' '}
                    {t('landingAboutRotatingSuffix')}
                  </p>
                </div>
                <p className="text-base leading-relaxed text-gray-600 md:text-lg">{t('landingAboutBody')}</p>
              </div>
            </div>

            <div className="grid gap-10 md:grid-cols-2 md:gap-8 lg:gap-12">
              <div className="landing-about-block landing-about-card-with-footer-image transition-transform duration-200 hover:scale-[1.02]">
                <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
                  <strong>{t('landingAboutWorldUnisTitle')}</strong>
                </h2>
                <p className="landing-text-muted mt-3 text-base leading-relaxed">{t('landingAboutWorldUnisBody')}</p>
                <div className="landing-card-footer-image">
                  <img
                    src={landingPublicImage('8b0b00d8d71ad8e704ffec3f1d66652d.png')}
                    alt=""
                    width={428}
                    height={320}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
              <div className="landing-about-block landing-about-card-with-footer-image transition-transform duration-200 hover:scale-[1.02]">
                <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
                  <strong>{t('landingAbout100Title')}</strong>
                </h2>
                <p className="landing-text-muted mt-3 text-base leading-relaxed">{t('landingAbout100Body')}</p>
                <div className="landing-card-footer-image">
                  <img
                    src={landingPublicImage('caca9b43739260b3b39a024b503bf4dd.png')}
                    alt=""
                    width={428}
                    height={320}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </div>

            <div className="landing-about-block landing-about-jonli transition-transform duration-200 hover:scale-[1.01]">
              <div className="grid items-start gap-10 md:grid-cols-2 md:gap-8 lg:gap-12">
                <div className="landing-jonli-text-col">
                  <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
                    <strong>{t('landingAboutLiveTitle')}</strong>
                  </h2>
                  <p className="landing-text-muted mt-3 text-base leading-relaxed">{t('landingAboutLiveBody')}</p>
                  <div className="mt-6 hidden md:block">
                    <Link
                      href={`/${landingLang}/auth/signup`}
                      className="landing-btn-primary inline-flex h-10 min-w-[200px] items-center justify-center px-7 text-sm font-medium"
                    >
                      {t('landingCtaFreeTicket')}
                    </Link>
                  </div>
                </div>
                <div className="landing-jonli-image-shell flex w-full flex-col items-stretch">
                  <img
                    src={landingPublicImage('8ded74edba9b7385162f677ade7f3692.png')}
                    alt=""
                    className="h-auto w-full max-w-none"
                    width={428}
                    height={320}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="mt-6 md:hidden">
                    <Link
                      href={`/${landingLang}/auth/signup`}
                      className="landing-btn-primary inline-flex h-10 w-full max-w-xs items-center justify-center px-7 text-sm font-medium"
                    >
                      {t('landingCtaFreeTicket')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="container mx-auto max-w-6xl px-4">
            <h2 className="landing-section-heading mb-10 text-center text-3xl font-bold">
              <strong>{t('landingAudienceTitle')}</strong>
            </h2>
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
              {audienceCards.map((card) => (
                <div
                  key={card.title}
                  className="landing-about-block landing-audience-card landing-about-card-with-footer-image flex h-full flex-col text-left transition-transform duration-200 hover:scale-[1.02]"
                >
                  <h4 className="text-xl font-bold text-gray-900 md:text-[1.35rem]">
                    <strong>{card.title}</strong>
                  </h4>
                  <p className="landing-text-muted mt-3 flex-1 text-base leading-relaxed md:text-lg">{card.desc}</p>
                  <div className="landing-card-footer-image">
                    <img src={card.src} alt="" width={540} height={540} loading="lazy" decoding="async" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Link
                href={`/${landingLang}/auth/signup`}
                className="landing-btn-primary inline-flex h-10 min-w-[200px] items-center justify-center px-7 text-sm font-medium"
              >
                {t('landingCtaFreeTicket')}
              </Link>
            </div>
          </div>
        </section>

        <section className="landing-steps-section bg-white py-16 md:py-20">
          <div className="container mx-auto max-w-6xl px-4">
            <h2 className="landing-steps-section-title mb-4 text-center text-3xl font-bold">
              <strong>{t('landingStepsTitle')}</strong>
            </h2>
            <p className="mb-10 text-center text-lg text-gray-900">{t('landingStepsSubtitle')}</p>
            <div className="grid gap-10 md:grid-cols-2 md:gap-8 lg:gap-12">
              {landingSteps.map((item) => (
                <div
                  key={item.step}
                  className={`landing-about-block landing-about-card-with-footer-image landing-step-card landing-step-card-${item.tone} transition-transform duration-200 hover:scale-[1.02]`}
                >
                  <span className="landing-step-pill inline-flex items-center rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm">
                    {item.step}
                  </span>
                  <p className="mt-5 text-lg font-bold text-white md:text-xl">
                    <strong>{item.title}</strong>
                  </p>
                  <p className="mt-3 text-base leading-relaxed text-white/95">{item.desc}</p>
                  <div className="landing-card-footer-image">
                    <a
                      href={item.href}
                      className="landing-step-image-link block rounded-b-[inherit] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <img src={item.src} alt="" width={428} height={320} loading="lazy" decoding="async" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <LandingAppDownloadBand variant="middle" />

        <section id="schedule" className="landing-schedule-section landing-section-alt py-16 md:py-20">
          <div className="container mx-auto max-w-6xl px-4">
            <h1 className="landing-section-heading mb-4 text-3xl font-bold md:text-4xl">
              <strong>{t('landingScheduleTitle')}</strong>
            </h1>
            <p className="mb-10 text-lg text-gray-900">{t('landingScheduleSubtitle')}</p>
            {scheduleLoading ? (
              <p className="text-center text-sm landing-text-muted">{t('landingScheduleLoading')}</p>
            ) : scheduleExhibitions.length === 0 ? (
              <p className="text-center text-sm landing-text-muted">{t('landingScheduleEmpty')}</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {scheduleExhibitions.map((ex) => {
                  const { dateLine } = formatScheduleCardLinesForLang(ex, lang)
                  const venue = venueLabelForLang(ex, lang)
                  const mapHref = venueMapHref(venue)
                  const img = getImageUrl(ex.banner ?? ex.image)
                  return (
                    <div
                      key={ex.id}
                      className="landing-card landing-schedule-card overflow-hidden transition-transform duration-200 hover:scale-[1.02]"
                    >
                      <div className="relative aspect-[16/10] w-full min-h-[180px] overflow-hidden bg-gray-100 sm:min-h-[200px]">
                        {img ? (
                          <img
                            src={img}
                            alt=""
                            className="absolute inset-0 block h-full w-full object-fill"
                            width={640}
                            height={400}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : null}
                      </div>
                      <div className="flex flex-col gap-3 p-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          <strong>{scheduleCardTitleForLang(ex, lang)}</strong>
                        </h3>
                        {dateLine ? <p className="text-sm landing-text-muted">{dateLine}</p> : null}
                        {venue ? (
                          <p className="text-sm leading-relaxed landing-text-muted">
                            {mapHref !== '#' ? (
                              <a
                                href={mapHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-inherit underline-offset-2 hover:underline"
                              >
                                {venue}
                              </a>
                            ) : (
                              venue
                            )}
                          </p>
                        ) : null}
                        <Link
                          href={`/${landingLang}/auth/signup`}
                          className="landing-btn-primary flex h-10 w-full items-center justify-center text-sm font-medium"
                        >
                          {t('landingScheduleFreeTicket')}
                        </Link>
                        <Link
                          href={`/exhibitions/${ex.id}${scheduleUtm}`}
                          className="flex h-10 w-full items-center justify-center gap-2 rounded-md border-2 border-gray-300 bg-white text-sm font-medium text-gray-900 hover:border-[#01AEF9]"
                        >
                          <Info className="h-4 w-4 shrink-0 text-[#01AEF9]" aria-hidden />
                          {t('landingScheduleMore')}
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        <section id="participants" className="bg-white py-16 md:py-20">
          <div className="container mx-auto max-w-6xl px-4">
            <h1 className="landing-section-heading mb-4 text-center text-3xl font-bold md:text-4xl">
              <strong>{t('landingPartnersTitle')}</strong>
            </h1>
            <p className="mb-10 text-center text-lg text-gray-900">{t('landingPartnersSubtitle')}</p>
            <LandingPartnersCarousel
              ariaCarousel={t('landingCarouselPartnersAria')}
              ariaPrev={t('landingCarouselPrev')}
              ariaNext={t('landingCarouselNext')}
              ariaSlide={t('landingCarouselSlide')}
            />
          </div>
        </section>

        <section className="border-t border-gray-200 bg-white py-16 md:py-20">
          <div className="container mx-auto max-w-6xl px-4">
            <h2 className="landing-section-heading mb-10 text-center text-3xl font-bold md:text-4xl">
              <strong>{t('landingOrganizersTitle')}</strong>
            </h2>
            <LandingOrganizersCarousel
              utmQuery={scheduleUtm}
              ariaCarousel={t('landingCarouselOrganizersAria')}
              ariaPrev={t('landingCarouselPrev')}
              ariaNext={t('landingCarouselNext')}
              ariaSlide={t('landingCarouselSlide')}
            />
          </div>
        </section>

        <section id="review" className="landing-section-alt py-16 md:py-20">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-10">
              <div className="flex flex-col gap-4">
                <span className="landing-about-date-badge inline-flex w-fit items-center rounded-md border-2 border-[#01AEF9] px-3 py-2 text-sm font-medium text-gray-900">
                  {t('landingReviewBadge')}
                </span>
                <h2 className="landing-section-heading text-2xl font-bold md:text-3xl">
                  <strong>{t('landingReviewTitle')}</strong>
                </h2>
                <p className="landing-text-muted text-base leading-relaxed">{t('landingReviewBody')}</p>
                <a
                  href={`${YOUTUBE_MYFAIR_CHANNEL}${scheduleUtm}`}
                  className="landing-review-more-videos inline-flex w-fit items-center gap-2 rounded-lg border-2 border-[#01AEF9] bg-white px-7 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-[#01AEF9]/10"
                >
                  <PlayCircle className="size-5 shrink-0 text-[#01AEF9]" aria-hidden />
                  {t('landingReviewMoreVideos')}
                </a>
              </div>
              <div className="min-w-0">
                {reviewEmbedSrc ? (
                  <button type="button" className="block w-full cursor-pointer text-left" onClick={() => setReviewVideoOpen(true)}>
                    {reviewThumb}
                    <span className="sr-only">{t('landingReviewOpenVideo')}</span>
                  </button>
                ) : (
                  <a href={reviewChannelHref} className="block w-full">
                    {reviewThumb}
                    <span className="sr-only">{t('landingReviewSrOnly')}</span>
                  </a>
                )}
                {reviewEmbedSrc ? (
                  <Dialog open={reviewVideoOpen} onOpenChange={setReviewVideoOpen}>
                    <DialogContent
                      showCloseButton
                      className="max-h-[90vh] w-[calc(100%-2rem)] max-w-4xl gap-0 overflow-hidden border-0 p-0 sm:max-w-4xl"
                    >
                      <DialogTitle className="sr-only">{t('landingReviewDialogTitle')}</DialogTitle>
                      <div className="aspect-video w-full bg-black">
                        {reviewVideoOpen ? (
                          <iframe
                            title="YouTube video player"
                            src={reviewEmbedSrc}
                            className="size-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            referrerPolicy="strict-origin-when-cross-origin"
                          />
                        ) : null}
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="py-16 md:py-20">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid gap-10 md:grid-cols-2 md:items-start md:gap-12">
              <div className="flex flex-col gap-4">
                <h3 className="landing-section-heading text-2xl font-bold md:text-3xl">
                  <strong>{t('landingFaqTitle')}</strong>
                </h3>
                <p className="text-base leading-relaxed landing-text-muted">{t('landingFaqIntro')}</p>
                <a
                  href={`${TELEGRAM_HELP_URL}${scheduleUtm}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex w-fit items-center gap-2 rounded-lg border-2 border-[#01AEF9] bg-white px-7 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-[#01AEF9]/10"
                >
                  <HelpCircle className="size-5 shrink-0 text-[#01AEF9]" aria-hidden />
                  {t('landingFaqAsk')}
                </a>
              </div>
              <div className="min-w-0 space-y-2">
                {faqItems.map((item, i) => {
                  const open = faqOpen === i
                  return (
                    <div key={i} className="landing-faq-item">
                      <button
                        type="button"
                        className="flex w-full items-start gap-3 p-4 text-left font-medium text-gray-900"
                        onClick={() => setFaqOpen(open ? null : i)}
                        aria-expanded={open}
                      >
                        <span className="landing-text-muted mt-0.5 shrink-0" aria-hidden>
                          {open ? <Minus className="size-4" /> : <Plus className="size-4" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <strong>{item.q}</strong>
                        </span>
                      </button>
                      <div
                        className={`landing-faq-accordion-panel ${open ? 'landing-faq-accordion-panel-open' : ''}`}
                        aria-hidden={!open}
                      >
                        <div className="landing-faq-accordion-panel-inner">
                          <div className="landing-faq-answer">{item.a}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="registration" className="landing-section-alt py-16 md:py-20">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-[55fr_45fr] md:items-center md:gap-12">
              <div className="text-center md:text-left">
                <h2 className="landing-section-heading mb-4 text-2xl font-bold md:text-3xl">
                  <strong>{t('landingRegBlockTitle')}</strong>
                </h2>
                <p className="mb-6 text-base leading-relaxed landing-text-muted">{t('landingRegBlockBody')}</p>
                <Link
                  href={`/${landingLang}/auth/signup`}
                  className="landing-btn-primary inline-flex h-10 min-w-[200px] items-center justify-center px-7 text-sm font-medium"
                >
                  {t('landingRegBlockCta')}
                </Link>
              </div>
              <div className="flex justify-center md:justify-end">
                <img
                  src={REGISTRATION_ILLUSTRATION}
                  alt=""
                  width={378}
                  height={378}
                  className="h-auto w-full max-w-[378px] object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="blog" className="py-16 md:py-20">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-12">
              <div className="flex justify-center md:justify-start">
                <img
                  src={BLOG_TELEGRAM_ILLUSTRATION}
                  alt=""
                  width={1222}
                  height={800}
                  className="h-auto w-full max-w-xl object-contain md:max-w-none"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-col gap-4 text-center md:text-left">
                <h2 className="landing-section-heading text-2xl font-bold md:text-3xl">
                  <strong>{t('landingBlogTitle')}</strong>
                </h2>
                <p className="text-base leading-relaxed landing-text-muted">{t('landingBlogBody')}</p>
                <div className="mt-2 grid grid-cols-1 items-center gap-4 sm:grid-cols-[41fr_59fr] sm:gap-5">
                  <a
                    href={`${TELEGRAM_EVENTS_URL}${scheduleUtm}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-lg bg-[#01AEF9] px-7 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-[#0199d9] sm:w-auto"
                  >
                    <Send className="size-5 shrink-0 text-white" aria-hidden />
                    {t('landingBlogSubscribe')}
                  </a>
                  <p className="landing-section-heading text-center text-base font-semibold sm:text-left">
                    <strong>{t('landingBlogBonus')}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20" aria-label={t('landingTgTeaserSectionAria')}>
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid gap-6 sm:grid-cols-2 md:gap-8">
              {tgTeaserCards.map((card) => (
                <article
                  key={card.title}
                  className="landing-card landing-telegram-teaser-card flex flex-col overflow-hidden p-0 transition-transform duration-200 ease-out hover:scale-[1.02] hover:shadow-md"
                >
                  <div className="px-4 pt-4">
                    <div
                      className="h-[30px] w-[30px] shrink-0 bg-contain bg-left bg-no-repeat"
                      style={{ backgroundImage: `url(${LANDING_TELEGRAM_TEASER_CARD_IMAGE})` }}
                      aria-hidden
                    />
                  </div>
                  <div className="flex flex-col gap-2 px-4 pb-4 pt-3">
                    <h2 className="text-lg font-bold text-gray-900">
                      <strong>{card.title}</strong>
                    </h2>
                    <p className="text-sm leading-relaxed landing-text-muted">{card.description}</p>
                    <a
                      href={`${TELEGRAM_EVENTS_URL}${scheduleUtm}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="landing-link mt-1 inline-flex text-sm font-medium"
                    >
                      {card.ctaLabel}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <LandingAppDownloadBand variant="end" />
      </main>

      <footer id="contacts" className="landing-footer landing-footer-banner">
        <div className="landing-footer-bg" aria-hidden />
        <div className="landing-footer-inner container mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 md:gap-8">
          <a
            href={`${ABITURIENT_UZ_URL}${scheduleUtm}`}
            rel="noopener noreferrer"
            className="landing-footer-portal-btn"
            aria-label={t('landingFooterPortalAria')}
          >
            <img
              src={FOOTER_PORTAL_CTA_IMG}
              alt=""
              width={54}
              height={54}
              className="h-[54px] w-[54px] object-contain"
              loading="lazy"
            />
          </a>
          <nav className="landing-footer-socials" aria-label={t('landingFooterSocialsAria')}>
            {LANDING_FOOTER_SOCIALS.map(({ href, label, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                {label === 'Telegram' ? (
                  <LandingFooterTelegramIcon className="h-10 w-10" />
                ) : (
                  <Icon className="h-10 w-10" strokeWidth={1.25} />
                )}
              </a>
            ))}
          </nav>
          <p className="landing-footer-copyright">
            {t('landingFooterCopyright1')}
            <br />
            {t('landingFooterCopyright2')}
          </p>
        </div>
      </footer>
    </div>
  )
}
