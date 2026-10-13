import { describe, expect, it } from 'vitest'

import { getCurrentJakartaDateTime, resolveTransactionDateTime } from './date'

describe('date resolver', () => {
  it('menggunakan tanggal dan waktu valid jika tersedia', () => {
    const res = resolveTransactionDateTime('2026-10-13', '14:30')
    expect(res.date).toBe('2026-10-13')
    expect(res.time).toBe('14:30')
    expect(res.fallbackUsed).toBe(false)
  })

  it('menggunakan fallback waktu server Asia/Jakarta jika tanggal tidak terbaca', () => {
    const res = resolveTransactionDateTime(null, null)
    expect(res.fallbackUsed).toBe(true)
    expect(res.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(res.time).toMatch(/^\d{2}:\d{2}$/)
  })

  it('menggunakan fallback jika format tanggal tidak sesuai YYYY-MM-DD', () => {
    const res = resolveTransactionDateTime('13/10/2026', '12:00')
    expect(res.fallbackUsed).toBe(true)
    expect(res.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('mengembalikan tanggal Jakarta valid dari getCurrentJakartaDateTime', () => {
    const dt = getCurrentJakartaDateTime()
    expect(dt.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(dt.time).toMatch(/^\d{2}:\d{2}$/)
  })
})
