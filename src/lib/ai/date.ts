export interface ParsedDateTime {
  date: string // YYYY-MM-DD
  time: string // HH:mm
  fallbackUsed: boolean
}

const INDO_MONTH_MAP: Record<string, string> = {
  jan: '01',
  januari: '01',
  january: '01',
  feb: '02',
  februari: '02',
  february: '02',
  mar: '03',
  maret: '03',
  march: '03',
  apr: '04',
  april: '04',
  mei: '05',
  may: '05',
  jun: '06',
  juni: '06',
  june: '06',
  jul: '07',
  juli: '07',
  july: '07',
  agu: '08',
  agt: '08',
  agustus: '08',
  aug: '08',
  august: '08',
  sep: '09',
  september: '09',
  okt: '10',
  oktober: '10',
  oct: '10',
  october: '10',
  nov: '11',
  november: '11',
  des: '12',
  desember: '12',
  dec: '12',
  december: '12',
}

/**
 * Normalisasi format tanggal fleksibel seperti "08 Nov 2026" atau "8 November 2026"
 * ke format standar ISO YYYY-MM-DD.
 */
export function normalizeDateString(rawDate?: string | null): string | undefined {
  if (!rawDate || typeof rawDate !== 'string') return undefined
  const trimmed = rawDate.trim()
  if (!trimmed) return undefined

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed
  }

  // Pola "08 Nov 2026", "8 November 2026"
  const textMonthMatch = trimmed.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/)
  if (textMonthMatch && textMonthMatch[1] && textMonthMatch[2] && textMonthMatch[3]) {
    const day = textMonthMatch[1].padStart(2, '0')
    const monthKey = textMonthMatch[2].toLowerCase()
    const month = INDO_MONTH_MAP[monthKey]
    const year = textMonthMatch[3]
    if (month) {
      return `${year}-${month}-${day}`
    }
  }

  return trimmed
}

/**
 * Mendapatkan tanggal dan waktu saat ini di zona waktu Asia/Jakarta.
 */
export function getCurrentJakartaDateTime(): { date: string; time: string } {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  // Format en-CA: "YYYY-MM-DD, HH:mm"
  const formatted = formatter.format(now)
  const [datePart, timePart] = formatted.split(', ')

  return {
    date: datePart ?? now.toISOString().slice(0, 10),
    time: timePart ? timePart.trim() : '00:00',
  }
}

/**
 * Normalisasi tanggal dan waktu transaksi. Jika kosong atau tidak valid,
 * gunakan waktu server Asia/Jakarta dan tandai fallbackUsed = true.
 */
export function resolveTransactionDateTime(
  rawDate?: string | null,
  rawTime?: string | null,
): ParsedDateTime {
  const current = getCurrentJakartaDateTime()

  let date = current.date
  let time = current.time
  let fallbackUsed = false

  // Validasi format tanggal YYYY-MM-DD
  if (rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate.trim())) {
    date = rawDate.trim()
  } else {
    fallbackUsed = true
  }

  // Validasi format waktu HH:mm
  if (rawTime && /^\d{2}:\d{2}$/.test(rawTime.trim())) {
    time = rawTime.trim()
  } else {
    // Jika waktu tidak terbaca tapi tanggal terbaca, pakai 00:00 atau current.time
    if (!fallbackUsed) {
      time = current.time
    }
  }

  return { date, time, fallbackUsed }
}
