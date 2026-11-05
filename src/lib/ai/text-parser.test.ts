import { describe, expect, it } from 'vitest'
import { inferCategory, parseNotificationFast } from './text-parser'

describe('parseNotificationFast (Regex Tier 1)', () => {
  it('parses BCA QRIS notification accurately', () => {
    const text = 'm-BCA: Pembayaran QRIS sebesar Rp 25.000 ke KOPI KENANGAN berhasil pada 05/11'
    const result = parseNotificationFast(text)

    expect(result).not.toBeNull()
    expect(result?.amountIdr).toBe(25000)
    expect(result?.merchant).toBe('KOPI KENANGAN')
    expect(result?.category).toBe('Makanan & Minuman')
    expect(result?.paymentMethod).toBe('QRIS BCA')
    expect(result?.txType).toBe('expense')
    expect(result?.confidence).toBeGreaterThanOrEqual(0.9)
  })

  it('parses Mandiri Livin QRIS notification accurately', () => {
    const text = 'Pembayaran QRIS sebesar Rp 45.000 di STARBUCKS berhasil.'
    const result = parseNotificationFast(text)

    expect(result).not.toBeNull()
    expect(result?.amountIdr).toBe(45000)
    expect(result?.merchant).toBe('STARBUCKS')
    expect(result?.category).toBe('Makanan & Minuman')
    expect(result?.txType).toBe('expense')
  })

  it('parses GoPay payment notification accurately', () => {
    const text = 'Kamu berhasil bayar Rp 24.000 pakai GoPay di KOPI KENANGAN'
    const result = parseNotificationFast(text)

    expect(result).not.toBeNull()
    expect(result?.amountIdr).toBe(24000)
    expect(result?.merchant).toBe('KOPI KENANGAN')
    expect(result?.category).toBe('Makanan & Minuman')
    expect(result?.paymentMethod).toBe('GoPay')
    expect(result?.txType).toBe('expense')
  })

  it('parses BCA SMS mutasi debit (DB = expense)', () => {
    const text = '05/11 09:30 TRSF E-BANKING DB 50.000,00 ke 1234567890 INDOMARET'
    const result = parseNotificationFast(text)

    expect(result).not.toBeNull()
    expect(result?.amountIdr).toBe(50000)
    expect(result?.merchant).toBe('INDOMARET')
    expect(result?.category).toBe('Belanja')
    expect(result?.txType).toBe('expense')
  })

  it('parses BCA SMS mutasi kredit (CR = income / uang masuk)', () => {
    const text = '05/11 09:30 TRSF E-BANKING CR 500.000,00 dari BUDI SANTOSO'
    const result = parseNotificationFast(text)

    expect(result).not.toBeNull()
    expect(result?.amountIdr).toBe(500000)
    expect(result?.merchant).toBe('BUDI SANTOSO')
    expect(result?.txType).toBe('income')
  })

  it('parses Dana Masuk / Transfer Masuk notification as income', () => {
    const text = 'Transfer Masuk Rp 1.500.000 dari PT SOLUSI TEKNOLOGI berhasil'
    const result = parseNotificationFast(text)

    expect(result).not.toBeNull()
    expect(result?.amountIdr).toBe(1500000)
    expect(result?.merchant).toBe('PT SOLUSI TEKNOLOGI')
    expect(result?.txType).toBe('income')
  })

  it('parses SPBU fuel payment to Transportasi category', () => {
    const text = 'Transaksi QRIS BRImo Rp 50.000 di SPBU PERTAMINA berhasil'
    const result = parseNotificationFast(text)

    expect(result).not.toBeNull()
    expect(result?.amountIdr).toBe(50000)
    expect(result?.category).toBe('Transportasi')
    expect(result?.txType).toBe('expense')
  })

  it('parses Alfamart payment to Belanja category', () => {
    const text = 'Pembayaran Rp 78.500 di ALFAMART berhasil'
    const result = parseNotificationFast(text)

    expect(result).not.toBeNull()
    expect(result?.amountIdr).toBe(78500)
    expect(result?.category).toBe('Belanja')
  })

  it('returns null for empty or non-financial string', () => {
    expect(parseNotificationFast('')).toBeNull()
    expect(parseNotificationFast('Halo selamat pagi apa kabar?')).toBeNull()
  })
})

describe('inferCategory', () => {
  it('categorizes pharmacy to Kesehatan', () => {
    expect(inferCategory('KIMIA FARMA')).toBe('Kesehatan')
    expect(inferCategory('Apotek K-24')).toBe('Kesehatan')
  })

  it('categorizes electricity bills to Tagihan & Utilitas', () => {
    expect(inferCategory('PLN Postpaid')).toBe('Tagihan & Utilitas')
    expect(inferCategory('Indihome')).toBe('Tagihan & Utilitas')
  })

  it('categorizes streaming to Hiburan', () => {
    expect(inferCategory('Netflix')).toBe('Hiburan')
    expect(inferCategory('Bioskop XXI')).toBe('Hiburan')
  })
})
