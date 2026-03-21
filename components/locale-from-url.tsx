'use client'

import { useEffect } from 'react'
import { useLocale } from '@/lib/i18n'
import type { LandingLang } from '@/lib/i18n/landing-lang'

/** Синхронизирует LocaleProvider с сегментом /uz | /ru | /en */
export function LocaleFromUrl({ lang }: { lang: LandingLang }) {
  const { setLang } = useLocale()

  useEffect(() => {
    setLang(lang)
  }, [lang, setLang])

  return null
}
