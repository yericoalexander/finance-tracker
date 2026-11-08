import { env } from '@/lib/env'
import { parseIndonesianCurrency } from './currency'
import { normalizeDateString, resolveTransactionDateTime } from './date'
import type { ExtractionProvider, TransactionExtraction } from './types'
import { CATEGORIES, TransactionExtractionSchema } from './types'
import { inferCategory } from './text-parser'

const SYSTEM_PROMPT = `Anda adalah asisten keuangan pribadi cerdas di Indonesia.
Tugas Anda adalah membaca gambar bukti transaksi keuangan: struk belanja kasir fisik, invoice digital, bukti transfer bank, atau tangkapan layar notifikasi perbankan di iPhone Lock Screen / Notification Center (seperti SeaBank, BCA, Mandiri, BRI, BNI, Krom, Jago, GoPay, OVO, DANA, ShopeePay, QRIS).

Panduan penting:
1. Tangkapan Layar Lock Screen / Notifikasi HP:
   - Gambar sering kali berupa tangkapan layar Lock Screen iPhone yang berisi jam besar (mis. 19.17), tanggal hari, dan kartu banner notifikasi yang bertumpuk.
   - FOKUS pada kartu notifikasi perbankan / pembayaran (misal notifikasi SeaBank "Realtime Transfer", "Kamu baru melakukan transfer senilai...", atau "melakukan pembayaran...").
   - Abaikan kartu notifikasi error, pintasan, atau aplikasi lain (misal notifikasi 'Finance Tracker').
2. Transfer Keluar & Pembayaran = Pengeluaran (Expense):
   - SEMUA transfer uang keluar kepada seseorang atau pembayaran via transfer bank otomatis dicatat sebagai transaksi pengeluaran (expense).
   - merchant: Nama pihak penerima transfer / toko / tujuan pembayaran (misal: "HAIDAR ABIYYU" dari teks "kepada HAIDAR ABIYYU" atau "ke BUDI").
   - amount: Nominal angka yang dibayarkan/ditransfer (misal "55000" dari "Rp55.000"). Nominal HARUS > 0.
   - sourceBank: Bank pengirim dana (misal: "SeaBank" dari logo oranye 'S' atau call center 1500130, "BCA", "Mandiri", "Krom", "GoPay", "OVO", "DANA", dll).
   - category: Pilih kategori pengeluaran yang tepat ("Makanan & Minuman", "Transportasi", "Belanja", "Tagihan & Utilitas", "Hiburan", "Kesehatan", atau "Lainnya"). JANGAN gunakan "Transfer Antar Bank" untuk transfer keluar kepada pihak lain.
   - isTransfer: false.
   - confidence: Berikan >= 0.90 jika nominal dan penerima terbaca jelas di notifikasi.
3. Tolak Notifikasi Promo / Iklan:
   - Jika gambar HANYA berisi notifikasi promo, diskon, cashback penawaran, voucher, atau iklan perbankan tanpa mutasi uang riil yang dibayarkan:
     - Set amount: "0"
     - Set confidence: 0
     - Set note: "Notifikasi promo diabaikan"
4. Tanggal & Waktu:
   - date: format YYYY-MM-DD (misal dari "08 Nov 2026" menjadi "2026-11-08").
   - time: format HH:mm (misal "19:17").`

const GEMINI_JSON_SCHEMA = {
  type: 'OBJECT',
  properties: {
    date: { type: 'STRING', description: 'YYYY-MM-DD' },
    time: { type: 'STRING', description: 'HH:mm' },
    merchant: { type: 'STRING', description: 'Nama toko atau nama penerima transfer' },
    amount: { type: 'STRING', description: 'Nominal yang dibayar/ditransfer (angka bulat)' },
    category: {
      type: 'STRING',
      enum: CATEGORIES,
    },
    paymentMethod: { type: 'STRING' },
    note: { type: 'STRING' },
    confidence: { type: 'NUMBER' },
    sourceBank: { type: 'STRING', description: 'Bank asal pengirim (mis. SeaBank, BCA, Mandiri)' },
    destinationBank: { type: 'STRING', description: 'Bank tujuan penerima jika ada' },
    isTransfer: { type: 'BOOLEAN', description: 'Set false untuk pengeluaran' },
  },
  required: ['merchant', 'amount', 'category', 'paymentMethod', 'note', 'confidence'],
}

interface RawGeminiOutput {
  date?: string
  time?: string
  merchant?: string
  amount?: string | number
  category?: string
  paymentMethod?: string
  note?: string
  confidence?: number
  sourceBank?: string
  destinationBank?: string
  isTransfer?: boolean
}

const CANDIDATE_MODELS = Array.from(
  new Set([
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    ...(env.GEMINI_MODEL !== 'gemini-2.5-flash' ? [env.GEMINI_MODEL] : []),
  ]),
)

async function callGeminiApi(
  imageBuffer: Buffer,
  mimeType: string,
  modelName: string,
): Promise<RawGeminiOutput> {
  const apiKey = env.GEMINI_API_KEY
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`

  const base64Data = imageBuffer.toString('base64')

  const requestBody = {
    contents: [
      {
        parts: [
          { text: SYSTEM_PROMPT },
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: GEMINI_JSON_SCHEMA,
    },
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(15000),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Gemini API error (HTTP ${response.status}): ${errorBody.slice(0, 200)}`)
  }

  const result = await response.json()
  const content = result.candidates?.[0]?.content?.parts?.[0]?.text
  if (!content) {
    throw new Error('Gemini tidak mengembalikan teks respon')
  }

  return JSON.parse(content) as RawGeminiOutput
}

function processRawOutput(raw: RawGeminiOutput): TransactionExtraction {
  const amountIdr = parseIndonesianCurrency(raw.amount ?? 0)
  const normalizedDate = normalizeDateString(raw.date)
  const dt = resolveTransactionDateTime(normalizedDate, raw.time)

  let confidence = typeof raw.confidence === 'number' ? raw.confidence : 0.85
  if (dt.fallbackUsed) {
    // Sedikit kurangi confidence jika tanggal menggunakan waktu saat ini
    confidence = Math.max(0.3, confidence - 0.1)
  }

  // Tolak transaksi jika nominal Rp 0 atau promo eksplisit (confidence 0)
  if (amountIdr <= 0 || confidence === 0) {
    throw new Error('Nominal transaksi Rp 0 atau bukan bukti pembayaran nyata (notifikasi promo diabaikan)')
  }

  const merchant = (raw.merchant || 'Transaksi').trim()
  const note = (raw.note || '-').trim()

  // Deteksi bank/dompet asal pembayaran
  let sourceBank = raw.sourceBank?.trim()
  const combinedText = `${merchant} ${raw.paymentMethod || ''} ${note}`
  if (!sourceBank) {
    if (/seabank/i.test(combinedText)) sourceBank = 'SeaBank'
    else if (/bca|m-bca/i.test(combinedText)) sourceBank = 'BCA'
    else if (/mandiri|livin/i.test(combinedText)) sourceBank = 'Mandiri'
    else if (/brimo|bri\b/i.test(combinedText)) sourceBank = 'BRI'
    else if (/bni|wondr/i.test(combinedText)) sourceBank = 'BNI'
    else if (/krom/i.test(combinedText)) sourceBank = 'Krom'
    else if (/gopay/i.test(combinedText)) sourceBank = 'GoPay'
    else if (/ovo/i.test(combinedText)) sourceBank = 'OVO'
    else if (/dana/i.test(combinedText)) sourceBank = 'DANA'
    else if (/shopeepay/i.test(combinedText)) sourceBank = 'ShopeePay'
  }

  // Semua pembayaran keluar otomatis adalah pengeluaran (bukan transfer antar bank)
  const validCategory =
    raw.category && raw.category !== 'Transfer Antar Bank' && CATEGORIES.includes(raw.category as (typeof CATEGORIES)[number])
      ? (raw.category as (typeof CATEGORIES)[number])
      : inferCategory(merchant, note)

  const candidate = {
    date: dt.date,
    time: dt.time,
    merchant,
    amountIdr,
    category: validCategory,
    paymentMethod: (raw.paymentMethod || sourceBank || 'Lainnya').trim(),
    note,
    confidence: Number(confidence.toFixed(2)),
    sourceBank,
    destinationBank: raw.destinationBank?.trim(),
    isTransfer: false,
  }

  const parsed = TransactionExtractionSchema.safeParse(candidate)
  if (!parsed.success) {
    throw new Error(`Validasi skema ekstraksi gagal: ${parsed.error.message}`)
  }

  return parsed.data
}

export class GeminiExtractionProvider implements ExtractionProvider {
  async extractReceipt(imageBuffer: Buffer, mimeType: string): Promise<TransactionExtraction> {
    let lastError: Error | null = null

    for (const model of CANDIDATE_MODELS) {
      try {
        const raw = await callGeminiApi(imageBuffer, mimeType, model)
        return processRawOutput(raw)
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        console.warn(`[Gemini] Model ${model} gagal: ${lastError.message}. Mencoba cadangan...`)
      }
    }

    throw new Error(`Ekstraksi Gemini gagal: ${lastError?.message ?? 'Semua model gagal'}`)
  }
}

export const defaultExtractionProvider = new GeminiExtractionProvider()
