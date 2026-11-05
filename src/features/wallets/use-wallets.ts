'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  createWalletAction,
  deleteWalletAction,
  getWalletsAction,
  quickAdjustWalletAction,
  updateWalletAction,
} from './actions'
import { WalletsStoreSchema, WALLET_THEMES, type Wallet } from './types'

const STORAGE_KEY = 'finance-tracker:wallets:v2'

export const DEFAULT_WALLETS: Omit<Wallet, 'id' | 'createdAt'>[] = [
  {
    name: 'BCA',
    balanceIdr: 12784486,
    themeId: 'bca',
    order: 0,
  },
  {
    name: 'SeaBank',
    balanceIdr: 5000000,
    themeId: 'seabank',
    order: 1,
  },
  {
    name: 'Krom',
    balanceIdr: 2000000,
    themeId: 'krom',
    order: 2,
  },
  {
    name: 'OCBC',
    balanceIdr: 7521300,
    themeId: 'ocbc',
    order: 3,
  },
  {
    name: 'BRI',
    balanceIdr: 4134012,
    themeId: 'bri',
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
    // 1. Muat dari local storage untuk respon instan 0ms
    const cached = loadFromStorage()
    if (cached.length > 0) {
      setWallets(cached)
      setIsLoaded(true)
    }

    // 2. Sinkronisasi dengan database di server
    let isMounted = true
    getWalletsAction()
      .then((res) => {
        if (isMounted && res.ok && res.data && res.data.length > 0) {
          setWallets(res.data)
          saveToStorage(res.data)
          setIsLoaded(true)
        } else if (isMounted) {
          setIsLoaded(true)
        }
      })
      .catch(() => {
        if (isMounted) setIsLoaded(true)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const persist = useCallback((next: Wallet[]) => {
    setWallets(next)
    saveToStorage(next)
  }, [])

  const addWallet = useCallback(
    (input: { name: string; balanceIdr: number; themeId: string }) => {
      const themeId =
        input.themeId in WALLET_THEMES ||
        input.themeId.startsWith('custom_') ||
        input.themeId.startsWith('custom:')
          ? input.themeId
          : 'bca'
      const tempId = crypto.randomUUID()
      const newWallet: Wallet = {
        id: tempId,
        name: input.name,
        balanceIdr: input.balanceIdr,
        themeId,
        order: wallets.length,
        createdAt: new Date().toISOString(),
      }
      persist([...wallets, newWallet])
      void createWalletAction({ name: input.name, balanceIdr: input.balanceIdr, themeId }).then(
        (res) => {
          if (res.ok && res.data) {
            setWallets((prev) => prev.map((w) => (w.id === tempId ? res.data! : w)))
          }
        },
      )
    },
    [wallets, persist],
  )

  const updateWallet = useCallback(
    (id: string, patch: Partial<Omit<Wallet, 'id' | 'createdAt'>>) => {
      persist(wallets.map((w) => (w.id === id ? { ...w, ...patch } : w)))
      void updateWalletAction(id, patch)
    },
    [wallets, persist],
  )

  const deleteWallet = useCallback(
    (id: string) => {
      persist(wallets.filter((w) => w.id !== id))
      void deleteWalletAction(id)
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
      void quickAdjustWalletAction(id, deltaIdr)
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

export { WalletFormSchema, type WalletFormValues } from './types'
