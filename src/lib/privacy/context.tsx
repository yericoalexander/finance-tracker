'use client'

import { createContext, useContext, useEffect, useState, useMemo } from 'react'

export interface PrivacyContextValue {
  isPrivate: boolean
  togglePrivacy: () => void
  maskAmount: (formattedAmount: string) => string
}

const PrivacyContext = createContext<PrivacyContextValue | null>(null)

const STORAGE_KEY = 'finance_privacy_mode'

/**
 * Format string nominal menjadi versi terselubung (masked) saat mode privasi aktif
 */
export function formatMaskedAmount(amountString: string, isPrivate: boolean): string {
  if (!isPrivate) return amountString

  const trimmed = amountString.trim()
  if (trimmed.startsWith('-Rp') || trimmed.startsWith('- Rp')) {
    return '-Rp ••••••'
  }
  if (trimmed.startsWith('Rp') || trimmed.startsWith('IDR')) {
    return 'Rp ••••••'
  }
  return '••••••'
}

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [isPrivate, setIsPrivate] = useState<boolean>(false)
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'true') {
        setIsPrivate(true)
      }
    } catch {
      // LocalStorage tidak tersedia atau diblokir
    }
    setMounted(true)
  }, [])

  const togglePrivacy = () => {
    setIsPrivate((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        // Fallback jika localStorage bermasalah
      }
      return next
    })
  }

  const maskAmount = (formattedAmount: string): string => {
    return formatMaskedAmount(formattedAmount, mounted ? isPrivate : false)
  }

  const value = useMemo(
    () => ({
      isPrivate: mounted ? isPrivate : false,
      togglePrivacy,
      maskAmount,
    }),
    [isPrivate, mounted],
  )

  return <PrivacyContext.Provider value={value}>{children}</PrivacyContext.Provider>
}

export function usePrivacy(): PrivacyContextValue {
  const ctx = useContext(PrivacyContext)
  if (!ctx) {
    return {
      isPrivate: false,
      togglePrivacy: () => {},
      maskAmount: (val: string) => val,
    }
  }
  return ctx
}
