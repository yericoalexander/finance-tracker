'use client'

import React, { createContext, useContext, useEffect, useState, useTransition } from 'react'
import {
  type Locale,
  type TranslationKey,
  translations,
  categoryTranslations,
  paymentMethodTranslations,
} from './translations'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
  translateCategory: (category: string | null | undefined) => string
  translatePaymentMethod: (method: string | null | undefined) => string
  formatMonthName: (date: Date) => string
  toastMessage: string | null
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('id')
  const [, startTransition] = useTransition()

  useEffect(() => {
    try {
      const stored = localStorage.getItem('app_locale') as Locale | null
      if (stored === 'id' || stored === 'en') {
        setLocaleState(stored)
        document.documentElement.lang = stored
      }
    } catch {
      // Ignore if localStorage is disabled
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    startTransition(() => {
      setLocaleState(newLocale)
      document.documentElement.lang = newLocale
      try {
        localStorage.setItem('app_locale', newLocale)
      } catch {
        // Ignore
      }
    })
  }

  const toggleLocale = () => {
    const next = locale === 'id' ? 'en' : 'id'
    setLocale(next)
  }

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const dict = translations[locale] || translations.id
    let text: string = dict[key] || translations.id[key] || key

    if (params) {
      Object.entries(params).forEach(([paramKey, val]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val))
      })
    }

    return text
  }

  const translateCategory = (cat: string | null | undefined): string => {
    if (!cat) return ''
    if (categoryTranslations[cat]) {
      return categoryTranslations[cat][locale]
    }
    return cat
  }

  const translatePaymentMethod = (pm: string | null | undefined): string => {
    if (!pm) return ''
    if (paymentMethodTranslations[pm]) {
      return paymentMethodTranslations[pm][locale]
    }
    return pm
  }

  const formatMonthName = (date: Date): string => {
    return new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', {
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    }).format(date)
  }

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        toggleLocale,
        t,
        translateCategory,
        translatePaymentMethod,
        formatMonthName,
        toastMessage: null,
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    // Fallback safe state if used outside provider during initial render
    return {
      locale: 'id' as Locale,
      setLocale: () => {},
      toggleLocale: () => {},
      t: (key: TranslationKey, params?: Record<string, string | number>) => {
        let text: string = translations.id[key] || key
        if (params) {
          Object.entries(params).forEach(([pKey, val]) => {
            text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(val))
          })
        }
        return text
      },
      translateCategory: (c: string | null | undefined) => c || '',
      translatePaymentMethod: (pm: string | null | undefined) => pm || '',
      formatMonthName: (date: Date) =>
        new Intl.DateTimeFormat('id-ID', {
          month: 'long',
          year: 'numeric',
          timeZone: 'Asia/Jakarta',
        }).format(date),
      toastMessage: null,
    }
  }
  return ctx
}
