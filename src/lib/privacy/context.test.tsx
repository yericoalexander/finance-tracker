import { describe, expect, it, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { formatMaskedAmount, PrivacyProvider, usePrivacy } from './context'

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

  describe('PrivacyProvider and usePrivacy Hook', () => {
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
      expect(localStorage.getItem('finance_privacy_mode')).toBe('true')
      expect(result.current.maskAmount('Rp 100.000')).toBe('Rp ••••••')

      act(() => {
        result.current.togglePrivacy()
      })

      expect(result.current.isPrivate).toBe(false)
      expect(localStorage.getItem('finance_privacy_mode')).toBe('false')
    })

    it('initializes as private if localStorage was previously set to true', () => {
      localStorage.setItem('finance_privacy_mode', 'true')

      const { result } = renderHook(() => usePrivacy(), {
        wrapper: PrivacyProvider,
      })

      expect(result.current.isPrivate).toBe(true)
    })
  })
})
