/**
 * Parser nominal rupiah Indonesia.
 * Mendukung format:
 * - Standar: "1.250.000", "Rp 1.250.000", "Rp. 15.000", "IDR 50000"
 * - Desimal sen: "Rp 15.000,00", "25.000,50" -> dibulatkan ke integer
 * - Singkatan: "Rp50rb", "50 rb", "50k", "1,2 jt", "1.2 juta", "1,5jt"
 */
export function parseIndonesianCurrency(raw: string | number | null | undefined): number {
  if (raw === null || raw === undefined) return 0
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? Math.max(0, Math.round(raw)) : 0
  }

  const trimmed = raw.trim().toLowerCase()
  if (!trimmed) return 0

  // Bersihkan prefix mata uang
  let cleaned = trimmed
    .replace(/^idr\s*/i, '')
    .replace(/^rp\.?\s*/i, '')
    .trim()

  // 1. Cek satuan juta ("jt" / "juta")
  const millionMatch = cleaned.match(/^([\d.,]+)\s*(?:jt|juta)$/)
  if (millionMatch && millionMatch[1]) {
    const valStr = millionMatch[1].replace(',', '.')
    const parsed = parseFloat(valStr)
    return Number.isFinite(parsed) ? Math.round(parsed * 1_000_000) : 0
  }

  // 2. Cek satuan ribu ("rb" / "ribu" / "k")
  const thousandMatch = cleaned.match(/^([\d.,]+)\s*(?:rb|ribu|k)$/)
  if (thousandMatch && thousandMatch[1]) {
    const valStr = thousandMatch[1].replace(',', '.')
    const parsed = parseFloat(valStr)
    return Number.isFinite(parsed) ? Math.round(parsed * 1_000) : 0
  }

  // 3. Format standar: buang desimal sen di belakang (misal ",00" atau ".00")
  cleaned = cleaned.replace(/[,.]\d{1,2}$/, '')

  // Buang semua karakter non-angka (titik pemisah ribuan, spasi, tanda minus, dll.)
  const digitsOnly = cleaned.replace(/\D/g, '')
  if (!digitsOnly) return 0

  const result = parseInt(digitsOnly, 10)
  return Number.isNaN(result) ? 0 : result
}

/**
 * Format integer rupiah ke teks Indonesia (Rp 1.250.000 tanpa desimal).
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}
