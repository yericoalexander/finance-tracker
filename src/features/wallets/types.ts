import { z } from 'zod'

export interface WalletTheme {
  id: string
  label: string
  gradient: string
  textColor: string
  pillBg: string
  pillText: string
  iconType:
    | 'bca'
    | 'ocbc'
    | 'bri'
    | 'bni'
    | 'mandiri'
    | 'cimb'
    | 'danamon'
    | 'permata'
    | 'btn'
    | 'maybank'
    | 'panin'
    | 'bsi'
    | 'krom'
    | 'jenius'
    | 'jago'
    | 'seabank'
    | 'blu'
    | 'allo'
    | 'superbank'
    | 'linebank'
    | 'raya'
    | 'gopay'
    | 'ovo'
    | 'dana'
    | 'n26'
    | 'apple'
    | 'gold'
    | 'metal'
    | 'generic'
}

export const WALLET_THEMES: Record<string, WalletTheme> = {
  // --- 1. Bank Konvensional Indonesia ---
  bca: {
    id: 'bca',
    label: 'BCA',
    gradient: 'linear-gradient(135deg, #003d79 0%, #005ca9 55%, #002855 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(0, 20, 60, 0.45)',
    pillText: '#ffffff',
    iconType: 'bca',
  },
  mandiri: {
    id: 'mandiri',
    label: 'Mandiri',
    gradient: 'linear-gradient(135deg, #0a2540 0%, #0f3d6b 60%, #06182c 100%)',
    textColor: '#fbbf24',
    pillBg: 'rgba(0, 0, 0, 0.45)',
    pillText: '#fbbf24',
    iconType: 'mandiri',
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
  bni: {
    id: 'bni',
    label: 'BNI',
    gradient: 'linear-gradient(135deg, #005e6a 0%, #007d8c 55%, #00434c 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(0, 40, 45, 0.45)',
    pillText: '#ffffff',
    iconType: 'bni',
  },
  cimb: {
    id: 'cimb',
    label: 'CIMB Niaga',
    gradient: 'linear-gradient(135deg, #780016 0%, #9c001c 55%, #590010 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(50, 0, 10, 0.45)',
    pillText: '#ffffff',
    iconType: 'cimb',
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
  danamon: {
    id: 'danamon',
    label: 'Danamon',
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #255285 55%, #112338 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(10, 25, 45, 0.45)',
    pillText: '#ffffff',
    iconType: 'danamon',
  },
  permata: {
    id: 'permata',
    label: 'Permata',
    gradient: 'linear-gradient(135deg, #3d1259 0%, #5c1d85 55%, #27093b 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(30, 5, 45, 0.45)',
    pillText: '#ffffff',
    iconType: 'permata',
  },
  btn: {
    id: 'btn',
    label: 'BTN',
    gradient: 'linear-gradient(135deg, #003366 0%, #004c99 55%, #002244 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(0, 25, 50, 0.45)',
    pillText: '#ffffff',
    iconType: 'btn',
  },
  maybank: {
    id: 'maybank',
    label: 'Maybank',
    gradient: 'linear-gradient(135deg, #1f1f23 0%, #303038 55%, #141416 100%)',
    textColor: '#ffc800',
    pillBg: 'rgba(0, 0, 0, 0.5)',
    pillText: '#ffc800',
    iconType: 'maybank',
  },
  panin: {
    id: 'panin',
    label: 'Panin Bank',
    gradient: 'linear-gradient(135deg, #005a36 0%, #007e4c 55%, #003d24 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(0, 35, 20, 0.45)',
    pillText: '#ffffff',
    iconType: 'panin',
  },
  bsi: {
    id: 'bsi',
    label: 'BSI Syariah',
    gradient: 'linear-gradient(135deg, #006d77 0%, #008f9c 55%, #004d54 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(0, 35, 40, 0.45)',
    pillText: '#ffffff',
    iconType: 'bsi',
  },

  // --- 2. Bank Digital & E-Wallet ---
  krom: {
    id: 'krom',
    label: 'Krom',
    gradient: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 55%, #4c1d95 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(40, 10, 80, 0.45)',
    pillText: '#ffffff',
    iconType: 'krom',
  },
  jenius: {
    id: 'jenius',
    label: 'Jenius',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 55%, #0369a1 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(0, 45, 75, 0.45)',
    pillText: '#ffffff',
    iconType: 'jenius',
  },
  jago: {
    id: 'jago',
    label: 'Bank Jago',
    gradient: 'linear-gradient(135deg, #ea580c 0%, #f97316 55%, #c2410c 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(80, 25, 0, 0.45)',
    pillText: '#ffffff',
    iconType: 'jago',
  },
  seabank: {
    id: 'seabank',
    label: 'SeaBank',
    gradient: 'linear-gradient(135deg, #f05a22 0%, #ff6b35 55%, #c83d0c 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(85, 25, 0, 0.45)',
    pillText: '#ffffff',
    iconType: 'seabank',
  },
  blu: {
    id: 'blu',
    label: 'Blu by BCA',
    gradient: 'linear-gradient(135deg, #0052cc 0%, #1e88e5 60%, #003c8f 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(0, 30, 80, 0.45)',
    pillText: '#ffffff',
    iconType: 'blu',
  },
  allo: {
    id: 'allo',
    label: 'Allo Bank',
    gradient: 'linear-gradient(135deg, #6d28d9 0%, #9333ea 55%, #581c87 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(45, 10, 80, 0.45)',
    pillText: '#ffffff',
    iconType: 'allo',
  },
  superbank: {
    id: 'superbank',
    label: 'Superbank',
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 55%, #047857 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(0, 45, 30, 0.45)',
    pillText: '#ffffff',
    iconType: 'superbank',
  },
  linebank: {
    id: 'linebank',
    label: 'Line Bank',
    gradient: 'linear-gradient(135deg, #06c755 0%, #22c55e 55%, #059669 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(0, 45, 20, 0.45)',
    pillText: '#ffffff',
    iconType: 'linebank',
  },
  raya: {
    id: 'raya',
    label: 'Bank Raya',
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 55%, #1e40af 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(15, 35, 80, 0.45)',
    pillText: '#ffffff',
    iconType: 'raya',
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
  ovo: {
    id: 'ovo',
    label: 'OVO',
    gradient: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 55%, #3b0764 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(35, 5, 65, 0.45)',
    pillText: '#ffffff',
    iconType: 'ovo',
  },
  dana: {
    id: 'dana',
    label: 'DANA',
    gradient: 'linear-gradient(135deg, #118eea 0%, #2bb3ff 55%, #0b66af 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(5, 35, 70, 0.45)',
    pillText: '#ffffff',
    iconType: 'dana',
  },
  n26: {
    id: 'n26',
    label: 'N26 Matte',
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
  centurion: {
    id: 'centurion',
    label: 'Black Metal',
    gradient: 'linear-gradient(135deg, #0d0d0e 0%, #1c1c1f 50%, #09090a 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(255, 255, 255, 0.14)',
    pillText: '#ffffff',
    iconType: 'metal',
  },
  gold: {
    id: 'gold',
    label: 'Imperial Gold',
    gradient: 'linear-gradient(135deg, #8a6528 0%, #d8b267 35%, #be9038 70%, #75511b 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(40, 25, 5, 0.5)',
    pillText: '#ffffff',
    iconType: 'gold',
  },
  rosegold: {
    id: 'rosegold',
    label: 'Rose Gold',
    gradient: 'linear-gradient(135deg, #a85d68 0%, #e29587 45%, #be6e78 75%, #85434d 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(60, 20, 25, 0.45)',
    pillText: '#ffffff',
    iconType: 'metal',
  },
  emerald: {
    id: 'emerald',
    label: 'Emerald Royale',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #047857 55%, #022c22 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(0, 35, 20, 0.45)',
    pillText: '#ffffff',
    iconType: 'metal',
  },
  sapphire: {
    id: 'sapphire',
    label: 'Sapphire Elite',
    gradient: 'linear-gradient(135deg, #0c2340 0%, #1d4ed8 60%, #08182b 100%)',
    textColor: '#ffffff',
    pillBg: 'rgba(5, 20, 60, 0.45)',
    pillText: '#ffffff',
    iconType: 'metal',
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

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '').trim()
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const num = parseInt(clean, 16)
  if (Number.isNaN(num) || clean.length !== 6) {
    return { r: 15, g: 35, b: 70 }
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

function adjustBrightness(r: number, g: number, b: number, percent: number): string {
  const factor = 1 + percent / 100
  const clamp = (val: number) => Math.min(255, Math.max(0, Math.round(val)))
  const nr = clamp(r * factor)
  const ng = clamp(g * factor)
  const nb = clamp(b * factor)
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`
}

export function createCustomBankTheme(hexInput: string): WalletTheme {
  const cleanHex = hexInput.startsWith('#') ? hexInput : `#${hexInput}`
  const { r, g, b } = hexToRgb(cleanHex)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255

  // Buat gradient 3-stop standar bank premium dengan specular highlight & deep shadow
  const lightStop = adjustBrightness(r, g, b, 24)
  const baseStop = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  const darkStop = adjustBrightness(r, g, b, -32)

  const isLight = luminance > 0.62

  return {
    id: `custom_${baseStop}`,
    label: 'Kustom',
    gradient: `linear-gradient(135deg, ${lightStop} 0%, ${baseStop} 52%, ${darkStop} 100%)`,
    textColor: isLight ? '#0f172a' : '#ffffff',
    pillBg: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.4)',
    pillText: isLight ? '#0f172a' : '#ffffff',
    iconType: 'generic',
  }
}

export function getWalletTheme(themeId: string): WalletTheme {
  if (WALLET_THEMES[themeId]) {
    return WALLET_THEMES[themeId]
  }
  if (themeId.startsWith('custom_') || themeId.startsWith('custom:')) {
    const hex = themeId.replace(/^custom[_:]/, '')
    return createCustomBankTheme(hex)
  }
  return DEFAULT_WALLET_THEME
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

export const WalletFormSchema = z.object({
  name: z.string().trim().min(1, 'Nama dompet wajib diisi').max(40, 'Maksimal 40 karakter'),
  balanceIdr: z.coerce
    .number()
    .int('Harus bilangan bulat')
    .nonnegative('Saldo tidak boleh negatif'),
  themeId: z.string().min(1),
})

export type WalletFormValues = z.infer<typeof WalletFormSchema>
