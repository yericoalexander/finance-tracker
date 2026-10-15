import { env } from '@/lib/env'
import { parseIndonesianCurrency } from './currency'
import { resolveTransactionDateTime } from './date'
import type {
  ExtractionProvider,
  TransactionExtraction,
} from './types'
import {
  CATEGORIES,
  TransactionExtractionSchema,
} from './types'

const SYSTEM_PROMPT = `Anda adalah asisten keuangan pribadi cerdas di Indonesia.
Tugas Anda adalah membaca screenshot struk belanja, invoice, bukti transfer bank (BCA, Mandiri, BRI, BNI), e-wallet (GoPay, OVO, DANA, ShopeePay), QRIS, atau marketplace.

Instruksi penting:
1. Baca TOTAL AKHIR yang sebenarnya dibayarkan oleh pengguna.
2. JANGAN membaca subtotal sebelum diskon, saldo e-wallet yang tersisa, perolehan poin, cashback, atau nomor rekening.
3. Kategori harus dipilih HANYA dari salah satu pilihan berikut:
   - "Makanan & Minuman"
   - "Transportasi"
   - "Belanja"
   - "Tagihan & Utilitas"
   - "Hiburan"
   - "Kesehatan"
   - "Lainnya"
4. Tanggal dalam format YYYY-MM-DD dan waktu dalam format HH:mm (24 jam). Jika tidak ada atau buram, kosongkan string.
5. Nilai confidence (0.0 - 1.0): berikan >= 0.8 jika teks dan nominal terbaca sangat jelas, atau < 0.7 jika struk terpotong, buram, atau meragukan.`

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
}

const CANDIDATE_MODELS = Array.from(
  new Set([
    env.GEMINI_MODEL,
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
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

  const candidate = {
    date: dt.date,
    time: dt.time,
    merchant: (raw.merchant || 'Transaksi').trim(),
    amountIdr,
    category: raw.category ?? 'Lainnya',
    paymentMethod: (raw.paymentMethod || 'Lainnya').trim(),
    note: (raw.note || '-').trim(),
    confidence: Number(confidence.toFixed(2)),
  }

  const parsed = TransactionExtractionSchema.safeParse(candidate)
  if (!parsed.success) {
    throw new Error(`Validasi skema ekstraksi gagal: ${parsed.error.message}`)
  }

  return parsed.data
}

export class GeminiExtractionProvider implements ExtractionProvider {
  async extractReceipt(
    imageBuffer: Buffer,
    mimeType: string,
  ): Promise<TransactionExtraction> {
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
