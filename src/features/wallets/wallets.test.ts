import { describe, expect, it } from 'vitest'
import {
  WalletFormSchema,
} from './use-wallets'
import {
  WalletSchema,
  getWalletTheme,
  createCustomBankTheme,
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

  it('validates a wallet with custom bank gradient themeId', () => {
    const valid = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Kartu Eksklusif',
      balanceIdr: 25000000,
      themeId: 'custom_#0a2e68',
      order: 1,
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

describe('getWalletTheme & createCustomBankTheme', () => {
  it('returns valid theme for existing preset', () => {
    const bcaTheme = getWalletTheme('bca')
    expect(bcaTheme.id).toBe('bca')
    expect(bcaTheme.textColor).toBe('#ffffff')

    const mandiriTheme = getWalletTheme('mandiri')
    expect(mandiriTheme.id).toBe('mandiri')
    expect(mandiriTheme.textColor).toBe('#fbbf24')

    const appleTheme = getWalletTheme('apple')
    expect(appleTheme.id).toBe('apple')
    expect(appleTheme.iconType).toBe('apple')
  })

  it('resolves all conventional bank themes with proper icon types', () => {
    const conventionalIds = ['bca', 'mandiri', 'bri', 'bni', 'cimb', 'ocbc', 'danamon', 'permata', 'btn', 'maybank', 'panin', 'bsi']
    conventionalIds.forEach((id) => {
      const theme = getWalletTheme(id)
      expect(theme.id).toBe(id)
      expect(theme.gradient).toContain('linear-gradient(135deg')
      expect(theme.iconType).toBe(id)
    })
  })

  it('resolves all digital bank and e-wallet themes', () => {
    const digitalIds = ['krom', 'jenius', 'jago', 'seabank', 'blu', 'allo', 'superbank', 'linebank', 'raya', 'gopay', 'ovo', 'dana', 'n26', 'apple']
    digitalIds.forEach((id) => {
      const theme = getWalletTheme(id)
      expect(theme.id).toBe(id)
      expect(theme.gradient).toContain('linear-gradient(135deg')
    })
  })

  it('returns default theme when themeId is unknown', () => {
    const fallback = getWalletTheme('unknown-nonexistent')
    expect(fallback.id).toBe(DEFAULT_WALLET_THEME.id)
  })

  it('generates multi-stop bank gradient from custom hex', () => {
    const darkTheme = createCustomBankTheme('#0a2e68')
    expect(darkTheme.gradient).toContain('linear-gradient(135deg')
    expect(darkTheme.textColor).toBe('#ffffff')
    expect(darkTheme.iconType).toBe('generic')

    const lightTheme = createCustomBankTheme('#fef08a')
    expect(lightTheme.gradient).toContain('linear-gradient(135deg')
    expect(lightTheme.textColor).toBe('#0f172a')
  })

  it('resolves custom theme via getWalletTheme', () => {
    const custom = getWalletTheme('custom_#1e3a8a')
    expect(custom.id).toContain('custom_')
    expect(custom.gradient).toContain('linear-gradient(135deg')
  })
})

