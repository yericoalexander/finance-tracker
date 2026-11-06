import { describe, expect, it, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  formatMaskedAmount,
  PrivacyProvider,
  usePrivacy,
  STORAGE_KEY_GLOBAL,
  STORAGE_KEY_EXPENSES,
  STORAGE_KEY_WALLETS,
  STORAGE_KEY_TRANSACTIONS,
} from './context'

describe('Privacy Mode Context & Formatters', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('formatMaskedAmount', () => {
    it('returns the original amount string when isPrivate is false', () => {
      expect(formatMaskedAmount('Rp 1.189.597', false)).toBe('Rp 1.189.597')
      expect(formatMaskedAmount('-Rp 250.000', false)).toBe('-Rp 250.000')
      expect(formatMaskedAmount('50.000', false)).toBe('50.000')
    })

    it('masks positive Rupiah amount to standard bullet dots when isPrivate is true', () => {
      expect(formatMaskedAmount('Rp 1.189.597', true)).toBe('Rp ••••••')
      expect(formatMaskedAmount('IDR 500.000', true)).toBe('Rp ••••••')
    })

    it('masks negative Rupiah amount with minus sign when isPrivate is true', () => {
      expect(formatMaskedAmount('-Rp 250.000', true)).toBe('-Rp ••••••')
      expect(formatMaskedAmount('- Rp 50.000', true)).toBe('-Rp ••••••')
    })

    it('masks general numbers without prefix to bullet dots', () => {
      expect(formatMaskedAmount('123456', true)).toBe('••••••')
    })
  })

  describe('PrivacyProvider and usePrivacy Hook (Global / Backward Compatible)', () => {
    it('defaults to visible (isPrivate: false)', () => {
      const { result } = renderHook(() => usePrivacy(), {
        wrapper: PrivacyProvider,
      })

      expect(result.current.isPrivate).toBe(false)
      expect(result.current.maskAmount('Rp 100.000')).toBe('Rp 100.000')
    })

    it('toggles privacy mode and saves state in localStorage', () => {
      const { result } = renderHook(() => usePrivacy(), {
        wrapper: PrivacyProvider,
      })

      act(() => {
        result.current.togglePrivacy()
      })

      expect(result.current.isPrivate).toBe(true)
      expect(localStorage.getItem(STORAGE_KEY_GLOBAL)).toBe('true')
      expect(result.current.maskAmount('Rp 100.000')).toBe('Rp ••••••')

      act(() => {
        result.current.togglePrivacy()
      })

      expect(result.current.isPrivate).toBe(false)
      expect(localStorage.getItem(STORAGE_KEY_GLOBAL)).toBe('false')
    })

    it('initializes as private if localStorage was previously set to true', () => {
      localStorage.setItem(STORAGE_KEY_GLOBAL, 'true')

      const { result } = renderHook(() => usePrivacy(), {
        wrapper: PrivacyProvider,
      })

      expect(result.current.isPrivate).toBe(true)
    })
  })

  describe('Scoped Privacy: Per-Page Independence (Ringkasan vs Dompet vs Transaksi)', () => {
    it('toggles Ringkasan/Expenses privacy independently without affecting Dompet or Transaksi', () => {
      const { result: expensesHook } = renderHook(() => usePrivacy('expenses'), {
        wrapper: PrivacyProvider,
      })
      const { result: walletsHook } = renderHook(() => usePrivacy('wallets'), {
        wrapper: PrivacyProvider,
      })
      const { result: txHook } = renderHook(() => usePrivacy('transactions'), {
        wrapper: PrivacyProvider,
      })

      expect(expensesHook.current.isPrivate).toBe(false)
      expect(walletsHook.current.isPrivate).toBe(false)
      expect(txHook.current.isPrivate).toBe(false)

      // Toggle Expenses
      act(() => {
        expensesHook.current.togglePrivacy()
      })

      expect(expensesHook.current.isPrivate).toBe(true)
      expect(localStorage.getItem(STORAGE_KEY_EXPENSES)).toBe('true')
      expect(expensesHook.current.maskAmount('Rp 250.750')).toBe('Rp ••••••')

      // Dompet dan Transaksi tetap tidak terpengaruh
      expect(walletsHook.current.isPrivate).toBe(false)
      expect(walletsHook.current.maskAmount('Rp 1.000.000')).toBe('Rp 1.000.000')
      expect(txHook.current.isPrivate).toBe(false)
      expect(txHook.current.maskAmount('Rp 50.000')).toBe('Rp 50.000')
    })

    it('toggles Dompet privacy independently without affecting Expenses or Transaksi', () => {
      const { result: expensesHook } = renderHook(() => usePrivacy('expenses'), {
        wrapper: PrivacyProvider,
      })
      const { result: walletsHook } = renderHook(() => usePrivacy('wallets'), {
        wrapper: PrivacyProvider,
      })
      const { result: txHook } = renderHook(() => usePrivacy('transactions'), {
        wrapper: PrivacyProvider,
      })

      expect(expensesHook.current.isPrivate).toBe(false)
      expect(walletsHook.current.isPrivate).toBe(false)
      expect(txHook.current.isPrivate).toBe(false)

      // Toggle Dompet
      act(() => {
        walletsHook.current.togglePrivacy()
      })

      expect(walletsHook.current.isPrivate).toBe(true)
      expect(localStorage.getItem(STORAGE_KEY_WALLETS)).toBe('true')
      expect(walletsHook.current.maskAmount('Rp 500.000')).toBe('Rp ••••••')

      // Expenses dan Transaksi tetap TIDAK terpengaruh
      expect(expensesHook.current.isPrivate).toBe(false)
      expect(expensesHook.current.maskAmount('Rp 250.750')).toBe('Rp 250.750')
      expect(txHook.current.isPrivate).toBe(false)
      expect(txHook.current.maskAmount('Rp 50.000')).toBe('Rp 50.000')
    })

    it('toggles Transaksi privacy independently without affecting Expenses or Dompet', () => {
      const { result: expensesHook } = renderHook(() => usePrivacy('expenses'), {
        wrapper: PrivacyProvider,
      })
      const { result: walletsHook } = renderHook(() => usePrivacy('wallets'), {
        wrapper: PrivacyProvider,
      })
      const { result: txHook } = renderHook(() => usePrivacy('transactions'), {
        wrapper: PrivacyProvider,
      })

      // Toggle Transaksi
      act(() => {
        txHook.current.togglePrivacy()
      })

      expect(txHook.current.isPrivate).toBe(true)
      expect(localStorage.getItem(STORAGE_KEY_TRANSACTIONS)).toBe('true')
      expect(txHook.current.maskAmount('Rp 75.000')).toBe('Rp ••••••')

      // Expenses dan Dompet tetap TIDAK terpengaruh
      expect(expensesHook.current.isPrivate).toBe(false)
      expect(expensesHook.current.maskAmount('Rp 250.750')).toBe('Rp 250.750')
      expect(walletsHook.current.isPrivate).toBe(false)
      expect(walletsHook.current.maskAmount('Rp 1.000.000')).toBe('Rp 1.000.000')
    })
  })
})
