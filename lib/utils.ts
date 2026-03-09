import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Название города по текущему языку (UZ/RU/EN) */
export function getCityName(
  city: { name?: string; nameUz?: string; nameRu?: string; nameEn?: string },
  lang: 'uz' | 'ru' | 'en'
): string {
  if (!city) return ''
  const key = lang === 'uz' ? 'nameUz' : lang === 'en' ? 'nameEn' : 'nameRu'
  return (city[key as keyof typeof city] as string)?.trim() || city.name || ''
}

/** Место проведения выставки по языку (UZ/RU/EN) */
export function getVenue(
  item: { venue?: string; venueUz?: string; venueRu?: string; venueEn?: string },
  lang: 'uz' | 'ru' | 'en'
): string {
  if (!item) return ''
  const key = lang === 'uz' ? 'venueUz' : lang === 'en' ? 'venueEn' : 'venueRu'
  return (item[key as keyof typeof item] as string)?.trim() || item.venue || ''
}

/** Локаль для дат по языку интерфейса. Для uz не используем uz-UZ (даёт "M03"), используем formatDateLocalized. */
export function getDateLocale(lang: 'uz' | 'ru' | 'en'): string {
  return lang === 'en' ? 'en-US' : 'ru-RU'
}

/** Короткие названия месяцев по-узбекски (латиница), для дат публикаций */
const UZ_MONTH_SHORT = ['yan', 'fev', 'mart', 'apr', 'may', 'iyun', 'iyul', 'avg', 'sen', 'okt', 'noy', 'dek']
/** Полные названия месяцев по-узбекски (латиница) */
const UZ_MONTH_LONG = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr']

export type DateFormatStyle = 'short' | 'long' | 'full'

/**
 * Форматирует дату под выбранный язык. Для узбекского использует ручные названия месяцев (uz-UZ в браузере даёт "M03").
 * @param date — дата (Date, ISO-строка или timestamp)
 * @param lang — язык интерфейса
 * @param style — short: "6 mart" / "6 мар." / "Mar 6"; long: "6 mart 2025" / "6 марта 2025"; full: с днём недели (для uz как long)
 */
export function formatDateLocalized(
  date: Date | string | number,
  lang: 'uz' | 'ru' | 'en',
  style: DateFormatStyle = 'long'
): string {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''

  if (lang === 'uz') {
    const day = d.getDate()
    const month = d.getMonth()
    const year = d.getFullYear()
    if (style === 'short') {
      return `${day} ${UZ_MONTH_SHORT[month]}`
    }
    return `${day} ${UZ_MONTH_LONG[month]} ${year}`
  }

  const locale = getDateLocale(lang)
  if (style === 'short') {
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
  }
  if (style === 'full') {
    return d.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
}

function langKey(lang: 'uz' | 'ru' | 'en'): 'Uz' | 'Ru' | 'En' {
  return lang === 'uz' ? 'Uz' : lang === 'en' ? 'En' : 'Ru'
}

/** Заголовок выставки/новости по языку */
export function getContentTitle(
  item: { title?: string; titleUz?: string; titleRu?: string; titleEn?: string },
  lang: 'uz' | 'ru' | 'en'
): string {
  if (!item) return ''
  const key = `title${langKey(lang)}` as 'titleUz' | 'titleRu' | 'titleEn'
  return (item[key] as string)?.trim() || item.title || ''
}

/** Описание выставки по языку */
export function getContentDescription(
  item: { description?: string; descriptionUz?: string; descriptionRu?: string; descriptionEn?: string },
  lang: 'uz' | 'ru' | 'en'
): string {
  if (!item) return ''
  const key = `description${langKey(lang)}` as 'descriptionUz' | 'descriptionRu' | 'descriptionEn'
  return (item[key] as string)?.trim() || item.description || ''
}

/** Текст/контент новости по языку */
export function getNewsContent(
  item: { content?: string; contentUz?: string; contentRu?: string; contentEn?: string },
  lang: 'uz' | 'ru' | 'en'
): string {
  if (!item) return ''
  const key = `content${langKey(lang)}` as 'contentUz' | 'contentRu' | 'contentEn'
  return (item[key] as string)?.trim() || item.content || ''
}

/** Краткое описание новости по языку */
export function getNewsExcerpt(
  item: { excerpt?: string; excerptUz?: string; excerptRu?: string; excerptEn?: string },
  lang: 'uz' | 'ru' | 'en'
): string {
  if (!item) return ''
  const key = `excerpt${langKey(lang)}` as 'excerptUz' | 'excerptRu' | 'excerptEn'
  return (item[key] as string)?.trim() || item.excerpt || ''
}
