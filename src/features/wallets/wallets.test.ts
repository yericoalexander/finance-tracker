import { describe, expect, it } from 'vitest'
import {
  WalletFormSchema,
} from './use-wallets'
import {
  WalletSchema,
  getWalletTheme,
  DEFAULT_WALLET_THEME,
} from './types'

describe('Wallet Validation & Form Schema', () => {
  it('validates a valid wallet object', () => {
    const valid = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'BCA Utama',
      balanceIdr: 15000000,
      themeId: 'bca',
      order: 0,
      createdAt: new Date().toISOString(),
    }

    const result = WalletSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('rejects negative balance in WalletFormSchema', () => {
    const invalid = {
      name: 'BCA',
      balanceIdr: -5000,
      themeId: 'bca',
    }

    const result = WalletFormSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('rejects empty name in WalletFormSchema', () => {
    const invalid = {
      name: '   ',
      balanceIdr: 100000,
      themeId: 'bca',
    }

    const result = WalletFormSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('accepts zero balance for empty wallet', () => {
    const valid = {
      name: 'Tunai Dompet',
      balanceIdr: 0,
      themeId: 'green',
    }

    const result = WalletFormSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })
})

describe('getWalletTheme', () => {
  it('returns valid theme for existing preset', () => {
    const bcaTheme = getWalletTheme('bca')
    expect(bcaTheme.id).toBe('bca')
    expect(bcaTheme.textColor).toBe('#ffffff')

    const appleTheme = getWalletTheme('apple')
    expect(appleTheme.id).toBe('apple')
    expect(appleTheme.iconType).toBe('apple')
  })

  it('returns default theme when themeId is unknown', () => {
    const fallback = getWalletTheme('unknown-nonexistent')
    expect(fallback.id).toBe(DEFAULT_WALLET_THEME.id)
  })
})

