import { describe, expect, it } from 'vitest'

import { CATEGORIES, TransactionExtractionSchema } from './types'

describe('TransactionExtractionSchema', () => {
  it('menerima ekstraksi transaksi yang valid', () => {
    const valid = {
      date: '2026-10-13',
      time: '12:30',
      merchant: 'Kopi Kenangan',
      amountIdr: 45000,
      category: 'Makanan & Minuman' as const,
      paymentMethod: 'QRIS',
      note: 'Kopi Kenangan Mantan',
      confidence: 0.95,
    }

    const res = TransactionExtractionSchema.safeParse(valid)
    expect(res.success).toBe(true)
  })

  it('menolak nominal negatif atau desimal pada amountIdr', () => {
    const invalidAmount = {
      date: '2026-10-13',
      time: '12:30',
      merchant: 'Toko',
      amountIdr: -5000,
      category: 'Belanja' as const,
      paymentMethod: 'Tunai',
      note: '-',
      confidence: 0.8,
    }
    expect(TransactionExtractionSchema.safeParse(invalidAmount).success).toBe(false)
  })

  it('menolak kategori di luar daftar tetap', () => {
    const invalidCategory = {
      date: '2026-10-13',
      time: '12:30',
      merchant: 'Toko',
      amountIdr: 5000,
      category: 'Kategori Sembarang',
      paymentMethod: 'Tunai',
      note: '-',
      confidence: 0.8,
    }
    expect(TransactionExtractionSchema.safeParse(invalidCategory).success).toBe(false)
  })

  it('menolak confidence di luar rentang 0 sampai 1', () => {
    const invalidConfidence = {
      date: '2026-10-13',
      time: '12:30',
      merchant: 'Toko',
      amountIdr: 5000,
      category: 'Belanja' as const,
      paymentMethod: 'Tunai',
      note: '-',
      confidence: 1.5,
    }
    expect(TransactionExtractionSchema.safeParse(invalidConfidence).success).toBe(false)
  })

  it('memastikan semua kategori terdaftar di CATEGORIES', () => {
    expect(CATEGORIES).toContain('Makanan & Minuman')
    expect(CATEGORIES).toContain('Transportasi')
    expect(CATEGORIES).toContain('Belanja')
    expect(CATEGORIES).toContain('Tagihan & Utilitas')
    expect(CATEGORIES).toContain('Hiburan')
    expect(CATEGORIES).toContain('Kesehatan')
    expect(CATEGORIES).toContain('Lainnya')
  })
})
