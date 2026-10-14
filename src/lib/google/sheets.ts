import { google } from 'googleapis'

import { buildOAuth2Client } from './auth'

export type SheetStep =
  | 'create spreadsheet'
  | 'update header'
  | 'tulis rumus Ringkasan'
  | 'format spreadsheet'
  | 'tulis baris Transaksi'

// Standard headers for Transaksi sheet
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

/**
 * Ringkasan Sheet rows:
 * Using semicolons (;) for formula argument separators to ensure 100% compatibility
 * with Indonesian regional locale settings in Google Sheets.
 */
const SUMMARY_FORMULA_ROWS: string[][] = [
  // Row 1: Header Banner
  ['📊 Finance Tracker — Dashboard & Rekapitulasi', '', '', '', '', '', '', ''],
  // Row 2: Spacer
  [''],
  // Row 3: Section 1 Header (Interactive Filters)
  ['🎯 Filter Tanggal Tertentu', '', '', '', '📅 Filter Rentang Tanggal', '', '', ''],
  // Row 4: Inputs (B4: Specific date, F4: Start date, H4: End date)
  ['Tanggal:', '2026-10-13', '', '', 'Dari Tanggal:', '2026-10-01', 'Sampai:', '2026-10-31'],
  // Row 5: Quick Filter KPI Cards
  [
    'Total:',
    '=IF(ISBLANK(B4); 0; SUMIFS(Transaksi!E:E; Transaksi!A:A; B4))',
    '=IF(ISBLANK(B4); 0; COUNTIFS(Transaksi!A:A; B4)) & " transaksi"',
    '',
    'Total Rentang:',
    '=IF(OR(ISBLANK(F4); ISBLANK(H4)); 0; SUMIFS(Transaksi!E:E; Transaksi!A:A; ">="&F4; Transaksi!A:A; "<="&H4))',
    'Jumlah:',
    '=IF(OR(ISBLANK(F4); ISBLANK(H4)); 0; COUNTIFS(Transaksi!A:A; ">="&F4; Transaksi!A:A; "<="&H4)) & " transaksi"',
  ],
  // Row 6: Spacer
  [''],
  // Row 7: Section 2 Header (Current Month Overview)
  ['📊 Ringkasan Bulan Berjalan', '', '', '', '', '', '', ''],
  // Row 8: Month KPI Subheaders
  ['Bulan Ini', 'Total Pengeluaran', 'Jumlah Transaksi', '', 'Rata-rata / Hari', 'Tx Terbesar', '', ''],
  // Row 9: Month KPI Values
  [
    '=TEXT(TODAY(); "MMMM yyyy")',
    '=SUMIFS(Transaksi!E:E; Transaksi!A:A; ">="&DATE(YEAR(TODAY());MONTH(TODAY());1); Transaksi!A:A; "<="&EOMONTH(TODAY();0))',
    '=COUNTIFS(Transaksi!A:A; ">="&DATE(YEAR(TODAY());MONTH(TODAY());1); Transaksi!A:A; "<="&EOMONTH(TODAY();0))',
    '',
    '=IF(OR(ISBLANK(B9); B9=0); 0; ROUND(B9/DAY(TODAY())))',
    '=IF(C9=0; 0; MAXIFS(Transaksi!E:E; Transaksi!A:A; ">="&DATE(YEAR(TODAY());MONTH(TODAY());1); Transaksi!A:A; "<="&EOMONTH(TODAY();0)))',
    '',
    '',
  ],
  // Row 10: Spacer
  [''],
  // Row 11: Section 3 Header (Category breakdown: Month vs Range)
  ['📂 Rincian Kategori Bulan Ini', '', '', '', '🔍 Rincian Kategori pada Rentang Filter', '', '', ''],
  // Row 12: Category Table Headers
  ['Kategori', 'Total Bulan Ini', '% Porsi', '', 'Kategori', 'Total di Rentang', 'Jumlah Tx', '% Porsi'],
  // Row 13: Makanan & Minuman
  [
    'Makanan & Minuman',
    '=SUMIFS(Transaksi!E:E; Transaksi!D:D; A13; Transaksi!A:A; ">="&DATE(YEAR(TODAY());MONTH(TODAY());1); Transaksi!A:A; "<="&EOMONTH(TODAY();0))',
    '=IF(OR(ISBLANK(B$9); B$9=0); 0; B13/B$9)',
    '',
    'Makanan & Minuman',
    '=IF(OR(ISBLANK(F$4); ISBLANK(H$4)); 0; SUMIFS(Transaksi!E:E; Transaksi!D:D; E13; Transaksi!A:A; ">="&F$4; Transaksi!A:A; "<="&H$4))',
    '=IF(OR(ISBLANK(F$4); ISBLANK(H$4)); 0; COUNTIFS(Transaksi!D:D; E13; Transaksi!A:A; ">="&F$4; Transaksi!A:A; "<="&H$4))',
    '=IF(OR(ISBLANK(F$5); F$5=0); 0; F13/F$5)',
  ],
  // Row 14: Transportasi
  [
    'Transportasi',
    '=SUMIFS(Transaksi!E:E; Transaksi!D:D; A14; Transaksi!A:A; ">="&DATE(YEAR(TODAY());MONTH(TODAY());1); Transaksi!A:A; "<="&EOMONTH(TODAY();0))',
    '=IF(OR(ISBLANK(B$9); B$9=0); 0; B14/B$9)',
    '',
    'Transportasi',
    '=IF(OR(ISBLANK(F$4); ISBLANK(H$4)); 0; SUMIFS(Transaksi!E:E; Transaksi!D:D; E14; Transaksi!A:A; ">="&F$4; Transaksi!A:A; "<="&H$4))',
    '=IF(OR(ISBLANK(F$4); ISBLANK(H$4)); 0; COUNTIFS(Transaksi!D:D; E14; Transaksi!A:A; ">="&F$4; Transaksi!A:A; "<="&H$4))',
    '=IF(OR(ISBLANK(F$5); F$5=0); 0; F14/F$5)',
  ],
  // Row 15: Belanja
  [
    'Belanja',
    '=SUMIFS(Transaksi!E:E; Transaksi!D:D; A15; Transaksi!A:A; ">="&DATE(YEAR(TODAY());MONTH(TODAY());1); Transaksi!A:A; "<="&EOMONTH(TODAY();0))',
    '=IF(OR(ISBLANK(B$9); B$9=0); 0; B15/B$9)',
    '',
    'Belanja',
    '=IF(OR(ISBLANK(F$4); ISBLANK(H$4)); 0; SUMIFS(Transaksi!E:E; Transaksi!D:D; E15; Transaksi!A:A; ">="&F$4; Transaksi!A:A; "<="&H$4))',
    '=IF(OR(ISBLANK(F$4); ISBLANK(H$4)); 0; COUNTIFS(Transaksi!D:D; E15; Transaksi!A:A; ">="&F$4; Transaksi!A:A; "<="&H$4))',
    '=IF(OR(ISBLANK(F$5); F$5=0); 0; F15/F$5)',
  ],
  // Row 16: Tagihan & Utilitas
  [
    'Tagihan & Utilitas',
    '=SUMIFS(Transaksi!E:E; Transaksi!D:D; A16; Transaksi!A:A; ">="&DATE(YEAR(TODAY());MONTH(TODAY());1); Transaksi!A:A; "<="&EOMONTH(TODAY();0))',
    '=IF(OR(ISBLANK(B$9); B$9=0); 0; B16/B$9)',
    '',
    'Tagihan & Utilitas',
    '=IF(OR(ISBLANK(F$4); ISBLANK(H$4)); 0; SUMIFS(Transaksi!E:E; Transaksi!D:D; E16; Transaksi!A:A; ">="&F$4; Transaksi!A:A; "<="&H$4))',
    '=IF(OR(ISBLANK(F$4); ISBLANK(H$4)); 0; COUNTIFS(Transaksi!D:D; E16; Transaksi!A:A; ">="&F$4; Transaksi!A:A; "<="&H$4))',
    '=IF(OR(ISBLANK(F$5); F$5=0); 0; F16/F$5)',
  ],
  // Row 17: Hiburan
  [
    'Hiburan',
    '=SUMIFS(Transaksi!E:E; Transaksi!D:D; A17; Transaksi!A:A; ">="&DATE(YEAR(TODAY());MONTH(TODAY());1); Transaksi!A:A; "<="&EOMONTH(TODAY();0))',
    '=IF(OR(ISBLANK(B$9); B$9=0); 0; B17/B$9)',
    '',
    'Hiburan',
    '=IF(OR(ISBLANK(F$4); ISBLANK(H$4)); 0; SUMIFS(Transaksi!E:E; Transaksi!D:D; E17; Transaksi!A:A; ">="&F$4; Transaksi!A:A; "<="&H$4))',
    '=IF(OR(ISBLANK(F$4); ISBLANK(H$4)); 0; COUNTIFS(Transaksi!D:D; E17; Transaksi!A:A; ">="&F$4; Transaksi!A:A; "<="&H$4))',
    '=IF(OR(ISBLANK(F$5); F$5=0); 0; F17/F$5)',
  ],
  // Row 18: Kesehatan
  [
    'Kesehatan',
    '=SUMIFS(Transaksi!E:E; Transaksi!D:D; A18; Transaksi!A:A; ">="&DATE(YEAR(TODAY());MONTH(TODAY());1); Transaksi!A:A; "<="&EOMONTH(TODAY();0))',
    '=IF(OR(ISBLANK(B$9); B$9=0); 0; B18/B$9)',
    '',
    'Kesehatan',
    '=IF(OR(ISBLANK(F$4); ISBLANK(H$4)); 0; SUMIFS(Transaksi!E:E; Transaksi!D:D; E18; Transaksi!A:A; ">="&F$4; Transaksi!A:A; "<="&H$4))',
    '=IF(OR(ISBLANK(F$4); ISBLANK(H$4)); 0; COUNTIFS(Transaksi!D:D; E18; Transaksi!A:A; ">="&F$4; Transaksi!A:A; "<="&H$4))',
    '=IF(OR(ISBLANK(F$5); F$5=0); 0; F18/F$5)',
  ],
  // Row 19: Lainnya
  [
    'Lainnya',
    '=SUMIFS(Transaksi!E:E; Transaksi!D:D; A19; Transaksi!A:A; ">="&DATE(YEAR(TODAY());MONTH(TODAY());1); Transaksi!A:A; "<="&EOMONTH(TODAY();0))',
    '=IF(OR(ISBLANK(B$9); B$9=0); 0; B19/B$9)',
    '',
    'Lainnya',
    '=IF(OR(ISBLANK(F$4); ISBLANK(H$4)); 0; SUMIFS(Transaksi!E:E; Transaksi!D:D; E19; Transaksi!A:A; ">="&F$4; Transaksi!A:A; "<="&H$4))',
    '=IF(OR(ISBLANK(F$4); ISBLANK(H$4)); 0; COUNTIFS(Transaksi!D:D; E19; Transaksi!A:A; ">="&F$4; Transaksi!A:A; "<="&H$4))',
    '=IF(OR(ISBLANK(F$5); F$5=0); 0; F19/F$5)',
  ],
  // Row 20: TOTAL Row
  [
    'TOTAL',
    '=SUM(B13:B19)',
    '=IF(B9=0; 0; 1)',
    '',
    'TOTAL',
    '=SUM(F13:F19)',
    '=SUM(G13:G19)',
    '=IF(F5=0; 0; 1)',
  ],
  // Row 21: Spacer
  [''],
  // Row 22: Tips Header
  ['💡 Panduan Penggunaan Spreadsheet Finance Tracker', '', '', '', '', '', '', ''],
  // Row 23-27: Tips Content
  ['1. Sheet Transaksi: Setiap pengeluaran dicatat otomatis lengkap dengan tanggal, merchant, kategori, dan nominal.'],
  ['2. Filter Bawaan: Klik ikon corong di header Transaksi untuk memfilter atau mengurutkan data kapan saja.'],
  ['3. Filter Tanggal Tertentu: Ubah cell B4 (format YYYY-MM-DD) untuk melihat total pengeluaran dan jumlah transaksi pada hari itu.'],
  ['4. Filter Rentang Tanggal: Isi cell F4 (Dari) dan H4 (Sampai) untuk melihat rekapitulasi pengeluaran di rentang tanggal tersebut.'],
  ['5. Otomatis & Real-time: Seluruh dashboard ini terhubung langsung secara dinamis tanpa perlu diedit manual.'],
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

  console.error(
    `[Google Sheets] Gagal pada "${step}": HTTP ${httpStatus}, kode: ${googleCode}, pesan: ${message}`,
  )

  return new GoogleApiError(message, httpStatus, googleCode, action, step)
}

/**
 * Buat spreadsheet untuk user jika belum ada (idempoten berdasarkan sheetId).
 */
export async function ensureSpreadsheet(
  refreshToken: string,
  existingSheetId: string | null,
): Promise<string> {
  if (existingSheetId) return existingSheetId

  const auth = buildOAuth2Client(refreshToken)
  const sheetsClient = google.sheets({ version: 'v4', auth })

  let spreadsheetId: string

  try {
    const response = await sheetsClient.spreadsheets.create({
      requestBody: {
        properties: {
          title: 'Finance Tracker — Transaksi',
          locale: 'in_ID',
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
    await formatSpreadsheet(refreshToken, spreadsheetId)
  } catch (err) {
    throw logGoogleError('format spreadsheet', err)
  }

  return spreadsheetId
}

// ── Formatting Palette ───────────────────────────────────────────────────────
const NAVY = { red: 0.059, green: 0.090, blue: 0.165 }
const NAVY_LIGHT = { red: 0.118, green: 0.161, blue: 0.231 }
const WHITE = { red: 1, green: 1, blue: 1 }
const GRAY_BG = { red: 0.973, green: 0.980, blue: 0.988 }
const GREEN_ACCENT = { red: 0.02, green: 0.59, blue: 0.41 }
const MUTED = { red: 0.39, green: 0.45, blue: 0.55 }
const AMBER_BG = { red: 0.996, green: 0.953, blue: 0.780 }
const AMBER_TEXT = { red: 0.471, green: 0.208, blue: 0.059 }
const SECTION_BG = { red: 0.886, green: 0.910, blue: 0.941 }
const CARD_BG = { red: 0.945, green: 0.961, blue: 0.976 }

function buildTransactionSheetRequests(sheetId: number, rowCount: number) {
  const columnWidths = [115, 85, 220, 160, 150, 140, 240, 100, 120]

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
        properties: { pixelSize: 40 },
        fields: 'pixelSize',
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: 'ROWS', startIndex: 1, endIndex: rowCount },
        properties: { pixelSize: 32 },
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
    // Header
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 9 },
        cell: {
          userEnteredFormat: {
            backgroundColor: NAVY,
            textFormat: { bold: true, foregroundColor: WHITE, fontSize: 10, fontFamily: 'Google Sans' },
            verticalAlignment: 'MIDDLE',
            horizontalAlignment: 'LEFT',
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,verticalAlignment,horizontalAlignment)',
      },
    },
    { repeatCell: { range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 2 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER' } }, fields: 'userEnteredFormat.horizontalAlignment' } },
    { repeatCell: { range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 4, endColumnIndex: 5 }, cell: { userEnteredFormat: { horizontalAlignment: 'RIGHT' } }, fields: 'userEnteredFormat.horizontalAlignment' } },
    { repeatCell: { range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 7, endColumnIndex: 8 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER' } }, fields: 'userEnteredFormat.horizontalAlignment' } },
    // Data columns
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 0, endColumnIndex: 1 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', numberFormat: { type: 'DATE', pattern: 'yyyy-mm-dd' }, textFormat: { fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,numberFormat,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 1, endColumnIndex: 2 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', numberFormat: { type: 'TIME', pattern: 'hh:mm' }, textFormat: { fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,numberFormat,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 2, endColumnIndex: 3 }, cell: { userEnteredFormat: { horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE', textFormat: { bold: true, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 3, endColumnIndex: 4 }, cell: { userEnteredFormat: { horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE', textFormat: { fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 4, endColumnIndex: 5 }, cell: { userEnteredFormat: { horizontalAlignment: 'RIGHT', verticalAlignment: 'MIDDLE', textFormat: { bold: true, foregroundColor: GREEN_ACCENT, fontFamily: 'Google Sans' }, numberFormat: { type: 'CURRENCY', pattern: '"Rp "#,##0' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat,numberFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 5, endColumnIndex: 7 }, cell: { userEnteredFormat: { horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE', textFormat: { fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 7, endColumnIndex: 8 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', textFormat: { fontSize: 9, foregroundColor: MUTED, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 8, endColumnIndex: 9 }, cell: { userEnteredFormat: { horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE', textFormat: { fontSize: 8, foregroundColor: MUTED, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)' } },
    // Zebra Banding
    { addBanding: { bandedRange: { range: { sheetId, startRowIndex: 0, endRowIndex: rowCount, startColumnIndex: 0, endColumnIndex: 9 }, rowProperties: { headerColor: NAVY, firstBandColor: WHITE, secondBandColor: GRAY_BG } } } },
    // Filter
    { setBasicFilter: { filter: { range: { sheetId, startRowIndex: 0, endRowIndex: rowCount, startColumnIndex: 0, endColumnIndex: 9 } } } },
  ]
}

function buildSummarySheetRequests(sheetId: number) {
  const columnWidths = [190, 165, 120, 30, 180, 165, 110, 110]

  return [
    ...columnWidths.map((pixelSize, idx) => ({
      updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: idx, endIndex: idx + 1 }, properties: { pixelSize }, fields: 'pixelSize' },
    })),
    // Row 1 Title Banner
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 }, properties: { pixelSize: 44 }, fields: 'pixelSize' } },
    { repeatCell: { range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 8 }, cell: { userEnteredFormat: { backgroundColor: NAVY, textFormat: { bold: true, foregroundColor: WHITE, fontSize: 13, fontFamily: 'Google Sans' }, verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat(backgroundColor,textFormat,verticalAlignment)' } },

    // Row 3 Section Headers
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 2, endIndex: 3 }, properties: { pixelSize: 32 }, fields: 'pixelSize' } },
    { repeatCell: { range: { sheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 0, endColumnIndex: 3 }, cell: { userEnteredFormat: { backgroundColor: NAVY_LIGHT, textFormat: { bold: true, foregroundColor: WHITE, fontSize: 10, fontFamily: 'Google Sans' }, verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat(backgroundColor,textFormat,verticalAlignment)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 4, endColumnIndex: 8 }, cell: { userEnteredFormat: { backgroundColor: NAVY_LIGHT, textFormat: { bold: true, foregroundColor: WHITE, fontSize: 10, fontFamily: 'Google Sans' }, verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat(backgroundColor,textFormat,verticalAlignment)' } },

    // Row 4 Filter Inputs
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 3, endIndex: 4 }, properties: { pixelSize: 34 }, fields: 'pixelSize' } },
    { repeatCell: { range: { sheetId, startRowIndex: 3, endRowIndex: 4, startColumnIndex: 0, endColumnIndex: 8 }, cell: { userEnteredFormat: { verticalAlignment: 'MIDDLE', textFormat: { fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(verticalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 3, endRowIndex: 4, startColumnIndex: 1, endColumnIndex: 2 }, cell: { userEnteredFormat: { backgroundColor: AMBER_BG, textFormat: { bold: true, foregroundColor: AMBER_TEXT, fontSize: 10, fontFamily: 'Google Sans' }, horizontalAlignment: 'CENTER', numberFormat: { type: 'DATE', pattern: 'yyyy-mm-dd' } } }, fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,numberFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 3, endRowIndex: 4, startColumnIndex: 5, endColumnIndex: 6 }, cell: { userEnteredFormat: { backgroundColor: AMBER_BG, textFormat: { bold: true, foregroundColor: AMBER_TEXT, fontSize: 10, fontFamily: 'Google Sans' }, horizontalAlignment: 'CENTER', numberFormat: { type: 'DATE', pattern: 'yyyy-mm-dd' } } }, fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,numberFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 3, endRowIndex: 4, startColumnIndex: 7, endColumnIndex: 8 }, cell: { userEnteredFormat: { backgroundColor: AMBER_BG, textFormat: { bold: true, foregroundColor: AMBER_TEXT, fontSize: 10, fontFamily: 'Google Sans' }, horizontalAlignment: 'CENTER', numberFormat: { type: 'DATE', pattern: 'yyyy-mm-dd' } } }, fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,numberFormat)' } },

    // Row 5 Filter Results
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 4, endIndex: 5 }, properties: { pixelSize: 32 }, fields: 'pixelSize' } },
    { repeatCell: { range: { sheetId, startRowIndex: 4, endRowIndex: 5, startColumnIndex: 0, endColumnIndex: 8 }, cell: { userEnteredFormat: { backgroundColor: CARD_BG, verticalAlignment: 'MIDDLE', textFormat: { fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(backgroundColor,verticalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 4, endRowIndex: 5, startColumnIndex: 1, endColumnIndex: 2 }, cell: { userEnteredFormat: { horizontalAlignment: 'RIGHT', textFormat: { bold: true, foregroundColor: GREEN_ACCENT, fontFamily: 'Google Sans' }, numberFormat: { type: 'CURRENCY', pattern: '"Rp "#,##0' } } }, fields: 'userEnteredFormat(horizontalAlignment,textFormat,numberFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 4, endRowIndex: 5, startColumnIndex: 2, endColumnIndex: 3 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', textFormat: { foregroundColor: MUTED, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 4, endRowIndex: 5, startColumnIndex: 5, endColumnIndex: 6 }, cell: { userEnteredFormat: { horizontalAlignment: 'RIGHT', textFormat: { bold: true, foregroundColor: GREEN_ACCENT, fontFamily: 'Google Sans' }, numberFormat: { type: 'CURRENCY', pattern: '"Rp "#,##0' } } }, fields: 'userEnteredFormat(horizontalAlignment,textFormat,numberFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 4, endRowIndex: 5, startColumnIndex: 7, endColumnIndex: 8 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', textFormat: { foregroundColor: MUTED, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,textFormat)' } },

    // Row 7 Month Section Header
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 6, endIndex: 7 }, properties: { pixelSize: 32 }, fields: 'pixelSize' } },
    { repeatCell: { range: { sheetId, startRowIndex: 6, endRowIndex: 7, startColumnIndex: 0, endColumnIndex: 6 }, cell: { userEnteredFormat: { backgroundColor: NAVY_LIGHT, textFormat: { bold: true, foregroundColor: WHITE, fontSize: 10, fontFamily: 'Google Sans' }, verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat(backgroundColor,textFormat,verticalAlignment)' } },

    // Row 8 Month Subheaders
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 7, endIndex: 8 }, properties: { pixelSize: 28 }, fields: 'pixelSize' } },
    { repeatCell: { range: { sheetId, startRowIndex: 7, endRowIndex: 8, startColumnIndex: 0, endColumnIndex: 6 }, cell: { userEnteredFormat: { backgroundColor: SECTION_BG, textFormat: { bold: true, fontSize: 9, fontFamily: 'Google Sans' }, verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat(backgroundColor,textFormat,verticalAlignment)' } },

    // Row 9 Month KPI Values
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 8, endIndex: 9 }, properties: { pixelSize: 36 }, fields: 'pixelSize' } },
    { repeatCell: { range: { sheetId, startRowIndex: 8, endRowIndex: 9, startColumnIndex: 0, endColumnIndex: 6 }, cell: { userEnteredFormat: { backgroundColor: CARD_BG, verticalAlignment: 'MIDDLE', textFormat: { fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(backgroundColor,verticalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 8, endRowIndex: 9, startColumnIndex: 0, endColumnIndex: 1 }, cell: { userEnteredFormat: { textFormat: { bold: true, fontSize: 11, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat.textFormat' } },
    { repeatCell: { range: { sheetId, startRowIndex: 8, endRowIndex: 9, startColumnIndex: 1, endColumnIndex: 2 }, cell: { userEnteredFormat: { horizontalAlignment: 'RIGHT', textFormat: { bold: true, fontSize: 13, foregroundColor: GREEN_ACCENT, fontFamily: 'Google Sans' }, numberFormat: { type: 'CURRENCY', pattern: '"Rp "#,##0' } } }, fields: 'userEnteredFormat(horizontalAlignment,textFormat,numberFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 8, endRowIndex: 9, startColumnIndex: 2, endColumnIndex: 3 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', textFormat: { bold: true, fontSize: 11, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 8, endRowIndex: 9, startColumnIndex: 4, endColumnIndex: 6 }, cell: { userEnteredFormat: { horizontalAlignment: 'RIGHT', textFormat: { bold: true, fontSize: 10, fontFamily: 'Google Sans' }, numberFormat: { type: 'CURRENCY', pattern: '"Rp "#,##0' } } }, fields: 'userEnteredFormat(horizontalAlignment,textFormat,numberFormat)' } },

    // Row 11 Category Section Headers
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 10, endIndex: 11 }, properties: { pixelSize: 32 }, fields: 'pixelSize' } },
    { repeatCell: { range: { sheetId, startRowIndex: 10, endRowIndex: 11, startColumnIndex: 0, endColumnIndex: 3 }, cell: { userEnteredFormat: { backgroundColor: NAVY_LIGHT, textFormat: { bold: true, foregroundColor: WHITE, fontSize: 10, fontFamily: 'Google Sans' }, verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat(backgroundColor,textFormat,verticalAlignment)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 10, endRowIndex: 11, startColumnIndex: 4, endColumnIndex: 8 }, cell: { userEnteredFormat: { backgroundColor: NAVY_LIGHT, textFormat: { bold: true, foregroundColor: WHITE, fontSize: 10, fontFamily: 'Google Sans' }, verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat(backgroundColor,textFormat,verticalAlignment)' } },

    // Row 12 Subheaders
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 11, endIndex: 12 }, properties: { pixelSize: 28 }, fields: 'pixelSize' } },
    { repeatCell: { range: { sheetId, startRowIndex: 11, endRowIndex: 12, startColumnIndex: 0, endColumnIndex: 3 }, cell: { userEnteredFormat: { backgroundColor: SECTION_BG, textFormat: { bold: true, fontSize: 9, fontFamily: 'Google Sans' }, verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat(backgroundColor,textFormat,verticalAlignment)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 11, endRowIndex: 12, startColumnIndex: 4, endColumnIndex: 8 }, cell: { userEnteredFormat: { backgroundColor: SECTION_BG, textFormat: { bold: true, fontSize: 9, fontFamily: 'Google Sans' }, verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat(backgroundColor,textFormat,verticalAlignment)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 11, endRowIndex: 12, startColumnIndex: 1, endColumnIndex: 2 }, cell: { userEnteredFormat: { horizontalAlignment: 'RIGHT' } }, fields: 'userEnteredFormat.horizontalAlignment' } },
    { repeatCell: { range: { sheetId, startRowIndex: 11, endRowIndex: 12, startColumnIndex: 2, endColumnIndex: 3 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER' } }, fields: 'userEnteredFormat.horizontalAlignment' } },
    { repeatCell: { range: { sheetId, startRowIndex: 11, endRowIndex: 12, startColumnIndex: 5, endColumnIndex: 6 }, cell: { userEnteredFormat: { horizontalAlignment: 'RIGHT' } }, fields: 'userEnteredFormat.horizontalAlignment' } },
    { repeatCell: { range: { sheetId, startRowIndex: 11, endRowIndex: 12, startColumnIndex: 6, endColumnIndex: 8 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER' } }, fields: 'userEnteredFormat.horizontalAlignment' } },

    // Rows 13-19 Category Rows
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 12, endIndex: 19 }, properties: { pixelSize: 28 }, fields: 'pixelSize' } },
    { repeatCell: { range: { sheetId, startRowIndex: 12, endRowIndex: 19, startColumnIndex: 0, endColumnIndex: 8 }, cell: { userEnteredFormat: { verticalAlignment: 'MIDDLE', textFormat: { fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(verticalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 12, endRowIndex: 19, startColumnIndex: 1, endColumnIndex: 2 }, cell: { userEnteredFormat: { horizontalAlignment: 'RIGHT', numberFormat: { type: 'CURRENCY', pattern: '"Rp "#,##0' } } }, fields: 'userEnteredFormat(horizontalAlignment,numberFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 12, endRowIndex: 19, startColumnIndex: 2, endColumnIndex: 3 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', numberFormat: { type: 'PERCENT', pattern: '0.0%' }, textFormat: { foregroundColor: MUTED, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,numberFormat,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 12, endRowIndex: 19, startColumnIndex: 5, endColumnIndex: 6 }, cell: { userEnteredFormat: { horizontalAlignment: 'RIGHT', numberFormat: { type: 'CURRENCY', pattern: '"Rp "#,##0' } } }, fields: 'userEnteredFormat(horizontalAlignment,numberFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 12, endRowIndex: 19, startColumnIndex: 6, endColumnIndex: 7 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER' } }, fields: 'userEnteredFormat.horizontalAlignment' } },
    { repeatCell: { range: { sheetId, startRowIndex: 12, endRowIndex: 19, startColumnIndex: 7, endColumnIndex: 8 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', numberFormat: { type: 'PERCENT', pattern: '0.0%' }, textFormat: { foregroundColor: MUTED, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,numberFormat,textFormat)' } },

    // Row 20 TOTAL row
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 19, endIndex: 20 }, properties: { pixelSize: 34 }, fields: 'pixelSize' } },
    { repeatCell: { range: { sheetId, startRowIndex: 19, endRowIndex: 20, startColumnIndex: 0, endColumnIndex: 3 }, cell: { userEnteredFormat: { backgroundColor: SECTION_BG, verticalAlignment: 'MIDDLE', textFormat: { bold: true, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(backgroundColor,verticalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 19, endRowIndex: 20, startColumnIndex: 4, endColumnIndex: 8 }, cell: { userEnteredFormat: { backgroundColor: SECTION_BG, verticalAlignment: 'MIDDLE', textFormat: { bold: true, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(backgroundColor,verticalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 19, endRowIndex: 20, startColumnIndex: 1, endColumnIndex: 2 }, cell: { userEnteredFormat: { horizontalAlignment: 'RIGHT', textFormat: { bold: true, foregroundColor: GREEN_ACCENT, fontSize: 11, fontFamily: 'Google Sans' }, numberFormat: { type: 'CURRENCY', pattern: '"Rp "#,##0' } } }, fields: 'userEnteredFormat(horizontalAlignment,textFormat,numberFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 19, endRowIndex: 20, startColumnIndex: 2, endColumnIndex: 3 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', numberFormat: { type: 'PERCENT', pattern: '0.0%' } } }, fields: 'userEnteredFormat(horizontalAlignment,numberFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 19, endRowIndex: 20, startColumnIndex: 5, endColumnIndex: 6 }, cell: { userEnteredFormat: { horizontalAlignment: 'RIGHT', textFormat: { bold: true, foregroundColor: GREEN_ACCENT, fontSize: 11, fontFamily: 'Google Sans' }, numberFormat: { type: 'CURRENCY', pattern: '"Rp "#,##0' } } }, fields: 'userEnteredFormat(horizontalAlignment,textFormat,numberFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 19, endRowIndex: 20, startColumnIndex: 6, endColumnIndex: 7 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER' } }, fields: 'userEnteredFormat.horizontalAlignment' } },
    { repeatCell: { range: { sheetId, startRowIndex: 19, endRowIndex: 20, startColumnIndex: 7, endColumnIndex: 8 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', numberFormat: { type: 'PERCENT', pattern: '0.0%' } } }, fields: 'userEnteredFormat(horizontalAlignment,numberFormat)' } },
  ]
}

/**
 * Terapkan styling rapi, format mata uang, lebar kolom, zebra-banding, dan AutoFilter.
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
    const txRowCount = txSheet?.properties?.gridProperties?.rowCount ?? 1000

    const existingBanding = txSheet?.bandedRanges ?? []
    const deleteBandingRequests = existingBanding.map((b) => ({
      deleteBanding: { bandedRangeId: b.bandedRangeId },
    }))

    const clearFilterRequests = txSheet?.basicFilter
      ? [{ clearBasicFilter: { sheetId: txSheetId } }]
      : []

    const requests = [
      ...deleteBandingRequests,
      ...clearFilterRequests,
      ...buildTransactionSheetRequests(txSheetId, txRowCount),
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
  source: string
  id: string
}

/**
 * Tulis satu baris transaksi ke sheet "Transaksi".
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

/**
 * Perbarui sheet Ringkasan pada spreadsheet yang sudah ada.
 * Panggil ini untuk memperbaiki rumus dan format di spreadsheet lama.
 */
export async function refreshSummarySheet(
  refreshToken: string,
  spreadsheetId: string,
): Promise<void> {
  const auth = buildOAuth2Client(refreshToken)
  const sheetsClient = google.sheets({ version: 'v4', auth })

  // Hapus isi lama agar tidak ada residu formula usang
  await sheetsClient.spreadsheets.values.clear({
    spreadsheetId,
    range: 'Ringkasan!A1:Z100',
  })

  // Tulis ulang rumus baru
  await sheetsClient.spreadsheets.values.update({
    spreadsheetId,
    range: 'Ringkasan!A1',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: SUMMARY_FORMULA_ROWS },
  })

  // Terapkan ulang format lengkap
  await formatSpreadsheet(refreshToken, spreadsheetId)
}
