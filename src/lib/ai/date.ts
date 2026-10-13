export interface ParsedDateTime {
  date: string // YYYY-MM-DD
  time: string // HH:mm
  fallbackUsed: boolean
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
