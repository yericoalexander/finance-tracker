'use client'

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'

export type PrivacyScope = 'expenses' | 'wallets' | 'transactions'

export interface PrivacyContextValue {
  // Global / Default (kompatibilitas backward)
  isPrivate: boolean
  togglePrivacy: () => void
  maskAmount: (formattedAmount: string) => string

  // Scoped: Pengeluaran (Ringkasan)
  isExpensesPrivate: boolean
  toggleExpensesPrivacy: () => void
  maskExpensesAmount: (formattedAmount: string) => string

  // Scoped: Dompet
  isWalletsPrivate: boolean
  toggleWalletsPrivacy: () => void
  maskWalletsAmount: (formattedAmount: string) => string

  // Scoped: Transaksi
  isTransactionsPrivate: boolean
  toggleTransactionsPrivacy: () => void
  maskTransactionsAmount: (formattedAmount: string) => string
}

const PrivacyContext = createContext<PrivacyContextValue | null>(null)

export const STORAGE_KEY_GLOBAL = 'finance_privacy_mode'
export const STORAGE_KEY_EXPENSES = 'finance_privacy_expenses'
export const STORAGE_KEY_WALLETS = 'finance_privacy_wallets'
export const STORAGE_KEY_TRANSACTIONS = 'finance_privacy_transactions'

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
  const [isGlobalPrivate, setIsGlobalPrivate] = useState<boolean>(false)
  const [isExpensesPrivate, setIsExpensesPrivate] = useState<boolean>(false)
  const [isWalletsPrivate, setIsWalletsPrivate] = useState<boolean>(false)
  const [isTransactionsPrivate, setIsTransactionsPrivate] = useState<boolean>(false)
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY_GLOBAL) === 'true') {
        setIsGlobalPrivate(true)
      }
      if (localStorage.getItem(STORAGE_KEY_EXPENSES) === 'true') {
        setIsExpensesPrivate(true)
      }
      if (localStorage.getItem(STORAGE_KEY_WALLETS) === 'true') {
        setIsWalletsPrivate(true)
      }
      if (localStorage.getItem(STORAGE_KEY_TRANSACTIONS) === 'true') {
        setIsTransactionsPrivate(true)
      }
    } catch {
      // LocalStorage tidak tersedia atau diblokir
    }
    setMounted(true)
  }, [])

  const togglePrivacy = useCallback(() => {
    setIsGlobalPrivate((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY_GLOBAL, String(next))
      } catch {
        // Fallback jika localStorage bermasalah
      }
      return next
    })
  }, [])

  const toggleExpensesPrivacy = useCallback(() => {
    setIsExpensesPrivate((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY_EXPENSES, String(next))
      } catch {
        // Fallback jika localStorage bermasalah
      }
      return next
    })
  }, [])

  const toggleWalletsPrivacy = useCallback(() => {
    setIsWalletsPrivate((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY_WALLETS, String(next))
      } catch {
        // Fallback jika localStorage bermasalah
      }
      return next
    })
  }, [])

  const toggleTransactionsPrivacy = useCallback(() => {
    setIsTransactionsPrivate((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY_TRANSACTIONS, String(next))
      } catch {
        // Fallback jika localStorage bermasalah
      }
      return next
    })
  }, [])

  const maskAmount = useCallback(
    (formattedAmount: string): string => {
      return formatMaskedAmount(formattedAmount, mounted ? isGlobalPrivate : false)
    },
    [isGlobalPrivate, mounted],
  )

  const maskExpensesAmount = useCallback(
    (formattedAmount: string): string => {
      return formatMaskedAmount(formattedAmount, mounted ? isExpensesPrivate : false)
    },
    [isExpensesPrivate, mounted],
  )

  const maskWalletsAmount = useCallback(
    (formattedAmount: string): string => {
      return formatMaskedAmount(formattedAmount, mounted ? isWalletsPrivate : false)
    },
    [isWalletsPrivate, mounted],
  )

  const maskTransactionsAmount = useCallback(
    (formattedAmount: string): string => {
      return formatMaskedAmount(formattedAmount, mounted ? isTransactionsPrivate : false)
    },
    [isTransactionsPrivate, mounted],
  )

  const value = useMemo(
    () => ({
      isPrivate: mounted ? isGlobalPrivate : false,
      togglePrivacy,
      maskAmount,

      isExpensesPrivate: mounted ? isExpensesPrivate : false,
      toggleExpensesPrivacy,
      maskExpensesAmount,

      isWalletsPrivate: mounted ? isWalletsPrivate : false,
      toggleWalletsPrivacy,
      maskWalletsAmount,

      isTransactionsPrivate: mounted ? isTransactionsPrivate : false,
      toggleTransactionsPrivacy,
      maskTransactionsAmount,
    }),
    [
      isGlobalPrivate,
      isExpensesPrivate,
      isWalletsPrivate,
      isTransactionsPrivate,
      mounted,
      togglePrivacy,
      toggleExpensesPrivacy,
      toggleWalletsPrivacy,
      toggleTransactionsPrivacy,
      maskAmount,
      maskExpensesAmount,
      maskWalletsAmount,
      maskTransactionsAmount,
    ],
  )

  return <PrivacyContext.Provider value={value}>{children}</PrivacyContext.Provider>
}

export function usePrivacy(scope?: PrivacyScope): PrivacyContextValue {
  const ctx = useContext(PrivacyContext)
  if (!ctx) {
    return {
      isPrivate: false,
      togglePrivacy: () => {},
      maskAmount: (val: string) => val,
      isExpensesPrivate: false,
      toggleExpensesPrivacy: () => {},
      maskExpensesAmount: (val: string) => val,
      isWalletsPrivate: false,
      toggleWalletsPrivacy: () => {},
      maskWalletsAmount: (val: string) => val,
      isTransactionsPrivate: false,
      toggleTransactionsPrivacy: () => {},
      maskTransactionsAmount: (val: string) => val,
    }
  }

  if (scope === 'expenses') {
    return {
      ...ctx,
      isPrivate: ctx.isExpensesPrivate,
      togglePrivacy: ctx.toggleExpensesPrivacy,
      maskAmount: ctx.maskExpensesAmount,
    }
  }

  if (scope === 'wallets') {
    return {
      ...ctx,
      isPrivate: ctx.isWalletsPrivate,
      togglePrivacy: ctx.toggleWalletsPrivacy,
      maskAmount: ctx.maskWalletsAmount,
    }
  }

  if (scope === 'transactions') {
    return {
      ...ctx,
      isPrivate: ctx.isTransactionsPrivate,
      togglePrivacy: ctx.toggleTransactionsPrivacy,
      maskAmount: ctx.maskTransactionsAmount,
    }
  }

  return ctx
}
