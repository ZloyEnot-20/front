import { z } from 'zod'
import { landingPublicImage } from './landing-public-images'

export const LandingTelegramTeaserCardSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  ctaLabel: z.string().min(1),
})

export type LandingTelegramTeaserCard = z.infer<typeof LandingTelegramTeaserCardSchema>

/** Rasm barcha kartochkalarda bir xil (Creatium maket) */
export const LANDING_TELEGRAM_TEASER_CARD_IMAGE = landingPublicImage('465bed6e075a99229a6d5e228830fea3.png')

export const LANDING_TELEGRAM_TEASER_CARDS: LandingTelegramTeaserCard[] = z
  .array(LandingTelegramTeaserCardSchema)
  .parse([
    {
      title: "OTMni qanday tanlash mumkin?",
      description:
        "Sifatli ta'lim va istiqbolli kasb egasi bo'lish uchun OTMni tanlashda nimalarga e'tibor qaratish lozim?",
      ctaLabel: "Maqolani o'qish...",
    },
    {
      title: '150 ta kelajak kasblari',
      description: "Yaqin 30 yil ichida eng ko'p talab qilinadigan kasblar ro'yxati.",
      ctaLabel: "Ro'yxatni ko'rish...",
    },
    {
      title:
        "O'qishga kirishda grant va imtiyozlarga ega bo'lish imkoniyatini beruvchi olimpiadalar",
      description:
        "Biz muntazam ravishda dolzarb tanlovlarni e'lon qilib boramiz. O'tkazib yuborish uchun obuna qiling!",
      ctaLabel: "Obuna bo'lish",
    },
    {
      title: "O'zbekistonda xorijiy OTMlarining qaysi filiallari akkreditatsiyadan o'tgan?",
      description:
        "2025-yilda O'zbekistonda akkreditatsiyadan o'tgan xorijiy OTMlarining dolzarb ro'yxati.",
      ctaLabel: "Ro'yxatni ko'rish...",
    },
  ])
