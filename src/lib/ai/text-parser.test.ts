import { describe, expect, it } from 'vitest'
import { inferCategory, isPromoText, parseNotificationFast, parseTransactionNotification } from './text-parser'

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

  it('parses "melakukan pembayaran" from SeaBank into expense transaction', () => {
    const text = 'SeaBank: Kamu baru saja melakukan pembayaran sebesar Rp 35.000 ke KOPI KENANGAN pada 08/11/2026'
    const result = parseNotificationFast(text)

    expect(result).not.toBeNull()
    expect(result?.amountIdr).toBe(35000)
    expect(result?.merchant).toBe('KOPI KENANGAN')
    expect(result?.sourceBank).toBe('SeaBank')
    expect(result?.category).toBe('Makanan & Minuman')
    expect(result?.txType).toBe('expense')
    expect(result?.isTransfer).toBe(false)
  })

  it('parses SeaBank realtime transfer notification as expense (not transfer antar bank)', () => {
    const text =
      'Realtime Transfer: Kamu baru melakukan transfer real-time senilai Rp10.000 pada 05 Nov 2026 10:54. Jika kamu tidak melakukan ini, segera hubungi 1500130.'
    const result = parseNotificationFast(text)

    expect(result).not.toBeNull()
    expect(result?.amountIdr).toBe(10000)
    expect(result?.sourceBank).toBe('SeaBank')
    expect(result?.isTransfer).toBe(false)
    expect(result?.category).toBe('Lainnya')
    expect(result?.txType).toBe('expense')
  })

  it('parses explicit inter-bank transfer as expense transaction', () => {
    const text = 'Transfer Rp 10.000 dari SeaBank ke Krom berhasil'
    const result = parseNotificationFast(text)

    expect(result).not.toBeNull()
    expect(result?.amountIdr).toBe(10000)
    expect(result?.sourceBank).toBe('SeaBank')
    expect(result?.destinationBank).toBe('Krom')
    expect(result?.isTransfer).toBe(false)
    expect(result?.txType).toBe('expense')
  })

  it('parses Krom incoming dana diterima notification as income', () => {
    const text = 'Tabungan Utama baru saja menerima dana sebesar Rp10.000 dari YERICO ALEXANDER.'
    const result = parseNotificationFast(text)

    expect(result).not.toBeNull()
    expect(result?.amountIdr).toBe(10000)
    expect(result?.destinationBank).toBe('Krom')
    expect(result?.txType).toBe('income')
  })

  it('returns null for empty or non-financial string', () => {
    expect(parseNotificationFast('')).toBeNull()
    expect(parseNotificationFast('Halo selamat pagi apa kabar?')).toBeNull()
  })

  it('filters out promo notifications and avoids 0 Rp transactions', () => {
    const promo1 = 'SeaBank: Dapatkan bunga hingga 6% p.a. dan promo cashback menarik hari ini!'
    const promo2 = 'ShopeePay: Promo 11.11! Dapatkan diskon 50% hingga Rp 20.000!'
    const promo3 = 'Voucher diskon 50% siap dipakai untuk jajan hemat!'

    expect(isPromoText(promo1)).toBe(true)
    expect(isPromoText(promo2)).toBe(true)
    expect(isPromoText(promo3)).toBe(true)

    expect(parseNotificationFast(promo1)).toBeNull()
    expect(parseNotificationFast(promo2)).toBeNull()
    expect(parseNotificationFast(promo3)).toBeNull()
  })

  it('parses SeaBank transfer notification with recipient name correctly', async () => {
    const text =
      'Realtime Transfer\nKamu baru melakukan transfer senilai Rp55.000 kepada HAIDAR ABIYYU pada 08 Nov 2026 19:17 (WIB). Jika kamu tidak melakukan ini, segera hubungi 1500130.'
    const result = await parseTransactionNotification(text)

    expect(result.amountIdr).toBe(55000)
    expect(result.merchant).toBe('HAIDAR ABIYYU')
    expect(result.sourceBank).toBe('SeaBank')
    expect(result.date).toBe('2026-11-08')
    expect(result.time).toBe('19:17')
    expect(result.txType).toBe('expense')
    expect(result.isTransfer).toBe(false)
  })

  it('throws error when parseTransactionNotification receives promo notification', async () => {
    const promo = 'SeaBank: Dapatkan bunga hingga 6% p.a. dan promo cashback menarik hari ini!'
    await expect(parseTransactionNotification(promo)).rejects.toThrow(/promo diabaikan/i)
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
