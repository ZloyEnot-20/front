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

/** Локаль для дат по языку интерфейса. Для uz используем ru-RU, т.к. uz-UZ в ряде сред даёт "M03" вместо "мар." */
export function getDateLocale(lang: 'uz' | 'ru' | 'en'): string {
  return lang === 'en' ? 'en-US' : 'ru-RU'
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
