'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import { LANDING_ORGANIZER_SLIDES, type LandingOrganizerItem } from '@/lib/landing-organizers-data'
import { cn } from '@/lib/utils'

const navBtnClass =
  'inline-flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-[#01AEF9] bg-white/95 text-[#01AEF9] shadow-sm transition-colors hover:bg-[#01AEF9]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#01AEF9] disabled:pointer-events-none disabled:opacity-35'

const cardClass =
  'flex h-[5.5rem] items-center justify-center rounded-xl border border-gray-100 bg-[#ffffff] p-3 shadow-sm transition-transform duration-200 hover:scale-105 hover:border-[#01AEF9]/40 hover:shadow-md md:h-24'

function OrganizerLogo({
  item,
  utmQuery,
  singleOrphan,
}: {
  item: LandingOrganizerItem
  utmQuery: string
  singleOrphan?: boolean
}) {
  const img = (
    <span className="landing-organizer-logo-frame flex h-full w-full max-w-full items-center justify-center rounded-md bg-[#ffffff]">
      <img
        src={item.image}
        alt=""
        className="max-h-14 w-auto max-w-[min(100%,9rem)] bg-[#ffffff] object-contain md:max-h-16"
        loading="lazy"
        decoding="async"
        width={162}
        height={80}
      />
    </span>
  )

  const cellClass = cn(
    cardClass,
    singleOrphan &&
      'max-sm:col-span-2 max-sm:mx-auto max-sm:w-full max-sm:max-w-[min(100%,11rem)]',
  )

  if (item.type === 'none') {
    return <div className={cellClass}>{img}</div>
  }

  if (item.type === 'utm') {
    return (
      <a
        href={`https://myexpo.uz/`}
        target="_blank"
        rel="noopener noreferrer"
        className={cellClass}
      >
        {img}
      </a>
    )
  }

  return (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className={cellClass}>
      {img}
    </a>
  )
}

export function LandingOrganizersCarousel({
  utmQuery,
  ariaCarousel = 'Organisers and partners logos',
  ariaPrev = 'Previous slide',
  ariaNext = 'Next slide',
  ariaSlide = 'Slide',
}: {
  utmQuery: string
  ariaCarousel?: string
  ariaPrev?: string
  ariaNext?: string
  ariaSlide?: string
}) {
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

  return (
    <div className="landing-organizers-carousel relative w-full">
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
            {LANDING_ORGANIZER_SLIDES.map((slide, slideIndex) => (
              <CarouselItem key={slideIndex}>
                <div
                  className={cn(
                    'grid gap-3 py-2 sm:gap-4 md:gap-4',
                    slide.mdColumns === 5
                      ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
                      : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-4',
                  )}
                >
                  {slide.items.map((item, i) => (
                    <OrganizerLogo
                      key={`${slideIndex}-${i}`}
                      item={item}
                      utmQuery={utmQuery}
                      singleOrphan={
                        slide.items.length % 2 === 1 && i === slide.items.length - 1 && slide.mdColumns === 5
                      }
                    />
                  ))}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {LANDING_ORGANIZER_SLIDES.map((_, i) => (
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
