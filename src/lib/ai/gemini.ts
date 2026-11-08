import { env } from '@/lib/env'
import { parseIndonesianCurrency } from './currency'
import { resolveTransactionDateTime } from './date'
import type { ExtractionProvider, TransactionExtraction } from './types'
import { CATEGORIES, TransactionExtractionSchema } from './types'
import { inferCategory } from './text-parser'

const SYSTEM_PROMPT = `Anda adalah asisten keuangan pribadi cerdas di Indonesia.
Tugas Anda adalah membaca screenshot bukti pembayaran, struk belanja kasir, invoice lunas, atau notifikasi pembayaran resmi bank (SeaBank, BCA, Mandiri, BRI, BNI, Krom, Jago, dll), e-wallet (GoPay, OVO, DANA, ShopeePay), atau QRIS.

Instruksi penting:
1. Validasi Pembayaran Resmi: HANYA ekstrak jika gambar berisi bukti atau notifikasi PEMBAYARAN RESMI yang memiliki nominal angka jelas dan teks transaksi/pembayaran (seperti "melakukan pembayaran...", "pembayaran berhasil", "transaksi berhasil", "debit", "berhasil bayar", atau struk kasir).
2. TOLAK NOTIFIKASI PROMO: JANGAN mencatat notifikasi promo, iklan diskon, penawaran cashback, kupon/voucher, atau ajakan promo aplikasi. Jika gambar HANYA berisi notifikasi promo atau tidak ada pembayaran riil yang terjadi:
   - Set amount: "0"
   - Set confidence: 0
   - Set note: "Notifikasi promo diabaikan"
3. NOMINAL HARUS > 0: Jangan pernah mencatat nominal Rp 0. Jika tidak ada uang yang dibayarkan, set amount: "0" dan confidence: 0.
4. SEMUA PEMBAYARAN KELUAR ADALAH PENGELUARAN (EXPENSE):
   - Jika ada pembayaran belanja/transaksi (termasuk pembayaran via transfer bank), otomatis masukkan sebagai pengeluaran pengguna.
   - JANGAN gunakan kategori "Transfer Antar Bank" untuk pembayaran belanja/transaksi. Pilih kategori yang paling tepat: "Makanan & Minuman", "Transportasi", "Belanja", "Tagihan & Utilitas", "Hiburan", "Kesehatan", atau "Lainnya".
   - Set isTransfer: false.
5. Identifikasi Bank Asal: Identifikasi bank atau dompet sumber dana pembayaran (misal: "SeaBank", "BCA", "Mandiri", "Krom", "GoPay", "OVO", "DANA") dan masukkan ke sourceBank agar saldo dompet kartu tersebut terpotong otomatis.
6. Tanggal dalam format YYYY-MM-DD dan waktu dalam format HH:mm (24 jam). Jika tidak ada atau buram, kosongkan string.
7. Nilai confidence (0.0 - 1.0): berikan >= 0.85 jika teks dan nominal pembayaran terbaca sangat jelas, atau 0 jika berupa promo / tidak valid.`

const GEMINI_JSON_SCHEMA = {
  type: 'OBJECT',
  properties: {
    date: { type: 'STRING', description: 'YYYY-MM-DD' },
    time: { type: 'STRING', description: 'HH:mm' },
    merchant: { type: 'STRING' },
    amount: { type: 'STRING', description: 'Nominal yang dibayar' },
    category: {
      type: 'STRING',
      enum: CATEGORIES,
    },
    paymentMethod: { type: 'STRING' },
    note: { type: 'STRING' },
    confidence: { type: 'NUMBER' },
    sourceBank: { type: 'STRING', description: 'Bank asal pengirim (mis. SeaBank, BCA, Mandiri)' },
    destinationBank: { type: 'STRING', description: 'Bank tujuan penerima jika transfer (mis. Krom, BCA)' },
    isTransfer: { type: 'BOOLEAN', description: 'True jika transfer dana antar bank' },
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
  const dt = resolveTransactionDateTime(raw.date, raw.time)

  let confidence = typeof raw.confidence === 'number' ? raw.confidence : 0.5
  if (dt.fallbackUsed) {
    // Kurangi confidence bila tanggal tidak terbaca di struk
    confidence = Math.max(0, confidence - 0.35)
  }

  // Tolak transaksi dengan nominal 0 atau terdeteksi promo/bukan pembayaran
  if (amountIdr <= 0 || confidence < 0.2) {
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
