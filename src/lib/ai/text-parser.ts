import { parseIndonesianCurrency } from './currency'
import { normalizeDateString } from './date'
import type { Category } from './types'
import { CATEGORIES } from './types'

export interface ParsedNotification {
  amountIdr: number
  merchant: string
  category: Category
  paymentMethod: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  txType: 'expense' | 'income'
  confidence: number
  note: string
  sourceBank?: string
  destinationBank?: string
  isTransfer?: boolean
}

function cleanMerchantName(raw: string): string {
  let cleaned = raw
    .replace(/(berhasil|sukses|pada|via|tanggal|jam|ref|trx|id:).*$/i, '')
    .replace(/[.,:;\\/|]+$/, '')
    .trim()

  // Remove leading bank account number, e.g. "1234567890 INDOMARET" or "REK 0987654321 BUDI"
  cleaned = cleaned.replace(/^(?:rek(?:ening)?\s+)?\d{6,}\s+/i, '').trim()

  if (cleaned.length > 50) {
    cleaned = cleaned.slice(0, 50).trim()
  }
  return cleaned || 'Merchant'
}

export function inferCategory(merchant: string, fullText: string = ''): Category {
  const target = `${merchant} ${fullText}`.toLowerCase()

  if (
    /kopi|coffee|cafe|resto|restoran|warung|soto|sate|bakso|ayam|mcd|kfc|burger|pizza|hokben|jco|chatime|kenangan|jiwa|tegu|starbucks|subway|gofood|grabfood|shopeefood|mie|roti|bakery|dapur/i.test(
      target,
    )
  ) {
    return 'Makanan & Minuman'
  }

  if (
    /gojek|goride|gocar|grab|grabcar|grabride|maxim|krl|mrt|lrt|kai|kereta|tj|transjakarta|parkir|secure parking|pertamina|spbu|shell|bp akr|toll|tol|jasamarga|bluebird|tiket/i.test(
      target,
    )
  ) {
    return 'Transportasi'
  }

  if (
    /alfamart|indomaret|alfamidi|superindo|hypermart|transmart|lotte|shopee|tokopedia|lazada|tiktok shop|zalora|uniqlo|zara|h&m|miniso|belanja|toko|pasar|mall/i.test(
      target,
    )
  ) {
    return 'Belanja'
  }

  if (
    /pln|listrik|pdam|air|bpjs|indihome|telkom|firstmedia|biznet|wifi|telkomsel|xl|indosat|tri|smartfren|pulsa|kuota|pbb|tagihan/i.test(
      target,
    )
  ) {
    return 'Tagihan & Utilitas'
  }

  if (/bioskop|xxi|cgv|cinepolis|netflix|spotify|youtube|steam|playstation|disney|viu|game|hiburan|tiket/i.test(target)) {
    return 'Hiburan'
  }

  if (/apotek|kimia farma|k24|century|guardian|watsons|klinik|rs|rumah sakit|halodoc|alodokter|dokter|obat/i.test(target)) {
    return 'Kesehatan'
  }

  return 'Lainnya'
}

function getTodayDateTime(): { date: string; time: string } {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  }
}

/**
 * Mendeteksi notifikasi promo/spam aplikasi yang tidak berisi pembayaran nyata.
 * Mencegah notifikasi diskon/cashback masuk ke database sebagai transaksi Rp 0.
 */
export function isPromoText(text: string): boolean {
  if (!text || typeof text !== 'string') return false
  const t = text.toLowerCase()
  const hasPromoWords =
    /\b(promo|diskon|cashback hingga|cashback s\/d|voucher|kupon|klaim voucher|penawaran khusus|spesial untukmu|info promo|dapatkan cashback|menangkan|hadiah|iklan|selamat kamu berhak|ajak teman|bunga s\/d|bunga hingga|ekstra saldo|bonus saldo|buka rekening dapat|yuk bayar tagihanmu)\b/i.test(
      t,
    )
  const hasPaymentProof =
    /\b(melakukan pembayaran|pembayaran berhasil|pembayaran sukses|berhasil bayar|bayar\s+.*?\s+berhasil|transaksi berhasil|berhasil transaksi|transfer real-time|realtime transfer|berhasil transfer|transfer berhasil|kamu baru melakukan|kamu telah|debit\b|\bdb\b|terpotong)\b/i.test(
      t,
    )

  return hasPromoWords && !hasPaymentProof
}

// ── Tier 1: Instant Regex Fast-Parser (<1ms) ──────────────────────────────────
export function parseNotificationFast(text: string): ParsedNotification | null {
  if (!text || typeof text !== 'string') return null
  const trimmed = text.trim()
  if (trimmed.length < 5) return null

  // Tolak notifikasi promo sedini mungkin
  if (isPromoText(trimmed)) {
    return null
  }

  const { date: defaultDate, time: defaultTime } = getTodayDateTime()

  // 1. Deteksi Bank & Metode
  let sourceBank = 'Bank'
  let paymentMethod = 'QRIS / m-Banking'

  if (/bca|m-bca/i.test(trimmed)) {
    sourceBank = 'BCA'
    paymentMethod = /qris/i.test(trimmed) ? 'QRIS BCA' : 'BCA'
  } else if (/mandiri|livin/i.test(trimmed)) {
    sourceBank = 'Mandiri'
    paymentMethod = /qris/i.test(trimmed) ? 'QRIS Mandiri' : 'Mandiri'
  } else if (/brimo|bri\b/i.test(trimmed)) {
    sourceBank = 'BRI'
    paymentMethod = /qris/i.test(trimmed) ? 'QRIS BRI' : 'BRI'
  } else if (/bni|wondr/i.test(trimmed)) {
    sourceBank = 'BNI'
    paymentMethod = /qris/i.test(trimmed) ? 'QRIS BNI' : 'BNI'
  } else if (/seabank|1500130/i.test(trimmed)) {
    sourceBank = 'SeaBank'
    paymentMethod = 'SeaBank'
  } else if (/krom|tabungan utama/i.test(trimmed)) {
    sourceBank = 'Krom'
    paymentMethod = 'Krom'
  } else if (/superbank/i.test(trimmed)) {
    sourceBank = 'Superbank'
    paymentMethod = 'Superbank'
  } else if (/ocbc/i.test(trimmed)) {
    sourceBank = 'OCBC'
    paymentMethod = 'OCBC'
  } else if (/gopay/i.test(trimmed)) {
    sourceBank = 'GoPay'
    paymentMethod = 'GoPay'
  } else if (/ovo/i.test(trimmed)) {
    sourceBank = 'OVO'
    paymentMethod = 'OVO'
  } else if (
    /\bdana\b/i.test(trimmed) &&
    !/\b(?:dana\s+(?:masuk|keluar|diterima|sebesar|utama|rekening)|menerima\s+dana|sumber\s+dana)\b/i.test(
      trimmed,
    )
  ) {
    sourceBank = 'DANA'
    paymentMethod = 'DANA'
  } else if (/shopeepay/i.test(trimmed)) {
    sourceBank = 'ShopeePay'
    paymentMethod = 'ShopeePay'
  } else if (/jenius/i.test(trimmed)) {
    sourceBank = 'Jenius'
    paymentMethod = 'Jenius'
  } else if (/jago/i.test(trimmed)) {
    sourceBank = 'Bank Jago'
    paymentMethod = 'Bank Jago'
  }

  // 1b. Deteksi Bank / Dompet Tujuan (jika ada frasa "ke [Bank]")
  let destinationBank: string | undefined = undefined
  if (/\b(?:ke|tujuan|rekening)\s+(?:bank\s+)?krom\b/i.test(trimmed)) {
    destinationBank = 'Krom'
  } else if (/\b(?:ke|tujuan|rekening)\s+(?:bank\s+)?seabank\b/i.test(trimmed)) {
    destinationBank = 'SeaBank'
  } else if (/\b(?:ke|tujuan|rekening)\s+(?:bank\s+)?bca\b/i.test(trimmed)) {
    destinationBank = 'BCA'
  } else if (/\b(?:ke|tujuan|rekening)\s+(?:bank\s+)?mandiri\b/i.test(trimmed)) {
    destinationBank = 'Mandiri'
  } else if (/\b(?:ke|tujuan|rekening)\s+(?:bank\s+)?bri\b/i.test(trimmed)) {
    destinationBank = 'BRI'
  } else if (/\b(?:ke|tujuan|rekening)\s+(?:bank\s+)?bni\b/i.test(trimmed)) {
    destinationBank = 'BNI'
  } else if (/\b(?:ke|tujuan|rekening)\s+(?:bank\s+)?ocbc\b/i.test(trimmed)) {
    destinationBank = 'OCBC'
  }

  // 1c. Deteksi Bank Asal dari frasa "dari [Bank]"
  if (/\bdari\s+(?:bank\s+)?seabank\b/i.test(trimmed)) {
    sourceBank = 'SeaBank'
  } else if (/\bdari\s+(?:bank\s+)?krom\b/i.test(trimmed)) {
    sourceBank = 'Krom'
  } else if (/\bdari\s+(?:bank\s+)?bca\b/i.test(trimmed)) {
    sourceBank = 'BCA'
  } else if (/\bdari\s+(?:bank\s+)?mandiri\b/i.test(trimmed)) {
    sourceBank = 'Mandiri'
  } else if (/\bdari\s+(?:bank\s+)?bri\b/i.test(trimmed)) {
    sourceBank = 'BRI'
  } else if (/\bdari\s+(?:bank\s+)?bni\b/i.test(trimmed)) {
    sourceBank = 'BNI'
  }

  // 2. Deteksi Arah Transaksi: Pemasukan vs Pengeluaran
  const isIncome =
    /\b(masuk|diterima|menerima|cr\b|credit|money in|dana masuk|transfer masuk|top up berhasil|menerima uang)\b/i.test(
      trimmed,
    ) && !/\b(keluar|debit|db\b|money out|ke\b|bayar|pembayaran)\b/i.test(trimmed)

  const txType: 'expense' | 'income' = isIncome ? 'income' : 'expense'

  // 2a. Pola Khusus: "melakukan pembayaran" (SeaBank, BCA, E-wallet, dll)
  // e.g. "Kamu baru saja melakukan pembayaran senilai Rp 50.000 ke Kopi Kenangan pada 08/11"
  // e.g. "SeaBank: Kamu telah melakukan pembayaran sebesar Rp 25.000 di Alfamart"
  // e.g. "Melakukan pembayaran Rp 15.000 di Superindo"
  const melakukanPembayaranMatch = trimmed.match(
    /(?:baru\s+saja\s+|telah\s+|berhasil\s+)?melakukan\s+pembayaran\s*(?:sebesar|senilai|rp\.?)?\s*(?:rp\.?\s*)?([\d.,]+)(?:\s*(?:ke|di|untuk|pada)\s+([a-zA-Z0-9\s.,'-]+?))?(?:\s*(?:pada|tanggal|jam|berhasil|sukses|\.|$)|$)/i,
  )
  if (melakukanPembayaranMatch && melakukanPembayaranMatch[1]) {
    const amount = parseIndonesianCurrency(melakukanPembayaranMatch[1])
    if (amount > 0) {
      const rawMerchant = melakukanPembayaranMatch[2]
      const merchant = rawMerchant
        ? cleanMerchantName(rawMerchant)
        : sourceBank !== 'Bank'
          ? `Pembayaran ${sourceBank}`
          : 'Pembayaran'
      return {
        amountIdr: amount,
        merchant,
        category: inferCategory(merchant, trimmed),
        paymentMethod: sourceBank !== 'Bank' ? sourceBank : paymentMethod,
        date: defaultDate,
        time: defaultTime,
        txType: 'expense',
        confidence: 0.98,
        note: `Pembayaran ${sourceBank !== 'Bank' ? sourceBank : ''} di ${merchant}`.trim(),
        sourceBank: sourceBank !== 'Bank' ? sourceBank : undefined,
        isTransfer: false,
      }
    }
  }

  // 2b. Deteksi Transfer Bank Keluar (SeaBank, Krom, BCA, dll) -> Otomatis tercatat sebagai Pengeluaran
  // e.g. "Realtime Transfer: Kamu baru melakukan transfer real-time senilai Rp10.000 pada 05 Nov 2026 10:54."
  // e.g. "Transfer Rp 10.000 dari SeaBank ke Tokopedia"
  const isExplicitTransfer =
    /\b(transfer real-time|realtime transfer|transfer online|transfer antar bank|tf dari|transfer dari|transfer ke|tf ke)\b/i.test(
      trimmed,
    ) ||
    (/\b(transfer|tf)\b/i.test(trimmed) && (Boolean(destinationBank) || /senilai|sebesar/i.test(trimmed)))

  if (isExplicitTransfer) {
    const transferAmountMatch = trimmed.match(
      /(?:senilai|sebesar|rp\.?|nominal)?\s*(?:rp\.?\s*)?([\d.,]+)(?:\s*(?:ke|kepada|pada|dari|tanggal|jam|\.|$))/i,
    )
    if (transferAmountMatch && transferAmountMatch[1]) {
      const amount = parseIndonesianCurrency(transferAmountMatch[1])
      if (amount > 0) {
        const destName =
          destinationBank ||
          (trimmed.match(
            /(?:ke|kepada)\s+([A-Za-z0-9\s.,'-]+?)(?:\s+(?:pada|sebesar|senilai|berhasil|\.|\(|$)|$)/i,
          )?.[1]?.trim() ?? 'Rekening Tujuan')
        const merchant = destinationBank ? `Transfer ke ${destinationBank}` : cleanMerchantName(destName)

        const dateMatch = trimmed.match(/pada\s+(\d{1,2}\s+[a-zA-Z]+\s+\d{4})(?:\s+(\d{2}:\d{2}))?/i)
        const txDate = dateMatch?.[1] ? normalizeDateString(dateMatch[1]) ?? defaultDate : defaultDate
        const txTime = dateMatch?.[2] ?? defaultTime

        return {
          amountIdr: amount,
          merchant,
          category: inferCategory(merchant, trimmed),
          paymentMethod: sourceBank !== 'Bank' ? sourceBank : 'm-Banking',
          date: txDate,
          time: txTime,
          txType: 'expense',
          confidence: 0.96,
          note: `Transfer ${sourceBank} ke ${destinationBank || merchant}`,
          sourceBank: sourceBank !== 'Bank' ? sourceBank : undefined,
          destinationBank,
          isTransfer: false,
        }
      }
    }
  }

  // 2c. Deteksi Krom / Bank Terima Dana Masuk
  // e.g. "Tabungan Utama baru saja menerima dana sebesar Rp10.000 dari YERICO ALEXANDER."
  const kromReceiveMatch = trimmed.match(
    /(?:tabungan\s+utama\s+)?(?:baru\s+saja\s+)?(?:menerima\s+dana|dana\s+diterima)(?: sebesar)?\s*(?:rp\.?\s*)?([\d.,]+)\s*(?:dari)\s+([a-zA-Z0-9\s.,'-]+?)(?:\s+(?:berhasil|sukses|\.|$)|$)/i,
  )
  if (kromReceiveMatch && kromReceiveMatch[1] && kromReceiveMatch[2]) {
    const amount = parseIndonesianCurrency(kromReceiveMatch[1])
    const sender = cleanMerchantName(kromReceiveMatch[2])
    if (amount > 0) {
      return {
        amountIdr: amount,
        merchant: sender,
        category: 'Lainnya',
        paymentMethod: sourceBank === 'Krom' ? 'Krom' : paymentMethod,
        date: defaultDate,
        time: defaultTime,
        txType: 'income',
        confidence: 0.96,
        note: `Dana diterima di ${sourceBank !== 'Bank' ? sourceBank : 'Krom'} dari ${sender}`,
        sourceBank: sourceBank !== 'Bank' ? sourceBank : 'Krom',
        destinationBank: sourceBank !== 'Bank' ? sourceBank : 'Krom',
        isTransfer: false,
      }
    }
  }

  // 3. Pola 1: BCA SMS / Mutasi Klasik (DB = Debit, CR = Credit)
  // e.g. "05/11 09:30 TRSF E-BANKING DB 50.000,00 ke 1234567890 INDOMARET"
  const bcaSmsMatch = trimmed.match(
    /(?:TRSF\s+E-BANKING\s+)?(DB|CR)\s+([\d.,]+)(?:,00)?\s+(?:ke|dari)\s+([A-Za-z0-9\s.,'-]+)/i,
  )
  if (bcaSmsMatch && bcaSmsMatch[1] && bcaSmsMatch[2] && bcaSmsMatch[3]) {
    const isCr = bcaSmsMatch[1].toUpperCase() === 'CR'
    const amount = parseIndonesianCurrency(bcaSmsMatch[2])
    const merchant = cleanMerchantName(bcaSmsMatch[3])
    if (amount > 0) {
      return {
        amountIdr: amount,
        merchant,
        category: inferCategory(merchant, trimmed),
        paymentMethod: 'BCA',
        date: defaultDate,
        time: defaultTime,
        txType: isCr ? 'income' : 'expense',
        confidence: 0.95,
        note: `Transaksi BCA ${isCr ? 'Masuk' : 'Keluar'} ke ${merchant}`,
        sourceBank: 'BCA',
      }
    }
  }

  // 4. Pola 2: QRIS Bank (BCA, Mandiri, BRI, BNI, dll)
  // e.g. "Pembayaran QRIS sebesar Rp 25.000 di Kopi Kenangan berhasil"
  // e.g. "QRIS Rp35.000 ke Chatime sukses"
  const qrisMatch = trimmed.match(
    /qris(?: sebesar)?\s*(?:rp\.?\s*)?([\d.,]+)\s*(?:di|ke|pada)\s+([a-zA-Z0-9\s.,'-]+?)(?:\s+(?:berhasil|sukses|pada|\.|$))/i,
  )
  if (qrisMatch && qrisMatch[1] && qrisMatch[2]) {
    const amount = parseIndonesianCurrency(qrisMatch[1])
    const merchant = cleanMerchantName(qrisMatch[2])
    if (amount > 0) {
      return {
        amountIdr: amount,
        merchant,
        category: inferCategory(merchant, trimmed),
        paymentMethod: `QRIS ${sourceBank !== 'Bank' ? sourceBank : ''}`.trim(),
        date: defaultDate,
        time: defaultTime,
        txType: 'expense',
        confidence: 0.96,
        note: `Pembayaran QRIS di ${merchant}`,
        sourceBank,
      }
    }
  }

  // 5. Pola 3: E-Wallet (GoPay, OVO, DANA, ShopeePay)
  // e.g. "Kamu berhasil bayar Rp 24.000 pakai GoPay di Kopi Kenangan"
  // e.g. "Berhasil bayar Rp 35.000 ke Grab"
  // e.g. "Pembayaran Rp 15.000 ke Tokopedia berhasil"
  const ewalletMatch = trimmed.match(
    /(?:berhasil\s+)?(?:bayar|pembayaran|terpotong|kirim uang)(?: sebesar)?\s*(?:rp\.?\s*)?([\d.,]+)\s*(?:pakai\s+[\w\s]+\s+)?(?:di|ke|untuk)\s+([a-zA-Z0-9\s.,'-]+?)(?:\s+(?:berhasil|sukses|\.|$)|$)/i,
  )
  if (ewalletMatch && ewalletMatch[1] && ewalletMatch[2]) {
    const amount = parseIndonesianCurrency(ewalletMatch[1])
    const merchant = cleanMerchantName(ewalletMatch[2])
    if (amount > 0) {
      return {
        amountIdr: amount,
        merchant,
        category: inferCategory(merchant, trimmed),
        paymentMethod,
        date: defaultDate,
        time: defaultTime,
        txType: 'expense',
        confidence: 0.95,
        note: `Pembayaran ${sourceBank} di ${merchant}`,
        sourceBank,
      }
    }
  }

  // 6. Pola 4: Dana Masuk / Transfer Masuk (Pemasukan)
  // e.g. "Transfer Masuk Rp 500.000 dari BUDI SANTOSO berhasil"
  // e.g. "Dana masuk Rp 1.000.000 dari PT ABC"
  const incomeMatch = trimmed.match(
    /(?:transfer masuk|dana masuk|uang masuk|menerima(?: transfer)?)(?: sebesar)?\s*(?:rp\.?\s*)?([\d.,]+)\s*(?:dari)\s+([a-zA-Z0-9\s.,'-]+?)(?:\s+(?:berhasil|sukses|\.|$))/i,
  )
  if (incomeMatch && incomeMatch[1] && incomeMatch[2]) {
    const amount = parseIndonesianCurrency(incomeMatch[1])
    const sender = cleanMerchantName(incomeMatch[2])
    if (amount > 0) {
      return {
        amountIdr: amount,
        merchant: sender,
        category: 'Lainnya',
        paymentMethod,
        date: defaultDate,
        time: defaultTime,
        txType: 'income',
        confidence: 0.95,
        note: `Transfer masuk dari ${sender}`,
        sourceBank,
      }
    }
  }

  // 7. Pola 5: Generic Indonesian Bank "Rp X ke/di Y"
  // e.g. "Transaksi Rp 45.000 di Indomaret"
  const genericMatch = trimmed.match(
    /(?:rp\.?\s*)?([\d.,]+)\s*(?:di|ke)\s+([a-zA-Z0-9\s.,'-]+?)(?:\s+(?:berhasil|sukses|selesai|\.|$))/i,
  )
  if (genericMatch && genericMatch[1] && genericMatch[2]) {
    const amount = parseIndonesianCurrency(genericMatch[1])
    const merchant = cleanMerchantName(genericMatch[2])
    if (amount > 0 && merchant.length >= 2) {
      return {
        amountIdr: amount,
        merchant,
        category: inferCategory(merchant, trimmed),
        paymentMethod,
        date: defaultDate,
        time: defaultTime,
        txType,
        confidence: 0.88,
        note: `Transaksi di ${merchant}`,
        sourceBank,
      }
    }
  }

  return null
}

// ── Tier 2: Gemini Flash AI Fallback (~250-400ms) ─────────────────────────────
const SYSTEM_PROMPT = `Anda adalah parser notifikasi transaksi keuangan Indonesia.
Tugas Anda membaca teks notifikasi transaksi bank, SMS banking, e-wallet, atau QRIS di Indonesia.
Ekstrak data secara akurat:
1. amount: Total nominal uang yang dibayarkan atau diterima (hanya angka bulat positif > 0).
2. merchant: Nama toko, merchant, atau pihak kedua (penerima / pengirim pembayaran).
3. txType: HANYA "expense" (untuk semua pembayaran keluar, belanja, atau transfer keluar) atau "income" (jika uang masuk / transfer diterima / gaji).
4. category: SEMUA PEMBAYARAN KELUAR adalah transaksi pengeluaran. Pilih kategori yang paling tepat dari: "Makanan & Minuman", "Transportasi", "Belanja", "Tagihan & Utilitas", "Hiburan", "Kesehatan", atau "Lainnya". JANGAN gunakan "Transfer Antar Bank" untuk pembayaran belanja/transaksi.
5. paymentMethod: Nama bank atau e-wallet (misal: "SeaBank", "Krom", "QRIS BCA", "Mandiri", "GoPay", "ShopeePay", "DANA", dll).
6. note: Ringkasan singkat transaksi pembayaran.
7. sourceBank: Nama bank/dompet asal (misal: "SeaBank", "BCA", dll).
8. destinationBank: Nama bank/dompet tujuan jika transfer (misal: "Krom", "SeaBank", dll).
9. isTransfer: Set FALSE untuk semua transaksi pembayaran keluar.
10. Validasi Promo: Jika teks adalah notifikasi promo, penawaran diskon, voucher, kupon cashback penawaran, atau tidak ada pembayaran nyata: isi amount dengan 0 dan confidence 0.`

const NOTIF_JSON_SCHEMA = {
  type: 'OBJECT',
  properties: {
    amount: { type: 'INTEGER', description: 'Nominal rupiah' },
    merchant: { type: 'STRING', description: 'Nama merchant atau pihak kedua' },
    txType: { type: 'STRING', enum: ['expense', 'income'] },
    category: { type: 'STRING', enum: CATEGORIES },
    paymentMethod: { type: 'STRING' },
    note: { type: 'STRING' },
    confidence: { type: 'NUMBER' },
    sourceBank: { type: 'STRING' },
    destinationBank: { type: 'STRING' },
    isTransfer: { type: 'BOOLEAN' },
  },
  required: ['amount', 'merchant', 'txType', 'category', 'paymentMethod', 'note', 'confidence'],
}

interface RawAiNotifOutput {
  amount?: number
  merchant?: string
  txType?: 'expense' | 'income'
  category?: string
  paymentMethod?: string
  note?: string
  confidence?: number
  sourceBank?: string
  destinationBank?: string
  isTransfer?: boolean
}

export async function extractNotificationWithAI(text: string): Promise<ParsedNotification> {
  const { env } = await import('@/lib/env')
  const apiKey = env.GEMINI_API_KEY
  const modelName = env.GEMINI_MODEL || 'gemini-2.5-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `Teks Notifikasi Transaksi:\n"""\n${text}\n"""\n\nEkstrak data transaksi sesuai format schema.`,
          },
        ],
      },
    ],
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: NOTIF_JSON_SCHEMA,
      temperature: 0.1,
    },
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`)
  }

  const result = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>
      }
    }>
  }

  const contentText = result.candidates?.[0]?.content?.parts?.[0]?.text
  if (!contentText) {
    throw new Error('Gemini API did not return output text')
  }

  const parsed = JSON.parse(contentText) as RawAiNotifOutput
  const amountIdr = Math.round(Number(parsed.amount) || 0)

  if (amountIdr <= 0 || (parsed.confidence !== undefined && parsed.confidence < 0.2)) {
    throw new Error('Notifikasi promo atau bukan pembayaran valid diabaikan (nominal Rp 0)')
  }

  const { date, time } = getTodayDateTime()

  const validCategory: Category =
    parsed.category && parsed.category !== 'Transfer Antar Bank' && CATEGORIES.includes(parsed.category as Category)
      ? (parsed.category as Category)
      : inferCategory(parsed.merchant || '', parsed.note || '')

  return {
    amountIdr,
    merchant: cleanMerchantName(parsed.merchant || 'Transaksi'),
    category: validCategory,
    paymentMethod: parsed.paymentMethod || parsed.sourceBank || 'm-Banking',
    date,
    time,
    txType: parsed.txType === 'income' ? 'income' : 'expense',
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.9,
    note: parsed.note || 'Transaksi notifikasi',
    sourceBank: parsed.sourceBank,
    destinationBank: parsed.destinationBank,
    isTransfer: false,
  }
}

// ── Main Hybrid Entry Point ───────────────────────────────────────────────────
export async function parseTransactionNotification(text: string): Promise<ParsedNotification> {
  if (!text || typeof text !== 'string') {
    throw new Error('Teks notifikasi kosong')
  }

  // 0. Tolak notifikasi promo / iklan sedini mungkin
  if (isPromoText(text)) {
    throw new Error('Notifikasi promo diabaikan. Hanya notifikasi pembayaran resmi yang dicatat.')
  }

  // 1. Coba Regex Fast Parser terlebih dahulu (< 1 ms)
  const fastResult = parseNotificationFast(text)
  if (fastResult && fastResult.amountIdr > 0 && fastResult.confidence >= 0.9) {
    return fastResult
  }

  // 2. Fallback ke Gemini Flash AI jika pola kompleks atau tidak terdeteksi
  try {
    const aiResult = await extractNotificationWithAI(text)
    if (aiResult.amountIdr > 0) {
      return aiResult
    }
  } catch (err) {
    console.error('[Notification Parser] Fallback to AI failed:', err)
  }

  // 3. Jika AI gagal tapi ada hasil regex parsial dengan nominal > 0
  if (fastResult && fastResult.amountIdr > 0) {
    return fastResult
  }

  throw new Error('Tidak dapat membaca nominal pembayaran valid dari notifikasi (Rp 0 atau notifikasi promo)')
}
