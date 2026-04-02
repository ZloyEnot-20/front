import { z } from 'zod'
import type { Lang } from '@/lib/i18n/translations'

const citySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    nameUz: z.string().optional(),
    nameRu: z.string().optional(),
    nameEn: z.string().optional(),
  })
  .passthrough()

const exhibitionItemSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    titleUz: z.string().optional(),
    titleRu: z.string().optional(),
    titleEn: z.string().optional(),
    status: z.string(),
    venue: z.string().optional(),
    venueUz: z.string().optional(),
    venueRu: z.string().optional(),
    venueEn: z.string().optional(),
    startDate: z.union([z.string(), z.coerce.date()]),
    endDate: z.union([z.string(), z.coerce.date()]),
    cities: z.array(citySchema).optional(),
    image: z.string().optional(),
    banner: z.string().optional(),
  })
  .passthrough()

export type LandingScheduleExhibition = z.infer<typeof exhibitionItemSchema> & {
  startDate: string
  endDate: string
}

function normalizeDates(raw: z.infer<typeof exhibitionItemSchema>): LandingScheduleExhibition {
  const start = typeof raw.startDate === 'string' ? raw.startDate : raw.startDate.toISOString()
  const end = typeof raw.endDate === 'string' ? raw.endDate : raw.endDate.toISOString()
  return { ...raw, startDate: start, endDate: end }
}

/** Безопасный разбор ответа GET /api/exhibitions (только валидные элементы). */
export function parseExhibitionsListResponse(data: unknown): LandingScheduleExhibition[] {
  const root = z.array(z.unknown()).safeParse(data)
  if (!root.success) return []

  const out: LandingScheduleExhibition[] = []
  for (const item of root.data) {
    const r = exhibitionItemSchema.safeParse(item)
    if (r.success) out.push(normalizeDates(r.data))
  }
  return out
}

export function filterPublishedSorted(exhibitions: LandingScheduleExhibition[]): LandingScheduleExhibition[] {
  return exhibitions
    .filter((e) => e.status === 'published')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const

export function buildUtmQueryFromSearch(search: string): string {
  const q = search.startsWith('?') ? search.slice(1) : search
  const params = new URLSearchParams(q)
  const out = new URLSearchParams()
  for (const k of UTM_KEYS) {
    const v = params.get(k)
    if (v) out.set(k, v)
  }
  const s = out.toString()
  return s ? `?${s}` : ''
}

export function scheduleCardTitleUz(ex: LandingScheduleExhibition): string {
  return scheduleCardTitleForLang(ex, 'uz')
}

function cityLabelForLang(
  c: NonNullable<LandingScheduleExhibition['cities']>[number],
  lang: Lang,
): string {
  if (lang === 'uz') return c.nameUz?.trim() || c.name
  if (lang === 'ru') return c.nameRu?.trim() || c.nameUz?.trim() || c.name
  return c.nameEn?.trim() || c.nameRu?.trim() || c.nameUz?.trim() || c.name
}

/** Заголовок карточки в расписании лендинга по языку интерфейса. */
export function scheduleCardTitleForLang(ex: LandingScheduleExhibition, lang: Lang): string {
  const cities = ex.cities ?? []
  if (cities.length === 1) {
    const label = cityLabelForLang(cities[0], lang)
    if (lang === 'uz') return `${label}dagi ko'rgazma`
    if (lang === 'ru') return `Выставка в ${label}`
    return `Exhibition in ${label}`
  }
  if (lang === 'uz') return ex.titleUz?.trim() || ex.titleRu?.trim() || ex.title
  if (lang === 'ru') return ex.titleRu?.trim() || ex.titleUz?.trim() || ex.titleEn?.trim() || ex.title
  return ex.titleEn?.trim() || ex.titleRu?.trim() || ex.titleUz?.trim() || ex.title
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

const MONTH_UZ: Record<number, string> = {
  0: 'yanvar',
  1: 'fevral',
  2: 'mart',
  3: 'aprel',
  4: 'may',
  5: 'iyun',
  6: 'iyul',
  7: 'avgust',
  8: 'sentabr',
  9: 'oktabr',
  10: 'noyabr',
  11: 'dekabr',
}

const MONTH_RU: Record<number, string> = {
  0: 'января',
  1: 'февраля',
  2: 'марта',
  3: 'апреля',
  4: 'мая',
  5: 'июня',
  6: 'июля',
  7: 'августа',
  8: 'сентября',
  9: 'октября',
  10: 'ноября',
  11: 'декабря',
}

const MONTH_EN: Record<number, string> = {
  0: 'January',
  1: 'February',
  2: 'March',
  3: 'April',
  4: 'May',
  5: 'June',
  6: 'July',
  7: 'August',
  8: 'September',
  9: 'October',
  10: 'November',
  11: 'December',
}

function monthName(m: number, lang: Lang): string {
  if (lang === 'ru') return MONTH_RU[m] ?? ''
  if (lang === 'en') return MONTH_EN[m] ?? ''
  return MONTH_UZ[m] ?? ''
}

/** Строки даты/времени для карточки (o‘zbek lotin). */
export function formatScheduleCardLines(ex: LandingScheduleExhibition): { dateLine: string; timeLine: string | null } {
  return formatScheduleCardLinesForLang(ex, 'uz')
}

export function formatScheduleCardLinesForLang(
  ex: LandingScheduleExhibition,
  lang: Lang,
): { dateLine: string; timeLine: string | null } {
  const start = new Date(ex.startDate)
  const end = new Date(ex.endDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { dateLine: '', timeLine: null }
  }

  const y = start.getFullYear()
  const d1 = start.getDate()
  const d2 = end.getDate()
  const m1 = start.getMonth()
  const m2 = end.getMonth()
  const y2 = end.getFullYear()

  let dateLine: string
  if (lang === 'en') {
    if (y === y2 && m1 === m2 && d1 === d2) {
      dateLine = `${MONTH_EN[m1]} ${d1}, ${y}`
    } else if (y === y2 && m1 === m2) {
      dateLine = `${MONTH_EN[m1]} ${d1}–${d2}, ${y}`
    } else {
      dateLine = `${MONTH_EN[m1]} ${d1}, ${y} – ${MONTH_EN[m2]} ${d2}, ${y2}`
    }
  } else if (y === y2 && m1 === m2 && d1 === d2) {
    dateLine = lang === 'ru' ? `${d1} ${monthName(m1, lang)} ${y}` : `${d1}-${monthName(m1, lang)}, ${y}`
  } else if (y === y2 && m1 === m2) {
    dateLine =
      lang === 'ru'
        ? `${d1}–${d2} ${monthName(m1, lang)} ${y}`
        : `${d1}-${d2} ${monthName(m1, lang)}, ${y}`
  } else {
    dateLine =
      lang === 'ru'
        ? `${d1} ${monthName(m1, lang)} ${y} – ${d2} ${monthName(m2, lang)} ${y2}`
        : `${d1} ${monthName(m1, lang)}, ${y} – ${d2} ${monthName(m2, lang)}, ${y2}`
  }

  const h1 = start.getHours()
  const min1 = start.getMinutes()
  const h2 = end.getHours()
  const min2 = end.getMinutes()
  const hasTime = h1 !== 0 || min1 !== 0 || h2 !== 0 || min2 !== 0 || start.getTime() !== end.getTime()
  const timeLine = hasTime
    ? lang === 'uz'
      ? `soat ${pad2(h1)}:${pad2(min1)}–${pad2(h2)}:${pad2(min2)}`
      : lang === 'ru'
        ? `${pad2(h1)}:${pad2(min1)}–${pad2(h2)}:${pad2(min2)}`
        : `${pad2(h1)}:${pad2(min1)} – ${pad2(h2)}:${pad2(min2)}`
    : null

  return { dateLine, timeLine }
}

export function venueLabelUz(ex: LandingScheduleExhibition): string {
  return venueLabelForLang(ex, 'uz')
}

export function venueLabelForLang(ex: LandingScheduleExhibition, lang: Lang): string {
  if (lang === 'uz') return ex.venueUz?.trim() || ex.venueRu?.trim() || ex.venueEn?.trim() || ex.venue?.trim() || ''
  if (lang === 'ru') return ex.venueRu?.trim() || ex.venueUz?.trim() || ex.venueEn?.trim() || ex.venue?.trim() || ''
  return ex.venueEn?.trim() || ex.venueRu?.trim() || ex.venueUz?.trim() || ex.venue?.trim() || ''
}

export function venueMapHref(venue: string): string {
  const v = venue.trim()
  if (!v) return '#'
  if (/^https?:\/\//i.test(v)) return v
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v)}`
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.myexpo.uz'

export async function fetchLandingScheduleExhibitions(): Promise<LandingScheduleExhibition[]> {
  try {
    const res = await fetch(`${API_BASE}/api/exhibitions`, { cache: 'no-store' })
    if (!res.ok) return []
    const json: unknown = await res.json()
    return filterPublishedSorted(parseExhibitionsListResponse(json))
  } catch {
    return []
  }
}
