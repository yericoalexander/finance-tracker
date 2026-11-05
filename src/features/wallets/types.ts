import { z } from 'zod'

export interface WalletTheme {
  id: string
  label: string
  gradient: string
  textColor: string
  pillBg: string
  pillText: string
  iconType: 'bca' | 'ocbc' | 'bri' | 'krom' | 'n26' | 'apple' | 'mandiri' | 'gopay' | 'generic'
}

export const WALLET_THEMES: Record<string, WalletTheme> = {
  bca: {
    id: 'bca',
    label: 'BCA',
    gradient: 'linear-gradient(135deg, #003d79 0%, #005ca9 55%, #002855 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(0, 20, 60, 0.45)',
    pillText: '#ffffff',
    iconType: 'bca',
  },
  ocbc: {
    id: 'ocbc',
    label: 'OCBC',
    gradient: 'linear-gradient(135deg, #c4121a 0%, #e31823 60%, #9e0e15 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(70, 0, 0, 0.4)',
    pillText: '#ffffff',
    iconType: 'ocbc',
  },
  bri: {
    id: 'bri',
    label: 'BRI',
    gradient: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 50%, #f3f4f6 100%)',
    textColor: '#1f2937',
    pillBg: 'rgba(255, 255, 255, 0.75)',
    pillText: '#111827',
    iconType: 'bri',
  },
  krom: {
    id: 'krom',
    label: 'Krom',
    gradient: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 55%, #4c1d95 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(40, 10, 80, 0.45)',
    pillText: '#ffffff',
    iconType: 'krom',
  },
  n26: {
    id: 'n26',
    label: 'N26',
    gradient: 'linear-gradient(135deg, #18181b 0%, #27272a 60%, #09090b 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(255, 255, 255, 0.14)',
    pillText: '#ffffff',
    iconType: 'n26',
  },
  apple: {
    id: 'apple',
    label: 'Apple Card',
    gradient:
      'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #fed7aa 60%, #e9d5ff 85%, #cffafe 100%)',
    textColor: '#1e293b',
    pillBg: 'rgba(255, 255, 255, 0.8)',
    pillText: '#0f172a',
    iconType: 'apple',
  },
  mandiri: {
    id: 'mandiri',
    label: 'Mandiri',
    gradient: 'linear-gradient(135deg, #0a2540 0%, #0f3d6b 60%, #06182c 100%)',
    textColor: '#fbbf24',
    pillBg: 'rgba(0, 0, 0, 0.4)',
    pillText: '#fbbf24',
    iconType: 'mandiri',
  },
  gopay: {
    id: 'gopay',
    label: 'GoPay',
    gradient: 'linear-gradient(135deg, #0081a7 0%, #00afb9 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(0, 40, 60, 0.4)',
    pillText: '#ffffff',
    iconType: 'gopay',
  },
  green: {
    id: 'green',
    label: 'Hijau / Tunai',
    gradient: 'linear-gradient(135deg, #15803d 0%, #16a34a 60%, #14532d 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(0, 40, 15, 0.4)',
    pillText: '#ffffff',
    iconType: 'generic',
  },
}

export type WalletThemeId = keyof typeof WALLET_THEMES

export const DEFAULT_WALLET_THEME: WalletTheme = {
  id: 'bca',
  label: 'BCA',
  gradient: 'linear-gradient(135deg, #003d79 0%, #005ca9 55%, #002855 100%)',
  textColor: '#ffffff',
  pillBg: 'rgba(0, 20, 60, 0.45)',
  pillText: '#ffffff',
  iconType: 'bca',
}

export function getWalletTheme(themeId: string): WalletTheme {
  return WALLET_THEMES[themeId] ?? DEFAULT_WALLET_THEME
}

export const WalletSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(40),
  balanceIdr: z.number().int().nonnegative(),
  themeId: z.string(),
  order: z.number().int().nonnegative(),
  createdAt: z.string(),
})

export type Wallet = z.infer<typeof WalletSchema>

export const WalletsStoreSchema = z.array(WalletSchema)
