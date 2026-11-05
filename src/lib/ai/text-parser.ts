import { parseIndonesianCurrency } from './currency'
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

// ── Tier 1: Instant Regex Fast-Parser (<1ms) ──────────────────────────────────
export function parseNotificationFast(text: string): ParsedNotification | null {
  if (!text || typeof text !== 'string') return null
  const trimmed = text.trim()
  if (trimmed.length < 5) return null

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
  } else if (/gopay/i.test(trimmed)) {
    sourceBank = 'GoPay'
    paymentMethod = 'GoPay'
  } else if (/ovo/i.test(trimmed)) {
    sourceBank = 'OVO'
    paymentMethod = 'OVO'
  } else if (/dana\b/i.test(trimmed)) {
    sourceBank = 'DANA'
    paymentMethod = 'DANA'
  } else if (/shopeepay|seabank/i.test(trimmed)) {
    sourceBank = 'ShopeePay'
    paymentMethod = 'ShopeePay'
  } else if (/jenius/i.test(trimmed)) {
    sourceBank = 'Jenius'
    paymentMethod = 'Jenius'
  } else if (/jago/i.test(trimmed)) {
    sourceBank = 'Bank Jago'
    paymentMethod = 'Bank Jago'
  }

  // 2. Deteksi Arah Transaksi: Pemasukan vs Pengeluaran
  const isIncome =
    /\b(masuk|diterima|menerima|cr\b|credit|money in|dana masuk|transfer masuk|top up berhasil|menerima uang)\b/i.test(
      trimmed,
    ) && !/\b(keluar|debit|db\b|money out|ke\b|bayar|pembayaran)\b/i.test(trimmed)

  const txType: 'expense' | 'income' = isIncome ? 'income' : 'expense'

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
1. amount: Total nominal uang (hanya angka bulat).
2. merchant: Nama toko, merchant, atau pengirim/penerima transfer.
3. txType: HANYA "expense" (jika uang keluar / belanja / transfer ke orang) atau "income" (jika uang masuk / transfer diterima / gaji).
4. category: HANYA pilih dari: "Makanan & Minuman", "Transportasi", "Belanja", "Tagihan & Utilitas", "Hiburan", "Kesehatan", "Lainnya".
5. paymentMethod: Nama bank atau e-wallet (misal: "QRIS BCA", "Mandiri", "GoPay", "ShopeePay", "DANA", dll).
6. note: Ringkasan singkat transaksi.`

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
  const { date, time } = getTodayDateTime()

  const validCategory: Category = CATEGORIES.includes(parsed.category as Category)
    ? (parsed.category as Category)
    : 'Lainnya'

  return {
    amountIdr: Math.round(Number(parsed.amount) || 0),
    merchant: cleanMerchantName(parsed.merchant || 'Transaksi'),
    category: validCategory,
    paymentMethod: parsed.paymentMethod || 'm-Banking',
    date,
    time,
    txType: parsed.txType === 'income' ? 'income' : 'expense',
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.9,
    note: parsed.note || 'Transaksi notifikasi',
  }
}

// ── Main Hybrid Entry Point ───────────────────────────────────────────────────
export async function parseTransactionNotification(text: string): Promise<ParsedNotification> {
  // 1. Coba Regex Fast Parser terlebih dahulu (< 1 ms)
  const fastResult = parseNotificationFast(text)
  if (fastResult && fastResult.confidence >= 0.9) {
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

  // 3. Jika AI gagal tapi ada hasil regex parsial, gunakan hasil regex
  if (fastResult && fastResult.amountIdr > 0) {
    return fastResult
  }

  throw new Error('Tidak dapat membaca nominal dan merchant dari notifikasi transaksi')
}
