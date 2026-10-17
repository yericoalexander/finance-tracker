import { describe, expect, it } from 'vitest'

import { formatRupiah } from '@/lib/ai/currency'
import { formatReminderMessage } from './reminder-evaluator'

describe('formatReminderMessage', () => {
  it('menghasilkan pesan default saat customMessage kosong atau null', () => {
    const result = formatReminderMessage(null, 1500000, 1500000)
    expect(result).toContain('🚨 BATAS TERLAMPAUI: Pengeluaran bulan ini sudah mencapai')
    expect(result).toContain(formatRupiah(1500000))
  })

  it('mengganti placeholder {total} dan {limit} dengan format rupiah yang sesuai', () => {
    const template = 'Pengeluaran kamu udah {total}! Batas bulanan: {limit}. Hemat ya!'
    const result = formatReminderMessage(template, 1600000, 1500000)

    expect(result).toBe(`Pengeluaran kamu udah ${formatRupiah(1600000)}! Batas bulanan: ${formatRupiah(1500000)}. Hemat ya!`)
  })

  it('mengganti placeholder {sisa} dengan selisih yang tersisa', () => {
    const template = 'Pengeluaran {total}, sisa budget kamu {sisa}'
    const result = formatReminderMessage(template, 1200000, 1500000)

    expect(result).toBe(`Pengeluaran ${formatRupiah(1200000)}, sisa budget kamu ${formatRupiah(300000)}`)
  })

  it('menghasilkan sisa Rp 0 jika total sudah melebihi limit', () => {
    const template = 'Sisa budget: {sisa}'
    const result = formatReminderMessage(template, 1800000, 1500000)

    expect(result).toBe(`Sisa budget: ${formatRupiah(0)}`)
  })

  it('menghasilkan pesan peringatan dini 90% dengan benar saat isEarlyWarning true', () => {
    const result = formatReminderMessage(null, 1350000, 1500000, true)

    expect(result).toContain('⚠️ PERINGATAN: Pengeluaran bulan ini sudah mencapai 90%')
    expect(result).toContain(formatRupiah(1350000))
    expect(result).toContain(formatRupiah(1500000))
  })

  it('otomatis menyertakan nominal angka sistem saat user hanya mengetik teks murni tanpa variabel', () => {
    const customText = 'Yuk ngerem jajan, ingat tabungan!'
    const result = formatReminderMessage(customText, 1500000, 1500000)

    expect(result).toContain(formatRupiah(1500000))
    expect(result).toContain('Yuk ngerem jajan, ingat tabungan!')
    expect(result).toContain('🚨 BATAS TERLAMPAUI:')
  })

  it('menyertakan teks custom murni pada peringatan dini 90%', () => {
    const customText = 'Hati-hati pengeluaran sudah dekat batas!'
    const result = formatReminderMessage(customText, 1350000, 1500000, true)

    expect(result).toContain('90%')
    expect(result).toContain(formatRupiah(1350000))
    expect(result).toContain('Hati-hati pengeluaran sudah dekat batas!')
  })

  it('mendukung persentase dinamis dari slider (misal 75%)', () => {
    const result = formatReminderMessage(null, 1125000, 1500000, true, 75)

    expect(result).toContain('75%')
    expect(result).toContain(formatRupiah(1125000))
    expect(result).toContain(formatRupiah(1500000))
  })
})

