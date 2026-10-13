import { google } from 'googleapis'

import { buildOAuth2Client } from './auth'

export type SheetStep =
  | 'create spreadsheet'
  | 'update header'
  | 'tulis rumus Ringkasan'
  | 'tulis baris Transaksi'

// Header baku sheet Transaksi — urutan harus konsisten dengan semua writer
const TRANSACTION_HEADERS = [
  'Tanggal',
  'Waktu',
  'Merchant',
  'Kategori',
  'Nominal',
  'Metode Bayar',
  'Catatan',
  'Sumber',
  'ID',
]

// Rumus rekap bulanan dan per kategori di sheet Ringkasan
const SUMMARY_FORMULA_ROWS = [
  ['Rekap per Bulan', '', ''],
  ['Bulan', 'Total', ''],
  [
    '=TEXT(TODAY(),"YYYY-MM")',
    '=SUMIFS(Transaksi!E:E,TEXT(Transaksi!A:A,"YYYY-MM"),TEXT(TODAY(),"YYYY-MM"))',
    '',
  ],
  [''],
  ['Rekap per Kategori', '', ''],
  ['Kategori', 'Total Bulan Ini', ''],
  ['Makanan & Minuman', '=SUMIFS(Transaksi!E:E,Transaksi!D:D,A7,TEXT(Transaksi!A:A,"YYYY-MM"),TEXT(TODAY(),"YYYY-MM"))', ''],
  ['Transportasi', '=SUMIFS(Transaksi!E:E,Transaksi!D:D,A8,TEXT(Transaksi!A:A,"YYYY-MM"),TEXT(TODAY(),"YYYY-MM"))', ''],
  ['Belanja', '=SUMIFS(Transaksi!E:E,Transaksi!D:D,A9,TEXT(Transaksi!A:A,"YYYY-MM"),TEXT(TODAY(),"YYYY-MM"))', ''],
  ['Tagihan & Utilitas', '=SUMIFS(Transaksi!E:E,Transaksi!D:D,A10,TEXT(Transaksi!A:A,"YYYY-MM"),TEXT(TODAY(),"YYYY-MM"))', ''],
  ['Hiburan', '=SUMIFS(Transaksi!E:E,Transaksi!D:D,A11,TEXT(Transaksi!A:A,"YYYY-MM"),TEXT(TODAY(),"YYYY-MM"))', ''],
  ['Kesehatan', '=SUMIFS(Transaksi!E:E,Transaksi!D:D,A12,TEXT(Transaksi!A:A,"YYYY-MM"),TEXT(TODAY(),"YYYY-MM"))', ''],
  ['Lainnya', '=SUMIFS(Transaksi!E:E,Transaksi!D:D,A13,TEXT(Transaksi!A:A,"YYYY-MM"),TEXT(TODAY(),"YYYY-MM"))', ''],
]

export class GoogleApiError extends Error {
  constructor(
    message: string,
    public readonly code: number,
    public readonly googleCode: string,
    public readonly action: 'refresh' | 're-auth' | 'retry' | 'fix_request' | 'unknown',
    public readonly step?: SheetStep,
  ) {
    super(message)
    this.name = 'GoogleApiError'
  }
}

interface GoogleErrorData {
  error?: {
    code?: number
    message?: string
    status?: string
    details?: Array<{ reason?: string; domain?: string }>
  } | string
}

export function extractErrorInfo(err: unknown): {
  httpStatus: number
  googleCode: string
  message: string
} {
  if (typeof err === 'object' && err !== null) {
    const errorObj = err as Record<string, unknown>
    const resp = errorObj['response'] as {
      status?: number
      data?: GoogleErrorData
    } | undefined

    const httpStatus =
      resp?.status ??
      (typeof errorObj['status'] === 'number' ? errorObj['status'] : 0) ??
      (typeof errorObj['code'] === 'number' ? errorObj['code'] : 0)

    const respDataError = resp?.data?.error

    let googleCode = 'UNKNOWN'
    let message = ''

    if (typeof respDataError === 'string') {
      googleCode = respDataError
      message = respDataError
    } else if (respDataError && typeof respDataError === 'object') {
      googleCode =
        respDataError.details?.[0]?.reason ??
        respDataError.status ??
        (respDataError.code ? String(respDataError.code) : 'UNKNOWN')
      message = respDataError.message ?? ''
    } else if (typeof errorObj['code'] === 'string') {
      googleCode = errorObj['code']
    }

    if (!message) {
      message =
        typeof errorObj['message'] === 'string'
          ? errorObj['message']
          : 'Terjadi kesalahan pada Google API'
    }

    return { httpStatus, googleCode, message }
  }

  return {
    httpStatus: 0,
    googleCode: 'UNKNOWN',
    message: typeof err === 'string' ? err : 'Terjadi kesalahan tidak dikenal',
  }
}

export function determineAction(
  httpStatus: number,
  googleCode: string,
): 'refresh' | 're-auth' | 'retry' | 'fix_request' | 'unknown' {
  if (httpStatus === 401 || googleCode === 'invalid_grant' || googleCode === 'UNAUTHENTICATED') {
    return 'refresh'
  }
  if (
    httpStatus === 403 ||
    googleCode === 'PERMISSION_DENIED' ||
    googleCode === 'SERVICE_DISABLED' ||
    googleCode === 'access_denied'
  ) {
    return 're-auth'
  }
  if (httpStatus === 429 || googleCode === 'RESOURCE_EXHAUSTED') {
    return 'retry'
  }
  if (httpStatus === 400 || googleCode === 'INVALID_ARGUMENT') {
    return 'fix_request'
  }
  return 'unknown'
}

export function logGoogleError(step: SheetStep, err: unknown): GoogleApiError {
  const { httpStatus, googleCode, message } = extractErrorInfo(err)
  const action = determineAction(httpStatus, googleCode)

  // Log HANYA status HTTP, kode Google, dan pesan tanpa data sensitif
  console.error(
    `[Google Sheets] Gagal pada "${step}": HTTP ${httpStatus}, kode: ${googleCode}, pesan: ${message}`,
  )

  return new GoogleApiError(message, httpStatus, googleCode, action, step)
}

/**
 * Buat spreadsheet untuk user jika belum ada (idempoten berdasarkan sheetId).
 * Mengembalikan spreadsheetId.
 */
export async function ensureSpreadsheet(
  refreshToken: string,
  existingSheetId: string | null,
): Promise<string> {
  // Idempoten — sudah punya sheet
  if (existingSheetId) return existingSheetId

  const auth = buildOAuth2Client(refreshToken)
  const sheetsClient = google.sheets({ version: 'v4', auth })

  let spreadsheetId: string

  try {
    const response = await sheetsClient.spreadsheets.create({
      requestBody: {
        properties: {
          title: 'Finance Tracker — Transaksi',
          locale: 'in_ID', // Gunakan in_ID untuk bahasa Indonesia (didukung Google Sheets API)
          timeZone: 'Asia/Jakarta',
        },
        sheets: [
          {
            properties: { title: 'Transaksi', index: 0 },
            data: [
              {
                startRow: 0,
                startColumn: 0,
                rowData: [
                  {
                    values: TRANSACTION_HEADERS.map((h) => ({
                      userEnteredValue: { stringValue: h },
                      userEnteredFormat: { textFormat: { bold: true } },
                    })),
                  },
                ],
              },
            ],
          },
          {
            properties: { title: 'Ringkasan', index: 1 },
          },
        ],
      },
    })

    if (!response.data.spreadsheetId) {
      throw new Error('Spreadsheet dibuat tapi tidak ada ID yang dikembalikan')
    }

    spreadsheetId = response.data.spreadsheetId
  } catch (err) {
    throw logGoogleError('create spreadsheet', err)
  }

  try {
    // Isi rumus Ringkasan
    await sheetsClient.spreadsheets.values.update({
      spreadsheetId,
      range: 'Ringkasan!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: SUMMARY_FORMULA_ROWS },
    })
  } catch (err) {
    throw logGoogleError('tulis rumus Ringkasan', err)
  }

  return spreadsheetId
}

export interface TransactionRowData {
  date: string
  time: string
  merchant: string
  category: string
  amountIdr: number
  paymentMethod: string
  note: string
  source: string // "iPhone"
  id: string // captureId
}

/**
 * Tulis satu baris transaksi ke sheet "Transaksi" menggunakan values.append.
 * Memakai valueInputOption USER_ENTERED dan sertakan kolom ID unik.
 */
export async function appendTransactionRow(
  refreshToken: string,
  spreadsheetId: string,
  data: TransactionRowData,
): Promise<void> {
  const auth = buildOAuth2Client(refreshToken)
  const sheetsClient = google.sheets({ version: 'v4', auth })

  const rowValues = [
    data.date,
    data.time,
    data.merchant,
    data.category,
    data.amountIdr,
    data.paymentMethod,
    data.note,
    data.source,
    data.id,
  ]

  try {
    await sheetsClient.spreadsheets.values.append({
      spreadsheetId,
      range: 'Transaksi!A:I',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowValues],
      },
    })
  } catch (err) {
    throw logGoogleError('tulis baris Transaksi', err)
  }
}

