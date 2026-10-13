import { describe, expect, it } from 'vitest'

import { formatRupiah, parseIndonesianCurrency } from './currency'

describe('parseIndonesianCurrency', () => {
  it('mem-parsing format angka standar dengan titik', () => {
    expect(parseIndonesianCurrency('1.250.000')).toBe(1250000)
    expect(parseIndonesianCurrency('Rp 1.250.000')).toBe(1250000)
    expect(parseIndonesianCurrency('Rp. 15.000')).toBe(15000)
    expect(parseIndonesianCurrency('IDR 50.000')).toBe(50000)
  })

  it('mem-parsing format dengan desimal sen (,00)', () => {
    expect(parseIndonesianCurrency('Rp 15.000,00')).toBe(15000)
    expect(parseIndonesianCurrency('25.000,50')).toBe(25000)
    expect(parseIndonesianCurrency('1.250.000.00')).toBe(1250000)
  })

  it('mem-parsing format singkatan ribu (rb, ribu, k)', () => {
    expect(parseIndonesianCurrency('Rp50rb')).toBe(50000)
    expect(parseIndonesianCurrency('50 rb')).toBe(50000)
    expect(parseIndonesianCurrency('50k')).toBe(50000)
    expect(parseIndonesianCurrency('15.5k')).toBe(15500)
    expect(parseIndonesianCurrency('15,5 rb')).toBe(15500)
  })

  it('mem-parsing format singkatan juta (jt, juta)', () => {
    expect(parseIndonesianCurrency('1,2 jt')).toBe(1200000)
    expect(parseIndonesianCurrency('1.2 jt')).toBe(1200000)
    expect(parseIndonesianCurrency('1,2 juta')).toBe(1200000)
    expect(parseIndonesianCurrency('10 jt')).toBe(10000000)
    expect(parseIndonesianCurrency('0.5 jt')).toBe(500000)
  })

  it('menangani input angka, null, undefined, atau string kosong', () => {
    expect(parseIndonesianCurrency(25000)).toBe(25000)
    expect(parseIndonesianCurrency(null)).toBe(0)
    expect(parseIndonesianCurrency(undefined)).toBe(0)
    expect(parseIndonesianCurrency('')).toBe(0)
    expect(parseIndonesianCurrency('bukan angka')).toBe(0)
  })
})

describe('formatRupiah', () => {
  it('memformat angka ke mata uang rupiah tanpa desimal', () => {
    const formatted = formatRupiah(1250000)
    expect(formatted).toContain('1.250.000')
    expect(formatted).not.toContain(',00')
  })
})
