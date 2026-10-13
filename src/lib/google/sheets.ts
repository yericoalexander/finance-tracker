import { google } from 'googleapis'

import { buildOAuth2Client } from './auth'

export type SheetStep =
  | 'create spreadsheet'
  | 'update header'
  | 'tulis rumus Ringkasan'
  | 'format spreadsheet'
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

  try {
    // Format spreadsheet agar rapi dan mudah dibaca
    await formatSpreadsheet(refreshToken, spreadsheetId)
  } catch (err) {
    throw logGoogleError('format spreadsheet', err)
  }

  return spreadsheetId
}

// ── Formatting Requests ─────────────────────────────────────────────────────

function buildTransactionSheetRequests(sheetId: number) {
  const columnWidths = [115, 85, 200, 160, 135, 160, 220, 90, 130]

  return [
    {
      updateSheetProperties: {
        properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
        fields: 'gridProperties.frozenRowCount',
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 },
        properties: { pixelSize: 38 },
        fields: 'pixelSize',
      },
    },
    ...columnWidths.map((pixelSize, idx) => ({
      updateDimensionProperties: {
        range: { sheetId, dimension: 'COLUMNS', startIndex: idx, endIndex: idx + 1 },
        properties: { pixelSize },
        fields: 'pixelSize',
      },
    })),
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 9 },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.118, green: 0.161, blue: 0.231 },
            textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 }, fontSize: 10 },
            verticalAlignment: 'MIDDLE',
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,verticalAlignment)',
      },
    },
    { repeatCell: { range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 2 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER' } }, fields: 'userEnteredFormat.horizontalAlignment' } },
    { repeatCell: { range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 4, endColumnIndex: 5 }, cell: { userEnteredFormat: { horizontalAlignment: 'RIGHT' } }, fields: 'userEnteredFormat.horizontalAlignment' } },
    { repeatCell: { range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 7, endColumnIndex: 8 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER' } }, fields: 'userEnteredFormat.horizontalAlignment' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: 2 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 2, endColumnIndex: 3 }, cell: { userEnteredFormat: { horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE', textFormat: { bold: true } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat.bold)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 3, endColumnIndex: 4 }, cell: { userEnteredFormat: { horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 4, endColumnIndex: 5 }, cell: { userEnteredFormat: { horizontalAlignment: 'RIGHT', verticalAlignment: 'MIDDLE', textFormat: { bold: true }, numberFormat: { type: 'CURRENCY', pattern: '"Rp "#,##0' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat.bold,numberFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 5, endColumnIndex: 7 }, cell: { userEnteredFormat: { horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 7, endColumnIndex: 8 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', textFormat: { foregroundColor: { red: 0.45, green: 0.45, blue: 0.45 } } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat.foregroundColor)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 8, endColumnIndex: 9 }, cell: { userEnteredFormat: { horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE', textFormat: { fontSize: 8, foregroundColor: { red: 0.6, green: 0.6, blue: 0.6 } } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat.fontSize,textFormat.foregroundColor)' } },
    {
      addBanding: {
        bandedRange: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: 9 },
          rowProperties: {
            headerColor: { red: 0.118, green: 0.161, blue: 0.231 },
            firstBandColor: { red: 1, green: 1, blue: 1 },
            secondBandColor: { red: 0.965, green: 0.973, blue: 0.984 },
          },
        },
      },
    },
  ]
}

function buildSummarySheetRequests(sheetId: number) {
  return [
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 }, properties: { pixelSize: 180 }, fields: 'pixelSize' } },
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 }, properties: { pixelSize: 160 }, fields: 'pixelSize' } },
    { repeatCell: { range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 2 }, cell: { userEnteredFormat: { textFormat: { bold: true, fontSize: 11 } } }, fields: 'userEnteredFormat.textFormat' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 0, endColumnIndex: 2 }, cell: { userEnteredFormat: { backgroundColor: { red: 0.118, green: 0.161, blue: 0.231 }, textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 }, fontSize: 10 }, verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat(backgroundColor,textFormat,verticalAlignment)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 1, endColumnIndex: 2 }, cell: { userEnteredFormat: { numberFormat: { type: 'CURRENCY', pattern: '"Rp "#,##0' }, textFormat: { bold: true }, horizontalAlignment: 'RIGHT' } }, fields: 'userEnteredFormat(numberFormat,textFormat.bold,horizontalAlignment)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 4, endRowIndex: 5, startColumnIndex: 0, endColumnIndex: 2 }, cell: { userEnteredFormat: { textFormat: { bold: true, fontSize: 11 } } }, fields: 'userEnteredFormat.textFormat' } },
    { repeatCell: { range: { sheetId, startRowIndex: 5, endRowIndex: 6, startColumnIndex: 0, endColumnIndex: 2 }, cell: { userEnteredFormat: { backgroundColor: { red: 0.118, green: 0.161, blue: 0.231 }, textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 }, fontSize: 10 }, verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat(backgroundColor,textFormat,verticalAlignment)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 6, endRowIndex: 13, startColumnIndex: 1, endColumnIndex: 2 }, cell: { userEnteredFormat: { numberFormat: { type: 'CURRENCY', pattern: '"Rp "#,##0' }, horizontalAlignment: 'RIGHT' } }, fields: 'userEnteredFormat(numberFormat,horizontalAlignment)' } },
  ]
}

/**
 * Terapkan styling rapi, format mata uang, lebar kolom, dan zebra-banding ke spreadsheet.
 */
export async function formatSpreadsheet(
  refreshToken: string,
  spreadsheetId: string,
): Promise<void> {
  const auth = buildOAuth2Client(refreshToken)
  const sheetsClient = google.sheets({ version: 'v4', auth })

  try {
    const meta = await sheetsClient.spreadsheets.get({ spreadsheetId })
    const txSheet = meta.data.sheets?.find((s) => s.properties?.title === 'Transaksi')
    const summarySheet = meta.data.sheets?.find((s) => s.properties?.title === 'Ringkasan')

    const txSheetId = txSheet?.properties?.sheetId ?? 0
    const summarySheetId = summarySheet?.properties?.sheetId ?? 1

    const existingBanding = txSheet?.bandedRanges ?? []
    const deleteBandingRequests = existingBanding.map((b) => ({
      deleteBanding: { bandedRangeId: b.bandedRangeId },
    }))

    const requests = [
      ...deleteBandingRequests,
      ...buildTransactionSheetRequests(txSheetId),
      ...buildSummarySheetRequests(summarySheetId),
    ]

    await sheetsClient.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests },
    })
  } catch (err) {
    throw logGoogleError('format spreadsheet', err)
  }
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

