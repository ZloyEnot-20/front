import { z } from 'zod'

/** YouTube video id (11 chars) for optional embed on landing #review */
const YoutubeVideoIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{11}$/)

export function getLandingReviewEmbedSrc(raw: string | undefined): string | null {
  if (raw == null || raw.trim() === '') return null
  const parsed = YoutubeVideoIdSchema.safeParse(raw.trim())
  if (!parsed.success) return null
  const id = parsed.data
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0`
}
