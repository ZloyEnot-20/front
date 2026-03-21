import { z } from 'zod'
import { landingImagePathSchema, landingPublicImage } from './landing-public-images'

const organizerItemSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('external'),
    href: z.string().url(),
    image: landingImagePathSchema,
  }),
  z.object({
    type: z.literal('utm'),
    image: landingImagePathSchema,
  }),
  z.object({
    type: z.literal('none'),
    image: landingImagePathSchema,
  }),
])

export type LandingOrganizerItem = z.infer<typeof organizerItemSchema>

const slideSchema = z.object({
  /** Колонок на md+ (5 или 4 как в макете) */
  mdColumns: z.union([z.literal(4), z.literal(5)]),
  items: z.array(organizerItemSchema).min(1),
})

export type LandingOrganizerSlide = z.infer<typeof slideSchema>

const rawSlides: LandingOrganizerSlide[] = [
  {
    mdColumns: 5,
    items: [
      {
        type: 'external',
        href: 'https://gov.uz/oz/yoshlar',
        image: landingPublicImage('432b3885aed9ba9cb6c5a7b42b0ace67.png'),
      },
      {
        type: 'external',
        href: 'https://uzedu.uz/',
        image: landingPublicImage('cf68c8ccf90f916547d30ca32e9ebf76.png'),
      },
      {
        type: 'utm',
        image: landingPublicImage('e50344b3b7b39d50bdb1c936f98d8ed1.png'),
      },
      {
        type: 'utm',
        image: landingPublicImage('2f6dbdf9e10478768fbd44caad7bb4df.png'),
      },
      {
        type: 'external',
        href: 'https://uzbekistan.rs.gov.ru/',
        image: landingPublicImage('89ab42bda8f74548cc0576af0d293a36.png'),
      },
    ],
  },
  {
    mdColumns: 4,
    items: [
      {
        type: 'utm',
        image: landingPublicImage('c72fcc703a755c139c11947faa35997e.png'),
      },
      {
        type: 'external',
        href: 'https://prtuz.tatarstan.ru/',
        image: landingPublicImage('c5383960660573c3be28d1573e33bad3.png'),
      },
      {
        type: 'none',
        image: landingPublicImage('b206b279e8b567412c2342f1960e7c61.png'),
      },
      {
        type: 'external',
        href: 'https://iht.uz/en/home/',
        image: landingPublicImage('5c3231f5ce863a0047c2403cb17e1f82.png'),
      },
    ],
  },
]

export const LANDING_ORGANIZER_SLIDES: LandingOrganizerSlide[] = z.array(slideSchema).parse(rawSlides)
