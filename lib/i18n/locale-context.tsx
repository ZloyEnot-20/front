'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { Lang, translations, getT } from './translations'

const STORAGE_KEY = 'locale'

type TFunc = (key: string) => string

interface LocaleContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: TFunc
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ru')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Lang | null
      if (stored && (stored === 'uz' || stored === 'ru' || stored === 'en')) {
        setLangState(stored)
      }
    } catch {
      // ignore
    }
    setMounted(true)
  }, [])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(STORAGE_KEY, l)
      if (typeof document !== 'undefined') document.documentElement.lang = l
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = lang
  }, [lang])

  const t = getT(lang)

  if (!mounted) {
    return (
      <LocaleContext.Provider value={{ lang: 'ru', setLang, t }}>
        {children}
      </LocaleContext.Provider>
    )
  }

  return (
    <LocaleContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (ctx === undefined) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return ctx
}
