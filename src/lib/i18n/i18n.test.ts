import { describe, expect, it } from 'vitest'
import { translations, categoryTranslations, paymentMethodTranslations } from './translations'
import { formatRupiah } from '../ai/currency'

describe('i18n translations & currency integrity', () => {
  it('has identical keys for both Indonesian (id) and English (en)', () => {
    const idKeys = Object.keys(translations.id).sort()
    const enKeys = Object.keys(translations.en).sort()
    expect(idKeys).toEqual(enKeys)
  })

  it('keeps currency values in Rupiah regardless of language', () => {
    // Requirements: "ganti bahasa english tapi tetap rupiah"
    const amount = 462727
    const formatted = formatRupiah(amount)
    expect(formatted).toContain('Rp')
    expect(formatted).toContain('462.727')
    expect(formatted).not.toContain(',00')
  })

  it('translates common categories properly', () => {
    expect(categoryTranslations['Makanan & Minuman']?.id).toBe('Makanan & Minuman')
    expect(categoryTranslations['Makanan & Minuman']?.en).toBe('Food & Beverage')

    expect(categoryTranslations['Transportasi']?.en).toBe('Transportation')
    expect(categoryTranslations['Belanja']?.en).toBe('Shopping')
    expect(categoryTranslations['Tagihan & Utilitas']?.en).toBe('Bills & Utilities')
    expect(categoryTranslations['Hiburan']?.en).toBe('Entertainment')
    expect(categoryTranslations['Kesehatan']?.en).toBe('Healthcare')
  })

  it('translates payment methods properly', () => {
    expect(paymentMethodTranslations['QRIS']?.en).toBe('QRIS')
    expect(paymentMethodTranslations['Transfer BCA']?.en).toBe('BCA Transfer')
    expect(paymentMethodTranslations['Tunai']?.en).toBe('Cash')
  })

  it('has valid language change toast messages mentioning Rupiah preservation', () => {
    expect(translations.id.switchedToEnglish).toContain('Rupiah')
    expect(translations.en.switchedToEnglish).toContain('Rupiah')
  })
})
