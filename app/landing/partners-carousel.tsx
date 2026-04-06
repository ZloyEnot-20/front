'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import { landingPartnersApi, landingPartnerLogoSrc } from '@/lib/api'
import { preloadPartnerImages } from '@/lib/partner-images-batch'
import { useLocale } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const SLIDE_SIZE = 15

export type LandingPartnerCard = { id: string; href: string; image: string }

function chunkPartnerSlides(partners: LandingPartnerCard[]): LandingPartnerCard[][] {
  if (!partners.length) return []
  const slides: LandingPartnerCard[][] = []
  for (let i = 0; i < partners.length; i += SLIDE_SIZE) {
    slides.push(partners.slice(i, i + SLIDE_SIZE))
  }
  return slides
}

const navBtnClass =
  'inline-flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-[#01AEF9] bg-white/95 text-[#01AEF9] shadow-sm transition-colors hover:bg-[#01AEF9]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#01AEF9] disabled:pointer-events-none disabled:opacity-35'

function usePartnerGridCols(): 2 | 3 | 5 {
  return React.useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {}
      const mq768 = window.matchMedia('(min-width: 768px)')
      const mq640 = window.matchMedia('(min-width: 640px)')
      const fn = () => {
        onStoreChange()
      }
      mq768.addEventListener('change', fn)
      mq640.addEventListener('change', fn)
      return () => {
        mq768.removeEventListener('change', fn)
        mq640.removeEventListener('change', fn)
      }
    },
    () => {
      if (typeof window === 'undefined') return 2
      if (window.matchMedia('(min-width: 768px)').matches) return 5
      if (window.matchMedia('(min-width: 640px)').matches) return 3
      return 2
    },
    () => 2,
  )
}

/** Секция лендинга: загрузка партнёров из API; не рендерится, если список пуст. */
export function LandingPartnersSection() {
  const { t } = useLocale()
  const [partners, setPartners] = React.useState<LandingPartnerCard[]>([])
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    landingPartnersApi
      .listPublicCached()
      .then((list) => {
        if (cancelled) return
        const cards = list.map((p) => ({
          id: p.id,
          href: p.href,
          image: landingPartnerLogoSrc(p),
        }))
        setPartners(cards)
        preloadPartnerImages(
          cards.map((c) => c.image),
          5,
          50,
        )
      })
      .catch(() => {
        if (!cancelled) setPartners([])
      })
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!loaded) return null

  return (
    <section id="participants" className="bg-white py-16 md:py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <h1 className="landing-section-heading mb-4 text-center text-3xl font-bold md:text-4xl">
          <strong>{t('landingPartnersTitle')}</strong>
        </h1>
        <p className="mb-10 text-center text-lg text-gray-900">{t('landingPartnersSubtitle')}</p>
        {partners.length > 0 ? (
          <LandingPartnersCarousel
            partners={partners}
            ariaCarousel={t('landingCarouselPartnersAria')}
            ariaPrev={t('landingCarouselPrev')}
            ariaNext={t('landingCarouselNext')}
            ariaSlide={t('landingCarouselSlide')}
          />
        ) : (
          <p className="text-center text-muted-foreground">{t('landingPartnersEmpty')}</p>
        )}
      </div>
    </section>
  )
}

export function LandingPartnersCarousel({
  partners,
  ariaCarousel = 'Participating university logos',
  ariaPrev = 'Previous slide',
  ariaNext = 'Next slide',
  ariaSlide = 'Slide',
}: {
  partners: LandingPartnerCard[]
  ariaCarousel?: string
  ariaPrev?: string
  ariaNext?: string
  ariaSlide?: string
}) {
  const slides = React.useMemo(() => chunkPartnerSlides(partners), [partners])
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    if (!api) return
    const onSelect = () => setCurrent(api.selectedScrollSnap())
    onSelect()
    api.on('select', onSelect)
    api.on('reInit', onSelect)
    return () => {
      api.off('select', onSelect)
      api.off('reInit', onSelect)
    }
  }, [api])

  const cols = usePartnerGridCols()
  const rowSize = cols

  if (!slides.length) return null

  return (
    <div className="landing-partners-carousel relative w-full">
      <button
        type="button"
        aria-label={ariaPrev}
        className={cn(navBtnClass, 'absolute left-0 top-1/2 z-10 -translate-y-1/2')}
        disabled={!api}
        onClick={() => api?.scrollPrev()}
      >
        <ChevronLeft className="size-5" aria-hidden />
      </button>

      <button
        type="button"
        aria-label={ariaNext}
        className={cn(navBtnClass, 'absolute right-0 top-1/2 z-10 -translate-y-1/2')}
        disabled={!api}
        onClick={() => api?.scrollNext()}
      >
        <ChevronRight className="size-5" aria-hidden />
      </button>

      <div className="min-w-0 overflow-hidden px-12 sm:px-14 md:px-16">
        <Carousel
          opts={{ align: 'start', loop: true }}
          setApi={setApi}
          className="w-full"
          aria-label={ariaCarousel}
        >
          <CarouselContent>
            {slides.map((slide, slideIndex) => (
              <CarouselItem key={slideIndex}>
                <div className="flex flex-col gap-5 py-2 md:gap-6">
                  {Array.from({ length: Math.ceil(slide.length / rowSize) }).map((_, rowIdx) => {
                    const rowPartners = slide.slice(rowIdx * rowSize, rowIdx * rowSize + rowSize)
                    return (
                      <div
                        key={rowIdx}
                        className={cn(
                          'grid gap-3 md:gap-4',
                          cols === 2 && 'grid-cols-2',
                          cols === 3 && 'grid-cols-3',
                          cols === 5 && 'grid-cols-5',
                        )}
                      >
                        {rowPartners.map((p, i) => (
                          <a
                            key={p.id}
                            href={p.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              'flex h-[5.5rem] items-center justify-center rounded-xl border border-gray-100 bg-[#ffffff] p-3 shadow-sm transition-transform duration-200 hover:scale-105 hover:border-[#01AEF9]/40 hover:shadow-md md:h-24',
                              rowPartners.length === 1 && cols === 2 && 'col-span-2 mx-auto w-full max-w-[min(100%,11rem)]',
                            )}
                          >
                            <span className="landing-partner-logo-frame flex h-full w-full max-w-full items-center justify-center rounded-md bg-[#ffffff]">
                              <img
                                src={p.image}
                                alt=""
                                className="max-h-14 w-auto max-w-[min(100%,9rem)] bg-[#ffffff] object-contain md:max-h-16"
                                loading={slideIndex === current ? 'eager' : 'lazy'}
                                decoding="async"
                                fetchPriority={slideIndex === current ? 'high' : 'low'}
                                width={162}
                                height={80}
                              />
                            </span>
                          </a>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${ariaSlide} ${i + 1}`}
            aria-current={i === current ? 'true' : undefined}
            className={cn(
              'h-2.5 w-2.5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#01AEF9]',
              i === current ? 'bg-[#01AEF9]' : 'bg-gray-300 hover:bg-gray-400',
            )}
            onClick={() => api?.scrollTo(i)}
          />
        ))}
      </div>
    </div>
  )
}
