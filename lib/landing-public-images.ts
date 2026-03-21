import { z } from 'zod'

/**
 * Статика лендинга: файлы в `public/landing/` (скачивание: scripts/download-landing-assets.mjs).
 */
export const LANDING_PUBLIC_IMAGE_BASE = '/landing' as const

export function landingPublicImage(filename: string): `${typeof LANDING_PUBLIC_IMAGE_BASE}/${string}` {
  return `${LANDING_PUBLIC_IMAGE_BASE}/${filename}`
}

export const landingImagePathSchema = z.string().regex(/^\/landing\/[a-zA-Z0-9._-]+\.(png|jpg|jpeg|webp)$/i)
