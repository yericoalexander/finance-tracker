'use client'

import { useState, useEffect, useCallback } from 'react'
import { z } from 'zod'
import { WalletsStoreSchema, WALLET_THEMES, type Wallet } from './types'

const STORAGE_KEY = 'finance-tracker:wallets:v2'

const DEFAULT_WALLETS: Omit<Wallet, 'id' | 'createdAt'>[] = [
  {
    name: 'BCA',
    balanceIdr: 12784486,
    themeId: 'bca',
    order: 0,
  },
  {
    name: 'OCBC',
    balanceIdr: 7521300,
    themeId: 'ocbc',
    order: 1,
  },
  {
    name: 'BRI',
    balanceIdr: 4134012,
    themeId: 'bri',
    order: 2,
  },
  {
    name: 'krom',
    balanceIdr: 2000000,
    themeId: 'krom',
    order: 3,
  },
  {
    name: 'N̄26',
    balanceIdr: 763000,
    themeId: 'n26',
    order: 4,
  },
  {
    name: 'Apple Card',
    balanceIdr: 251250,
    themeId: 'apple',
    order: 5,
  },
]

function getInitialWallets(): Wallet[] {
  return DEFAULT_WALLETS.map((w, idx) => ({
    ...w,
    id: `seed-wallet-${idx + 1}`,
    createdAt: new Date().toISOString(),
  }))
}

function loadFromStorage(): Wallet[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      // Jika baru pertama kali buka, sediakan starter preset sesuai referensi
      const initial = getInitialWallets()
      saveToStorage(initial)
      return initial
    }
    const parsed = WalletsStoreSchema.safeParse(JSON.parse(raw))
    if (parsed.success && parsed.data.length > 0) {
      return parsed.data.sort((a, b) => a.order - b.order)
    }
    return []
  } catch {
    return []
  }
}

function saveToStorage(wallets: Wallet[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wallets))
  } catch {
    // Storage penuh atau private mode quota exceeded
  }
}

export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setWallets(loadFromStorage())
    setIsLoaded(true)
  }, [])

  const persist = useCallback((next: Wallet[]) => {
    setWallets(next)
    saveToStorage(next)
  }, [])

  const addWallet = useCallback(
    (input: { name: string; balanceIdr: number; themeId: string }) => {
      const newWallet: Wallet = {
        id: crypto.randomUUID(),
        name: input.name,
        balanceIdr: input.balanceIdr,
        themeId:
          input.themeId in WALLET_THEMES ||
          input.themeId.startsWith('custom_') ||
          input.themeId.startsWith('custom:')
            ? input.themeId
            : 'bca',
        order: wallets.length,
        createdAt: new Date().toISOString(),
      }
      persist([...wallets, newWallet])
    },
    [wallets, persist],
  )

  const updateWallet = useCallback(
    (id: string, patch: Partial<Omit<Wallet, 'id' | 'createdAt'>>) => {
      persist(wallets.map((w) => (w.id === id ? { ...w, ...patch } : w)))
    },
    [wallets, persist],
  )

  const deleteWallet = useCallback(
    (id: string) => {
      persist(wallets.filter((w) => w.id !== id))
    },
    [wallets, persist],
  )

  const quickAdjustBalance = useCallback(
    (id: string, deltaIdr: number) => {
      persist(
        wallets.map((w) =>
          w.id === id ? { ...w, balanceIdr: Math.max(0, w.balanceIdr + deltaIdr) } : w,
        ),
      )
    },
    [wallets, persist],
  )

  const resetToDefault = useCallback(() => {
    const initial = getInitialWallets()
    persist(initial)
  }, [persist])

  const totalBalance = wallets.reduce((sum, w) => sum + w.balanceIdr, 0)

  return {
    wallets,
    isLoaded,
    totalBalance,
    addWallet,
    updateWallet,
    quickAdjustBalance,
    deleteWallet,
    resetToDefault,
  }
}

// Validasi input form
export const WalletFormSchema = z.object({
  name: z.string().trim().min(1, 'Nama dompet wajib diisi').max(40, 'Maksimal 40 karakter'),
  balanceIdr: z.coerce
    .number()
    .int('Harus bilangan bulat')
    .nonnegative('Saldo tidak boleh negatif'),
  themeId: z.string().min(1),
})

export type WalletFormValues = z.infer<typeof WalletFormSchema>
