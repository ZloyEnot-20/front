import { z } from 'zod'
import type { Lang } from './translations'

export const LANDING_LANGS = ['uz', 'ru', 'en'] as const satisfies readonly Lang[]
export type LandingLang = (typeof LANDING_LANGS)[number]

export const landingLangSchema = z.enum(['uz', 'ru', 'en'])

export function parseLandingLang(raw: string): LandingLang {
  return landingLangSchema.parse(raw)
}

export function isLandingLang(raw: string): raw is LandingLang {
  return landingLangSchema.safeParse(raw).success
}
