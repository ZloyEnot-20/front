'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import { LANDING_ORGANIZER_SLIDES, type LandingOrganizerItem } from '@/lib/landing-organizers-data'
import { cn } from '@/lib/utils'

const navBtnClass =
  'inline-flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-[#01AEF9] text-[#01AEF9] transition-colors hover:bg-[#01AEF9]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#01AEF9] disabled:pointer-events-none disabled:opacity-35'

const cardClass =
  'flex h-[5.5rem] items-center justify-center rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-transform duration-200 hover:scale-105 hover:border-[#01AEF9]/40 hover:shadow-md md:h-24'

function OrganizerLogo({
  item,
  utmQuery,
}: {
  item: LandingOrganizerItem
  utmQuery: string
}) {
  const img = (
    <img
      src={item.image}
      alt=""
      className="max-h-14 w-auto max-w-[min(100%,9rem)] object-contain md:max-h-16"
      loading="lazy"
      decoding="async"
      width={162}
      height={80}
    />
  )

  if (item.type === 'none') {
    return <div className={cardClass}>{img}</div>
  }

  if (item.type === 'utm') {
    return (
      <a
        href={`https://myfair.events${utmQuery}`}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClass}
      >
        {img}
      </a>
    )
  }

  return (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className={cardClass}>
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
    <div className="landing-organizers-carousel w-full">
      <div className="flex w-full items-center gap-3 sm:gap-4 md:gap-6">
        <button
          type="button"
          aria-label={ariaPrev}
          className={navBtnClass}
          disabled={!api}
          onClick={() => api?.scrollPrev()}
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>

        <div className="min-w-0 flex-1 overflow-hidden">
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
                      />
                    ))}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        <button
          type="button"
          aria-label={ariaNext}
          className={navBtnClass}
          disabled={!api}
          onClick={() => api?.scrollNext()}
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>
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
