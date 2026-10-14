import { buildOAuth2Client } from './auth'

async function getSheetsClient(auth: ReturnType<typeof buildOAuth2Client>) {
  const { google } = await import('googleapis')
  return google.sheets({ version: 'v4', auth })
}

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
  // Row 1: Header Banner (with dynamic transaction dates formula in Z1 for dropdown validation)
  [
    '📊 Finance Tracker — Dashboard & Rekapitulasi',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '=IFERROR(UNIQUE(SORT(FILTER(\'_data\'!A2:A; ISNUMBER(\'_data\'!A2:A)); 1; FALSE)); TODAY())',
  ],
  // Row 2: Spacer
  [''],
  // Row 3: Section 1 Header (Interactive Filters)
  ['🎯 Filter Tanggal Tertentu', '', '', '', '📅 Filter Rentang Tanggal', '', '', ''],
  // Row 4: Inputs (B4: Specific date, F4: Start date, H4: End date - all with transaction date dropdowns)
  [
    'Tanggal:',
    '=IFERROR(INDEX(Z:Z; 1); TODAY())',
    '',
    '',
    'Dari Tanggal:',
    '=IFERROR(INDEX(Z:Z; COUNTA(Z:Z)); TODAY())',
    'Sampai:',
    '=IFERROR(INDEX(Z:Z; 1); TODAY())',
  ],
  // Row 5: Quick Filter KPI Cards (resilient: handles missing date, reversed dates, or blank)
  [
    'Total:',
    '=SUMIFS(\'_data\'!E:E; \'_data\'!A:A; IF(ISBLANK(B4); TODAY(); B4))',
    '=COUNTIFS(\'_data\'!A:A; IF(ISBLANK(B4); TODAY(); B4)) & " transaksi"',
    '',
    'Total Rentang:',
    '=SUMIFS(\'_data\'!E:E; \'_data\'!A:A; ">="&IF(ISBLANK(F4); 0; IF(ISBLANK(H4); F4; MIN(F4; H4))); \'_data\'!A:A; "<="&IF(ISBLANK(H4); DATE(2099;12;31); IF(ISBLANK(F4); H4; MAX(F4; H4))))',
    'Jumlah:',
    '=COUNTIFS(\'_data\'!A:A; ">="&IF(ISBLANK(F4); 0; IF(ISBLANK(H4); F4; MIN(F4; H4))); \'_data\'!A:A; "<="&IF(ISBLANK(H4); DATE(2099;12;31); IF(ISBLANK(F4); H4; MAX(F4; H4)))) & " transaksi"',
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
    '=SUMIFS(\'_data\'!E:E; \'_data\'!A:A; ">="&DATE(YEAR(TODAY());MONTH(TODAY());1); \'_data\'!A:A; "<="&EOMONTH(TODAY();0))',
    '=COUNTIFS(\'_data\'!A:A; ">="&DATE(YEAR(TODAY());MONTH(TODAY());1); \'_data\'!A:A; "<="&EOMONTH(TODAY();0))',
    '',
    '=IF(OR(ISBLANK(B9); B9=0); 0; ROUND(B9/DAY(TODAY())))',
    '=IF(C9=0; 0; MAXIFS(\'_data\'!E:E; \'_data\'!A:A; ">="&DATE(YEAR(TODAY());MONTH(TODAY());1); \'_data\'!A:A; "<="&EOMONTH(TODAY();0)))',
    '',
    '',
  ],
  // Row 10: Spacer
  [''],
  // Row 11: Section 3 Header (Category breakdown: Dynamic date vs Dynamic range label)
  [
    '=IF(OR(ISBLANK(B4); B4=TODAY()); "📂 Rincian Kategori Hari Ini"; "📂 Rincian Kategori (" & TEXT(B4; "yyyy-mm-dd") & ")")',
    '',
    '',
    '',
    '=IF(AND(ISBLANK(F4); ISBLANK(H4)); "🔍 Rincian Kategori (Semua Rentang)"; IF(AND(NOT(ISBLANK(F4)); NOT(ISBLANK(H4))); "🔍 Rincian Kategori (" & TEXT(MIN(F4; H4); "yyyy-mm-dd") & " s/d " & TEXT(MAX(F4; H4); "yyyy-mm-dd") & ")"; IF(NOT(ISBLANK(F4)); "🔍 Rincian Kategori (Mulai " & TEXT(F4; "yyyy-mm-dd") & ")"; "🔍 Rincian Kategori (Hingga " & TEXT(H4; "yyyy-mm-dd") & ")")))',
    '',
    '',
    '',
  ],
  // Row 12: Category Table Headers
  ['Kategori', 'Total Tanggal Ini', '% Porsi', '', 'Kategori', 'Total di Rentang', 'Jumlah Tx', '% Porsi'],
  // Row 13: Makanan & Minuman
  [
    'Makanan & Minuman',
    '=SUMIFS(\'_data\'!E:E; \'_data\'!D:D; A13; \'_data\'!A:A; IF(ISBLANK(B$4); TODAY(); B$4))',
    '=IF(OR(ISBLANK(B$20); B$20=0); 0; B13/B$20)',
    '',
    'Makanan & Minuman',
    '=SUMIFS(\'_data\'!E:E; \'_data\'!D:D; E13; \'_data\'!A:A; ">="&IF(ISBLANK(F$4); 0; IF(ISBLANK(H$4); F$4; MIN(F$4; H$4))); \'_data\'!A:A; "<="&IF(ISBLANK(H$4); DATE(2099;12;31); IF(ISBLANK(F$4); H$4; MAX(F$4; H$4))))',
    '=COUNTIFS(\'_data\'!D:D; E13; \'_data\'!A:A; ">="&IF(ISBLANK(F$4); 0; IF(ISBLANK(H$4); F$4; MIN(F$4; H$4))); \'_data\'!A:A; "<="&IF(ISBLANK(H$4); DATE(2099;12;31); IF(ISBLANK(F$4); H$4; MAX(F$4; H$4))))',
    '=IF(OR(ISBLANK(F$20); F$20=0); 0; F13/F$20)',
  ],
  // Row 14: Transportasi
  [
    'Transportasi',
    '=SUMIFS(\'_data\'!E:E; \'_data\'!D:D; A14; \'_data\'!A:A; IF(ISBLANK(B$4); TODAY(); B$4))',
    '=IF(OR(ISBLANK(B$20); B$20=0); 0; B14/B$20)',
    '',
    'Transportasi',
    '=SUMIFS(\'_data\'!E:E; \'_data\'!D:D; E14; \'_data\'!A:A; ">="&IF(ISBLANK(F$4); 0; IF(ISBLANK(H$4); F$4; MIN(F$4; H$4))); \'_data\'!A:A; "<="&IF(ISBLANK(H$4); DATE(2099;12;31); IF(ISBLANK(F$4); H$4; MAX(F$4; H$4))))',
    '=COUNTIFS(\'_data\'!D:D; E14; \'_data\'!A:A; ">="&IF(ISBLANK(F$4); 0; IF(ISBLANK(H$4); F$4; MIN(F$4; H$4))); \'_data\'!A:A; "<="&IF(ISBLANK(H$4); DATE(2099;12;31); IF(ISBLANK(F$4); H$4; MAX(F$4; H$4))))',
    '=IF(OR(ISBLANK(F$20); F$20=0); 0; F14/F$20)',
  ],
  // Row 15: Belanja
  [
    'Belanja',
    '=SUMIFS(\'_data\'!E:E; \'_data\'!D:D; A15; \'_data\'!A:A; IF(ISBLANK(B$4); TODAY(); B$4))',
    '=IF(OR(ISBLANK(B$20); B$20=0); 0; B15/B$20)',
    '',
    'Belanja',
    '=SUMIFS(\'_data\'!E:E; \'_data\'!D:D; E15; \'_data\'!A:A; ">="&IF(ISBLANK(F$4); 0; IF(ISBLANK(H$4); F$4; MIN(F$4; H$4))); \'_data\'!A:A; "<="&IF(ISBLANK(H$4); DATE(2099;12;31); IF(ISBLANK(F$4); H$4; MAX(F$4; H$4))))',
    '=COUNTIFS(\'_data\'!D:D; E15; \'_data\'!A:A; ">="&IF(ISBLANK(F$4); 0; IF(ISBLANK(H$4); F$4; MIN(F$4; H$4))); \'_data\'!A:A; "<="&IF(ISBLANK(H$4); DATE(2099;12;31); IF(ISBLANK(F$4); H$4; MAX(F$4; H$4))))',
    '=IF(OR(ISBLANK(F$20); F$20=0); 0; F15/F$20)',
  ],
  // Row 16: Tagihan & Utilitas
  [
    'Tagihan & Utilitas',
    '=SUMIFS(\'_data\'!E:E; \'_data\'!D:D; A16; \'_data\'!A:A; IF(ISBLANK(B$4); TODAY(); B$4))',
    '=IF(OR(ISBLANK(B$20); B$20=0); 0; B16/B$20)',
    '',
    'Tagihan & Utilitas',
    '=SUMIFS(\'_data\'!E:E; \'_data\'!D:D; E16; \'_data\'!A:A; ">="&IF(ISBLANK(F$4); 0; IF(ISBLANK(H$4); F$4; MIN(F$4; H$4))); \'_data\'!A:A; "<="&IF(ISBLANK(H$4); DATE(2099;12;31); IF(ISBLANK(F$4); H$4; MAX(F$4; H$4))))',
    '=COUNTIFS(\'_data\'!D:D; E16; \'_data\'!A:A; ">="&IF(ISBLANK(F$4); 0; IF(ISBLANK(H$4); F$4; MIN(F$4; H$4))); \'_data\'!A:A; "<="&IF(ISBLANK(H$4); DATE(2099;12;31); IF(ISBLANK(F$4); H$4; MAX(F$4; H$4))))',
    '=IF(OR(ISBLANK(F$20); F$20=0); 0; F16/F$20)',
  ],
  // Row 17: Hiburan
  [
    'Hiburan',
    '=SUMIFS(\'_data\'!E:E; \'_data\'!D:D; A17; \'_data\'!A:A; IF(ISBLANK(B$4); TODAY(); B$4))',
    '=IF(OR(ISBLANK(B$20); B$20=0); 0; B17/B$20)',
    '',
    'Hiburan',
    '=SUMIFS(\'_data\'!E:E; \'_data\'!D:D; E17; \'_data\'!A:A; ">="&IF(ISBLANK(F$4); 0; IF(ISBLANK(H$4); F$4; MIN(F$4; H$4))); \'_data\'!A:A; "<="&IF(ISBLANK(H$4); DATE(2099;12;31); IF(ISBLANK(F$4); H$4; MAX(F$4; H$4))))',
    '=COUNTIFS(\'_data\'!D:D; E17; \'_data\'!A:A; ">="&IF(ISBLANK(F$4); 0; IF(ISBLANK(H$4); F$4; MIN(F$4; H$4))); \'_data\'!A:A; "<="&IF(ISBLANK(H$4); DATE(2099;12;31); IF(ISBLANK(F$4); H$4; MAX(F$4; H$4))))',
    '=IF(OR(ISBLANK(F$20); F$20=0); 0; F17/F$20)',
  ],
  // Row 18: Kesehatan
  [
    'Kesehatan',
    '=SUMIFS(\'_data\'!E:E; \'_data\'!D:D; A18; \'_data\'!A:A; IF(ISBLANK(B$4); TODAY(); B$4))',
    '=IF(OR(ISBLANK(B$20); B$20=0); 0; B18/B$20)',
    '',
    'Kesehatan',
    '=SUMIFS(\'_data\'!E:E; \'_data\'!D:D; E18; \'_data\'!A:A; ">="&IF(ISBLANK(F$4); 0; IF(ISBLANK(H$4); F$4; MIN(F$4; H$4))); \'_data\'!A:A; "<="&IF(ISBLANK(H$4); DATE(2099;12;31); IF(ISBLANK(F$4); H$4; MAX(F$4; H$4))))',
    '=COUNTIFS(\'_data\'!D:D; E18; \'_data\'!A:A; ">="&IF(ISBLANK(F$4); 0; IF(ISBLANK(H$4); F$4; MIN(F$4; H$4))); \'_data\'!A:A; "<="&IF(ISBLANK(H$4); DATE(2099;12;31); IF(ISBLANK(F$4); H$4; MAX(F$4; H$4))))',
    '=IF(OR(ISBLANK(F$20); F$20=0); 0; F18/F$20)',
  ],
  // Row 19: Lainnya
  [
    'Lainnya',
    '=SUMIFS(\'_data\'!E:E; \'_data\'!D:D; A19; \'_data\'!A:A; IF(ISBLANK(B$4); TODAY(); B$4))',
    '=IF(OR(ISBLANK(B$20); B$20=0); 0; B19/B$20)',
    '',
    'Lainnya',
    '=SUMIFS(\'_data\'!E:E; \'_data\'!D:D; E19; \'_data\'!A:A; ">="&IF(ISBLANK(F$4); 0; IF(ISBLANK(H$4); F$4; MIN(F$4; H$4))); \'_data\'!A:A; "<="&IF(ISBLANK(H$4); DATE(2099;12;31); IF(ISBLANK(F$4); H$4; MAX(F$4; H$4))))',
    '=COUNTIFS(\'_data\'!D:D; E19; \'_data\'!A:A; ">="&IF(ISBLANK(F$4); 0; IF(ISBLANK(H$4); F$4; MIN(F$4; H$4))); \'_data\'!A:A; "<="&IF(ISBLANK(H$4); DATE(2099;12;31); IF(ISBLANK(F$4); H$4; MAX(F$4; H$4))))',
    '=IF(OR(ISBLANK(F$20); F$20=0); 0; F19/F$20)',
  ],
  // Row 20: TOTAL Row
  [
    'TOTAL',
    '=SUM(B13:B19)',
    '=IF(B20=0; 0; 1)',
    '',
    'TOTAL',
    '=SUM(F13:F19)',
    '=SUM(G13:G19)',
    '=IF(F20=0; 0; 1)',
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
  const sheetsClient = await getSheetsClient(auth)

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
            properties: {
              title: 'Transaksi',
              index: 0,
              gridProperties: { rowCount: 1000, columnCount: 26, frozenRowCount: 4 },
              tabColorStyle: { rgbColor: NAVY },
            },
          },
          {
            properties: {
              title: '_data',
              index: 1,
              hidden: true,
              gridProperties: { rowCount: 1000, columnCount: 26, frozenRowCount: 1 },
            },
          },
          {
            properties: {
              title: 'Ringkasan',
              index: 2,
              gridProperties: { rowCount: 1000, columnCount: 26 },
            },
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
      range: '_data!A1:I1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [TRANSACTION_HEADERS] },
    })

    await sheetsClient.spreadsheets.values.update({
      spreadsheetId,
      range: '_data!K1:K2',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          ['Semua Tanggal'],
          [
            '=IF(OR(Transaksi!B2="Semua Bulan"; ISBLANK(Transaksi!B2)); IFERROR(UNIQUE(SORT(FILTER(A2:A; ISNUMBER(A2:A)); 1; TRUE)); ""); SEQUENCE(DAY(EOMONTH(Transaksi!B2; 0)); 1; DATE(YEAR(Transaksi!B2); MONTH(Transaksi!B2); 1); 1))',
          ],
        ],
      },
    })

    await sheetsClient.spreadsheets.values.update({
      spreadsheetId,
      range: 'Transaksi!A1:I5',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          ['💸 TRANSAKSI & PENGELUARAN', '', '', '', '', '', '', '', ''],
          ['🗓️ Bulan:', '=DATE(YEAR(TODAY()); MONTH(TODAY()); 1)', '', '📅 Tanggal:', 'Semua Tanggal', '', '🏷️ Kategori:', 'Semua Kategori', ''],
          ['Total Filter:', '=IFERROR(SUM(F5:F); 0)', '', 'Jumlah Tx:', '=IFERROR(COUNTA(D5:D); 0) & " Transaksi"', '', 'Rata-rata/Tx:', '=IFERROR(AVERAGE(F5:F); 0)', ''],
          ['Hari', 'Tanggal', 'Waktu', 'Merchant', 'Kategori', 'Nominal', 'Metode Bayar', 'Catatan', 'Sumber'],
          [
            '=IFERROR(QUERY(HSTACK(\'_data\'!A2:A; \'_data\'!A2:I); "SELECT Col1, Col2, Col3, Col4, Col5, Col6, Col7, Col8, Col9 WHERE Col2 IS NOT NULL" & IF(OR(B2="Semua Bulan"; ISBLANK(B2); B2=""); ""; " AND Col2 >= date \'" & TEXT(B2; "yyyy-mm-01") & "\' AND Col2 <= date \'" & TEXT(EOMONTH(B2; 0); "yyyy-mm-dd") & "\'") & IF(OR(E2="Semua Tanggal"; ISBLANK(E2); E2=""); ""; " AND Col2 = date \'" & TEXT(E2; "yyyy-mm-dd") & "\'") & IF(OR(H2="Semua Kategori"; ISBLANK(H2); H2=""); ""; " AND Col5 = \'" & H2 & "\'") & " ORDER BY Col2 ASC, Col3 ASC"; 0); "Tidak ada transaksi pada filter ini")',
          ],
        ],
      },
    })

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
const DARK_TEXT = { red: 0.118, green: 0.161, blue: 0.231 }
const WHITE = { red: 1, green: 1, blue: 1 }
const GRAY_BG = { red: 0.973, green: 0.980, blue: 0.988 }
const GREEN_ACCENT = { red: 0.02, green: 0.59, blue: 0.41 }
const MUTED = { red: 0.39, green: 0.45, blue: 0.55 }
const AMBER_BG = { red: 0.996, green: 0.953, blue: 0.780 }
const AMBER_TEXT = { red: 0.471, green: 0.208, blue: 0.059 }
const SECTION_BG = { red: 0.886, green: 0.910, blue: 0.941 }
const CARD_BG = { red: 0.945, green: 0.961, blue: 0.976 }

const MONTH_OPTIONS = [
  'Semua Bulan',
  'Januari 2025', 'Februari 2025', 'Maret 2025', 'April 2025', 'Mei 2025', 'Juni 2025',
  'Juli 2025', 'Agustus 2025', 'September 2025', 'Oktober 2025', 'November 2025', 'Desember 2025',
  'Januari 2026', 'Februari 2026', 'Maret 2026', 'April 2026', 'Mei 2026', 'Juni 2026',
  'Juli 2026', 'Agustus 2026', 'September 2026', 'Oktober 2026', 'November 2026', 'Desember 2026',
  'Januari 2027', 'Februari 2027', 'Maret 2027', 'April 2027', 'Mei 2027', 'Juni 2027',
  'Juli 2027', 'Agustus 2027', 'September 2027', 'Oktober 2027', 'November 2027', 'Desember 2027',
]

const CATEGORY_OPTIONS = [
  'Semua Kategori',
  'Makanan & Minuman',
  'Transportasi',
  'Belanja',
  'Tagihan',
  'Tagihan & Utilitas',
  'Hiburan',
  'Kesehatan',
  'Lainnya',
]

function buildInteractiveTransactionSheetRequests(sheetId: number, rowCount: number) {
  const columnWidths = [95, 105, 70, 247, 160, 121, 150, 228, 100]

  return [
    {
      updateSheetProperties: {
        properties: {
          sheetId,
          gridProperties: { frozenRowCount: 4, columnCount: 26 },
          tabColorStyle: { rgbColor: NAVY },
        },
        fields: 'gridProperties.frozenRowCount,gridProperties.columnCount,tabColorStyle',
      },
    },
    // Row Heights
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 }, properties: { pixelSize: 42 }, fields: 'pixelSize' } },
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 1, endIndex: 2 }, properties: { pixelSize: 38 }, fields: 'pixelSize' } },
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 2, endIndex: 3 }, properties: { pixelSize: 34 }, fields: 'pixelSize' } },
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 3, endIndex: 4 }, properties: { pixelSize: 36 }, fields: 'pixelSize' } },
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 4, endIndex: rowCount }, properties: { pixelSize: 30 }, fields: 'pixelSize' } },
    // Column Widths
    ...columnWidths.map((pixelSize, idx) => ({
      updateDimensionProperties: {
        range: { sheetId, dimension: 'COLUMNS', startIndex: idx, endIndex: idx + 1 },
        properties: { pixelSize },
        fields: 'pixelSize',
      },
    })),
    // Merges
    { mergeCells: { range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 9 }, mergeType: 'MERGE_ALL' } },
    { mergeCells: { range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 1, endColumnIndex: 3 }, mergeType: 'MERGE_ALL' } },
    { mergeCells: { range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 4, endColumnIndex: 6 }, mergeType: 'MERGE_ALL' } },
    { mergeCells: { range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 7, endColumnIndex: 9 }, mergeType: 'MERGE_ALL' } },
    { mergeCells: { range: { sheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 1, endColumnIndex: 3 }, mergeType: 'MERGE_ALL' } },
    { mergeCells: { range: { sheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 4, endColumnIndex: 6 }, mergeType: 'MERGE_ALL' } },
    { mergeCells: { range: { sheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 7, endColumnIndex: 9 }, mergeType: 'MERGE_ALL' } },
    // Row 1: Title Banner
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 9 },
        cell: {
          userEnteredFormat: {
            backgroundColor: NAVY,
            textFormat: { bold: true, foregroundColor: WHITE, fontSize: 11, fontFamily: 'Google Sans' },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
      },
    },
    // Row 2: Filter Labels
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 0, endColumnIndex: 1 }, cell: { userEnteredFormat: { backgroundColor: NAVY_LIGHT, textFormat: { bold: true, foregroundColor: WHITE, fontSize: 10, fontFamily: 'Google Sans' }, horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 3, endColumnIndex: 4 }, cell: { userEnteredFormat: { backgroundColor: NAVY_LIGHT, textFormat: { bold: true, foregroundColor: WHITE, fontSize: 10, fontFamily: 'Google Sans' }, horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 6, endColumnIndex: 7 }, cell: { userEnteredFormat: { backgroundColor: NAVY_LIGHT, textFormat: { bold: true, foregroundColor: WHITE, fontSize: 10, fontFamily: 'Google Sans' }, horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)' } },
    // Row 2: Filter Inputs (Amber bg, centered)
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 1, endColumnIndex: 3 }, cell: { userEnteredFormat: { backgroundColor: AMBER_BG, textFormat: { bold: true, foregroundColor: AMBER_TEXT, fontSize: 10, fontFamily: 'Google Sans' }, horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', numberFormat: { type: 'DATE', pattern: 'MMMM yyyy' } } }, fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,numberFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 4, endColumnIndex: 6 }, cell: { userEnteredFormat: { backgroundColor: AMBER_BG, textFormat: { bold: true, foregroundColor: AMBER_TEXT, fontSize: 10, fontFamily: 'Google Sans' }, horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 7, endColumnIndex: 9 }, cell: { userEnteredFormat: { backgroundColor: AMBER_BG, textFormat: { bold: true, foregroundColor: AMBER_TEXT, fontSize: 10, fontFamily: 'Google Sans' }, horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)' } },
    // Row 3: KPI Cards Background
    { repeatCell: { range: { sheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 0, endColumnIndex: 9 }, cell: { userEnteredFormat: { backgroundColor: CARD_BG, verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat(backgroundColor,verticalAlignment)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 0, endColumnIndex: 1 }, cell: { userEnteredFormat: { textFormat: { foregroundColor: MUTED, fontSize: 10, fontFamily: 'Google Sans' }, horizontalAlignment: 'CENTER' } }, fields: 'userEnteredFormat(textFormat,horizontalAlignment)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 3, endColumnIndex: 4 }, cell: { userEnteredFormat: { textFormat: { foregroundColor: MUTED, fontSize: 10, fontFamily: 'Google Sans' }, horizontalAlignment: 'CENTER' } }, fields: 'userEnteredFormat(textFormat,horizontalAlignment)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 6, endColumnIndex: 7 }, cell: { userEnteredFormat: { textFormat: { foregroundColor: MUTED, fontSize: 10, fontFamily: 'Google Sans' }, horizontalAlignment: 'CENTER' } }, fields: 'userEnteredFormat(textFormat,horizontalAlignment)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 1, endColumnIndex: 3 }, cell: { userEnteredFormat: { textFormat: { bold: true, foregroundColor: GREEN_ACCENT, fontSize: 11, fontFamily: 'Google Sans' }, horizontalAlignment: 'RIGHT', numberFormat: { type: 'CURRENCY', pattern: '"Rp "#,##0' } } }, fields: 'userEnteredFormat(textFormat,horizontalAlignment,numberFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 4, endColumnIndex: 6 }, cell: { userEnteredFormat: { textFormat: { bold: true, foregroundColor: DARK_TEXT, fontSize: 10, fontFamily: 'Google Sans' }, horizontalAlignment: 'CENTER' } }, fields: 'userEnteredFormat(textFormat,horizontalAlignment)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 7, endColumnIndex: 9 }, cell: { userEnteredFormat: { textFormat: { bold: true, foregroundColor: GREEN_ACCENT, fontSize: 11, fontFamily: 'Google Sans' }, horizontalAlignment: 'RIGHT', numberFormat: { type: 'CURRENCY', pattern: '"Rp "#,##0' } } }, fields: 'userEnteredFormat(textFormat,horizontalAlignment,numberFormat)' } },
    // Row 4: Table Headers
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 3, endRowIndex: 4, startColumnIndex: 0, endColumnIndex: 9 },
        cell: {
          userEnteredFormat: {
            backgroundColor: NAVY,
            textFormat: { bold: true, foregroundColor: WHITE, fontSize: 10, fontFamily: 'Google Sans' },
            verticalAlignment: 'MIDDLE',
            horizontalAlignment: 'CENTER',
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,verticalAlignment,horizontalAlignment)',
      },
    },
    { repeatCell: { range: { sheetId, startRowIndex: 3, endRowIndex: 4, startColumnIndex: 3, endColumnIndex: 4 }, cell: { userEnteredFormat: { horizontalAlignment: 'LEFT' } }, fields: 'userEnteredFormat.horizontalAlignment' } },
    { repeatCell: { range: { sheetId, startRowIndex: 3, endRowIndex: 4, startColumnIndex: 7, endColumnIndex: 8 }, cell: { userEnteredFormat: { horizontalAlignment: 'LEFT' } }, fields: 'userEnteredFormat.horizontalAlignment' } },
    { repeatCell: { range: { sheetId, startRowIndex: 3, endRowIndex: 4, startColumnIndex: 5, endColumnIndex: 6 }, cell: { userEnteredFormat: { horizontalAlignment: 'RIGHT' } }, fields: 'userEnteredFormat.horizontalAlignment' } },
    // Rows 5..rowCount Data Rows
    { repeatCell: { range: { sheetId, startRowIndex: 4, endRowIndex: rowCount, startColumnIndex: 0, endColumnIndex: 1 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', textFormat: { foregroundColor: DARK_TEXT, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 4, endRowIndex: rowCount, startColumnIndex: 1, endColumnIndex: 2 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', numberFormat: { type: 'DATE', pattern: 'yyyy-mm-dd' }, textFormat: { foregroundColor: DARK_TEXT, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,numberFormat,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 4, endRowIndex: rowCount, startColumnIndex: 2, endColumnIndex: 3 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', numberFormat: { type: 'TIME', pattern: 'hh:mm' }, textFormat: { foregroundColor: DARK_TEXT, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,numberFormat,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 4, endRowIndex: rowCount, startColumnIndex: 3, endColumnIndex: 4 }, cell: { userEnteredFormat: { horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE', textFormat: { bold: true, foregroundColor: DARK_TEXT, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 4, endRowIndex: rowCount, startColumnIndex: 4, endColumnIndex: 5 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', textFormat: { foregroundColor: DARK_TEXT, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 4, endRowIndex: rowCount, startColumnIndex: 5, endColumnIndex: 6 }, cell: { userEnteredFormat: { horizontalAlignment: 'RIGHT', verticalAlignment: 'MIDDLE', textFormat: { bold: true, foregroundColor: GREEN_ACCENT, fontFamily: 'Google Sans' }, numberFormat: { type: 'CURRENCY', pattern: '"Rp "#,##0' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat,numberFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 4, endRowIndex: rowCount, startColumnIndex: 6, endColumnIndex: 7 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', textFormat: { foregroundColor: DARK_TEXT, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 4, endRowIndex: rowCount, startColumnIndex: 7, endColumnIndex: 8 }, cell: { userEnteredFormat: { horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE', textFormat: { foregroundColor: DARK_TEXT, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 4, endRowIndex: rowCount, startColumnIndex: 8, endColumnIndex: 9 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', textFormat: { fontSize: 8, foregroundColor: MUTED, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)' } },
    // Banding
    { addBanding: { bandedRange: { range: { sheetId, startRowIndex: 3, endRowIndex: rowCount, startColumnIndex: 0, endColumnIndex: 9 }, rowProperties: { headerColor: NAVY, firstBandColor: WHITE, secondBandColor: GRAY_BG } } } },
    // Validations
    {
      setDataValidation: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 1, endColumnIndex: 3 },
        rule: {
          condition: {
            type: 'ONE_OF_LIST',
            values: MONTH_OPTIONS.map((m) => ({ userEnteredValue: m })),
          },
          showCustomUi: true,
        },
      },
    },
    {
      setDataValidation: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 4, endColumnIndex: 6 },
        rule: {
          condition: {
            type: 'ONE_OF_RANGE',
            values: [{ userEnteredValue: '=\'_data\'!$K$1:$K$50' }],
          },
          showCustomUi: true,
        },
      },
    },
    {
      setDataValidation: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 7, endColumnIndex: 9 },
        rule: {
          condition: {
            type: 'ONE_OF_LIST',
            values: CATEGORY_OPTIONS.map((c) => ({ userEnteredValue: c })),
          },
          showCustomUi: true,
        },
      },
    },
  ]
}

function buildDataSheetRequests(sheetId: number, rowCount: number) {
  const columnWidths = [115, 85, 220, 160, 150, 140, 240, 100, 120]

  return [
    {
      updateSheetProperties: {
        properties: { sheetId, gridProperties: { frozenRowCount: 1, columnCount: 26 } },
        fields: 'gridProperties.frozenRowCount,gridProperties.columnCount',
      },
    },
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 }, properties: { pixelSize: 40 }, fields: 'pixelSize' } },
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 1, endIndex: rowCount }, properties: { pixelSize: 32 }, fields: 'pixelSize' } },
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
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 0, endColumnIndex: 1 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', numberFormat: { type: 'DATE', pattern: 'yyyy-mm-dd' }, textFormat: { foregroundColor: DARK_TEXT, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,numberFormat,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 1, endColumnIndex: 2 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', numberFormat: { type: 'TIME', pattern: 'hh:mm' }, textFormat: { foregroundColor: DARK_TEXT, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,numberFormat,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 2, endColumnIndex: 3 }, cell: { userEnteredFormat: { horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE', textFormat: { bold: true, foregroundColor: DARK_TEXT, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 3, endColumnIndex: 4 }, cell: { userEnteredFormat: { horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE', textFormat: { foregroundColor: DARK_TEXT, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 4, endColumnIndex: 5 }, cell: { userEnteredFormat: { horizontalAlignment: 'RIGHT', verticalAlignment: 'MIDDLE', textFormat: { bold: true, foregroundColor: GREEN_ACCENT, fontFamily: 'Google Sans' }, numberFormat: { type: 'CURRENCY', pattern: '"Rp "#,##0' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat,numberFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 5, endColumnIndex: 7 }, cell: { userEnteredFormat: { horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE', textFormat: { foregroundColor: DARK_TEXT, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 7, endColumnIndex: 8 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', textFormat: { fontSize: 9, foregroundColor: MUTED, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 8, endColumnIndex: 9 }, cell: { userEnteredFormat: { horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE', textFormat: { fontSize: 8, foregroundColor: MUTED, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)' } },
    // Col K sequence date format
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: 50, startColumnIndex: 10, endColumnIndex: 11 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', numberFormat: { type: 'DATE', pattern: 'yyyy-mm-dd' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,numberFormat)' } },
    // Filter
    { setBasicFilter: { filter: { range: { sheetId, startRowIndex: 0, endRowIndex: rowCount, startColumnIndex: 0, endColumnIndex: 9 } } } },
  ]
}

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
    // Data columns (Warna teks gelap pekat DARK_TEXT dan format rapi)
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 0, endColumnIndex: 1 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', numberFormat: { type: 'DATE', pattern: 'yyyy-mm-dd' }, textFormat: { foregroundColor: DARK_TEXT, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,numberFormat,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 1, endColumnIndex: 2 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', numberFormat: { type: 'TIME', pattern: 'hh:mm' }, textFormat: { foregroundColor: DARK_TEXT, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,numberFormat,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 2, endColumnIndex: 3 }, cell: { userEnteredFormat: { horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE', textFormat: { bold: true, foregroundColor: DARK_TEXT, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 3, endColumnIndex: 4 }, cell: { userEnteredFormat: { horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE', textFormat: { foregroundColor: DARK_TEXT, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 4, endColumnIndex: 5 }, cell: { userEnteredFormat: { horizontalAlignment: 'RIGHT', verticalAlignment: 'MIDDLE', textFormat: { bold: true, foregroundColor: GREEN_ACCENT, fontFamily: 'Google Sans' }, numberFormat: { type: 'CURRENCY', pattern: '"Rp "#,##0' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat,numberFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 5, endColumnIndex: 7 }, cell: { userEnteredFormat: { horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE', textFormat: { foregroundColor: DARK_TEXT, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)' } },
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
    // Merges
    {
      mergeCells: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 8 },
        mergeType: 'MERGE_ALL',
      },
    },
    {
      mergeCells: {
        range: { sheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 0, endColumnIndex: 3 },
        mergeType: 'MERGE_ALL',
      },
    },
    {
      mergeCells: {
        range: { sheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 4, endColumnIndex: 8 },
        mergeType: 'MERGE_ALL',
      },
    },
    {
      mergeCells: {
        range: { sheetId, startRowIndex: 6, endRowIndex: 7, startColumnIndex: 0, endColumnIndex: 6 },
        mergeType: 'MERGE_ALL',
      },
    },
    {
      mergeCells: {
        range: { sheetId, startRowIndex: 10, endRowIndex: 11, startColumnIndex: 0, endColumnIndex: 3 },
        mergeType: 'MERGE_ALL',
      },
    },
    {
      mergeCells: {
        range: { sheetId, startRowIndex: 10, endRowIndex: 11, startColumnIndex: 4, endColumnIndex: 8 },
        mergeType: 'MERGE_ALL',
      },
    },

    // Row 1 Title Banner
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 }, properties: { pixelSize: 44 }, fields: 'pixelSize' } },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 8 },
        cell: {
          userEnteredFormat: {
            backgroundColor: NAVY,
            textFormat: { bold: true, foregroundColor: WHITE, fontSize: 13, fontFamily: 'Google Sans' },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
      },
    },

    // Row 3 Section Headers
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 2, endIndex: 3 }, properties: { pixelSize: 32 }, fields: 'pixelSize' } },
    { repeatCell: { range: { sheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 0, endColumnIndex: 3 }, cell: { userEnteredFormat: { backgroundColor: NAVY_LIGHT, textFormat: { bold: true, foregroundColor: WHITE, fontSize: 10, fontFamily: 'Google Sans' }, horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 4, endColumnIndex: 8 }, cell: { userEnteredFormat: { backgroundColor: NAVY_LIGHT, textFormat: { bold: true, foregroundColor: WHITE, fontSize: 10, fontFamily: 'Google Sans' }, horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)' } },

    // Row 4 Filter Inputs
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 3, endIndex: 4 }, properties: { pixelSize: 34 }, fields: 'pixelSize' } },
    { repeatCell: { range: { sheetId, startRowIndex: 3, endRowIndex: 4, startColumnIndex: 0, endColumnIndex: 8 }, cell: { userEnteredFormat: { verticalAlignment: 'MIDDLE', textFormat: { fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(verticalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 3, endRowIndex: 4, startColumnIndex: 1, endColumnIndex: 2 }, cell: { userEnteredFormat: { backgroundColor: AMBER_BG, textFormat: { bold: true, foregroundColor: AMBER_TEXT, fontSize: 10, fontFamily: 'Google Sans' }, horizontalAlignment: 'CENTER', numberFormat: { type: 'DATE', pattern: 'yyyy-mm-dd' } } }, fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,numberFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 3, endRowIndex: 4, startColumnIndex: 5, endColumnIndex: 6 }, cell: { userEnteredFormat: { backgroundColor: AMBER_BG, textFormat: { bold: true, foregroundColor: AMBER_TEXT, fontSize: 10, fontFamily: 'Google Sans' }, horizontalAlignment: 'CENTER', numberFormat: { type: 'DATE', pattern: 'yyyy-mm-dd' } } }, fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,numberFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 3, endRowIndex: 4, startColumnIndex: 7, endColumnIndex: 8 }, cell: { userEnteredFormat: { backgroundColor: AMBER_BG, textFormat: { bold: true, foregroundColor: AMBER_TEXT, fontSize: 10, fontFamily: 'Google Sans' }, horizontalAlignment: 'CENTER', numberFormat: { type: 'DATE', pattern: 'yyyy-mm-dd' } } }, fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,numberFormat)' } },

    // Row 5 Filter Results
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 4, endIndex: 5 }, properties: { pixelSize: 32 }, fields: 'pixelSize' } },
    { repeatCell: { range: { sheetId, startRowIndex: 4, endRowIndex: 5, startColumnIndex: 0, endColumnIndex: 3 }, cell: { userEnteredFormat: { backgroundColor: CARD_BG, verticalAlignment: 'MIDDLE', textFormat: { fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(backgroundColor,verticalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 4, endRowIndex: 5, startColumnIndex: 4, endColumnIndex: 8 }, cell: { userEnteredFormat: { backgroundColor: CARD_BG, verticalAlignment: 'MIDDLE', textFormat: { fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(backgroundColor,verticalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 4, endRowIndex: 5, startColumnIndex: 1, endColumnIndex: 2 }, cell: { userEnteredFormat: { horizontalAlignment: 'RIGHT', textFormat: { bold: true, foregroundColor: GREEN_ACCENT, fontFamily: 'Google Sans' }, numberFormat: { type: 'CURRENCY', pattern: '"Rp "#,##0' } } }, fields: 'userEnteredFormat(horizontalAlignment,textFormat,numberFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 4, endRowIndex: 5, startColumnIndex: 2, endColumnIndex: 3 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', textFormat: { foregroundColor: MUTED, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 4, endRowIndex: 5, startColumnIndex: 5, endColumnIndex: 6 }, cell: { userEnteredFormat: { horizontalAlignment: 'RIGHT', textFormat: { bold: true, foregroundColor: GREEN_ACCENT, fontFamily: 'Google Sans' }, numberFormat: { type: 'CURRENCY', pattern: '"Rp "#,##0' } } }, fields: 'userEnteredFormat(horizontalAlignment,textFormat,numberFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 4, endRowIndex: 5, startColumnIndex: 7, endColumnIndex: 8 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', textFormat: { foregroundColor: MUTED, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,textFormat)' } },

    // Row 7 Month Section Header
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 6, endIndex: 7 }, properties: { pixelSize: 32 }, fields: 'pixelSize' } },
    { repeatCell: { range: { sheetId, startRowIndex: 6, endRowIndex: 7, startColumnIndex: 0, endColumnIndex: 6 }, cell: { userEnteredFormat: { backgroundColor: NAVY_LIGHT, textFormat: { bold: true, foregroundColor: WHITE, fontSize: 10, fontFamily: 'Google Sans' }, horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)' } },

    // Row 8 Month Subheaders
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 7, endIndex: 8 }, properties: { pixelSize: 28 }, fields: 'pixelSize' } },
    { repeatCell: { range: { sheetId, startRowIndex: 7, endRowIndex: 8, startColumnIndex: 0, endColumnIndex: 3 }, cell: { userEnteredFormat: { backgroundColor: SECTION_BG, textFormat: { bold: true, fontSize: 9, fontFamily: 'Google Sans' }, verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat(backgroundColor,textFormat,verticalAlignment)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 7, endRowIndex: 8, startColumnIndex: 4, endColumnIndex: 6 }, cell: { userEnteredFormat: { backgroundColor: SECTION_BG, textFormat: { bold: true, fontSize: 9, fontFamily: 'Google Sans' }, verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat(backgroundColor,textFormat,verticalAlignment)' } },

    // Row 9 Month KPI Values
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 8, endIndex: 9 }, properties: { pixelSize: 36 }, fields: 'pixelSize' } },
    { repeatCell: { range: { sheetId, startRowIndex: 8, endRowIndex: 9, startColumnIndex: 0, endColumnIndex: 3 }, cell: { userEnteredFormat: { backgroundColor: CARD_BG, verticalAlignment: 'MIDDLE', textFormat: { fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(backgroundColor,verticalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 8, endRowIndex: 9, startColumnIndex: 4, endColumnIndex: 6 }, cell: { userEnteredFormat: { backgroundColor: CARD_BG, verticalAlignment: 'MIDDLE', textFormat: { fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(backgroundColor,verticalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 8, endRowIndex: 9, startColumnIndex: 0, endColumnIndex: 1 }, cell: { userEnteredFormat: { textFormat: { bold: true, fontSize: 11, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat.textFormat' } },
    { repeatCell: { range: { sheetId, startRowIndex: 8, endRowIndex: 9, startColumnIndex: 1, endColumnIndex: 2 }, cell: { userEnteredFormat: { horizontalAlignment: 'RIGHT', textFormat: { bold: true, fontSize: 13, foregroundColor: GREEN_ACCENT, fontFamily: 'Google Sans' }, numberFormat: { type: 'CURRENCY', pattern: '"Rp "#,##0' } } }, fields: 'userEnteredFormat(horizontalAlignment,textFormat,numberFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 8, endRowIndex: 9, startColumnIndex: 2, endColumnIndex: 3 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', textFormat: { bold: true, fontSize: 11, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,textFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 8, endRowIndex: 9, startColumnIndex: 4, endColumnIndex: 6 }, cell: { userEnteredFormat: { horizontalAlignment: 'RIGHT', textFormat: { bold: true, fontSize: 10, fontFamily: 'Google Sans' }, numberFormat: { type: 'CURRENCY', pattern: '"Rp "#,##0' } } }, fields: 'userEnteredFormat(horizontalAlignment,textFormat,numberFormat)' } },

    // Row 11 Category Section Headers
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 10, endIndex: 11 }, properties: { pixelSize: 32 }, fields: 'pixelSize' } },
    { repeatCell: { range: { sheetId, startRowIndex: 10, endRowIndex: 11, startColumnIndex: 0, endColumnIndex: 3 }, cell: { userEnteredFormat: { backgroundColor: NAVY_LIGHT, textFormat: { bold: true, foregroundColor: WHITE, fontSize: 10, fontFamily: 'Google Sans' }, horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 10, endRowIndex: 11, startColumnIndex: 4, endColumnIndex: 8 }, cell: { userEnteredFormat: { backgroundColor: NAVY_LIGHT, textFormat: { bold: true, foregroundColor: WHITE, fontSize: 10, fontFamily: 'Google Sans' }, horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE' } }, fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)' } },

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

    // Column Z Date Format (for unique transaction date list)
    {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: 200,
          startColumnIndex: 25,
          endColumnIndex: 26,
        },
        cell: {
          userEnteredFormat: {
            numberFormat: { type: 'DATE', pattern: 'yyyy-mm-dd' },
            textFormat: { fontFamily: 'Google Sans' },
          },
        },
        fields: 'userEnteredFormat(numberFormat,textFormat)',
      },
    },

    // Dropdown Data Validation for B4 (Filter Tanggal Tertentu)
    {
      setDataValidation: {
        range: {
          sheetId,
          startRowIndex: 3,
          endRowIndex: 4,
          startColumnIndex: 1,
          endColumnIndex: 2,
        },
        rule: {
          condition: {
            type: 'ONE_OF_RANGE',
            values: [{ userEnteredValue: '=Ringkasan!Z1:Z' }],
          },
          inputMessage: 'Pilih tanggal dari riwayat transaksi',
          strict: false,
          showCustomUi: true,
        },
      },
    },

    // Dropdown Data Validation for F4 (Filter Rentang: Dari Tanggal)
    {
      setDataValidation: {
        range: {
          sheetId,
          startRowIndex: 3,
          endRowIndex: 4,
          startColumnIndex: 5,
          endColumnIndex: 6,
        },
        rule: {
          condition: {
            type: 'ONE_OF_RANGE',
            values: [{ userEnteredValue: '=Ringkasan!Z1:Z' }],
          },
          inputMessage: 'Pilih tanggal awal dari riwayat transaksi',
          strict: false,
          showCustomUi: true,
        },
      },
    },

    // Dropdown Data Validation for H4 (Filter Rentang: Sampai Tanggal)
    {
      setDataValidation: {
        range: {
          sheetId,
          startRowIndex: 3,
          endRowIndex: 4,
          startColumnIndex: 7,
          endColumnIndex: 8,
        },
        rule: {
          condition: {
            type: 'ONE_OF_RANGE',
            values: [{ userEnteredValue: '=Ringkasan!Z1:Z' }],
          },
          inputMessage: 'Pilih tanggal akhir dari riwayat transaksi',
          strict: false,
          showCustomUi: true,
        },
      },
    },
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
  const sheetsClient = await getSheetsClient(auth)

  try {
    const meta = await sheetsClient.spreadsheets.get({ spreadsheetId })
    const txSheet = meta.data.sheets?.find((s) => s.properties?.title === 'Transaksi')
    const summarySheet = meta.data.sheets?.find((s) => s.properties?.title === 'Ringkasan')
    const dataSheet = meta.data.sheets?.find((s) => s.properties?.title === '_data')

    const txSheetId = txSheet?.properties?.sheetId ?? 0
    const summarySheetId = summarySheet?.properties?.sheetId ?? 1
    const txRowCount = txSheet?.properties?.gridProperties?.rowCount ?? 1000

    const existingBanding = [
      ...(txSheet?.bandedRanges ?? []),
      ...(dataSheet?.bandedRanges ?? []),
    ]
    const deleteBandingRequests = existingBanding.map((b) => ({
      deleteBanding: { bandedRangeId: b.bandedRangeId },
    }))

    const clearFilterRequests = [
      ...(txSheet?.basicFilter ? [{ clearBasicFilter: { sheetId: txSheetId } }] : []),
      ...(dataSheet?.basicFilter
        ? [{ clearBasicFilter: { sheetId: dataSheet.properties?.sheetId ?? 0 } }]
        : []),
    ]

    const txMerges = txSheet?.merges ?? []
    const unmergeRequests = txMerges.map((m) => ({
      unmergeCells: { range: m },
    }))

    const txRequests = dataSheet
      ? buildInteractiveTransactionSheetRequests(txSheetId, txRowCount)
      : buildTransactionSheetRequests(txSheetId, txRowCount)

    const dataRequests = dataSheet
      ? buildDataSheetRequests(
          dataSheet.properties?.sheetId ?? 0,
          dataSheet.properties?.gridProperties?.rowCount ?? 1000,
        )
      : []

    const requests = [
      ...deleteBandingRequests,
      ...clearFilterRequests,
      ...unmergeRequests,
      ...txRequests,
      ...dataRequests,
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
  const sheetsClient = await getSheetsClient(auth)

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
    // Deteksi apakah spreadsheet menggunakan arsitektur baru (_data + view Transaksi)
    const meta = await sheetsClient.spreadsheets.get({ spreadsheetId }).catch(() => null)
    const dataSheet = meta?.data.sheets?.find((s) => s.properties?.title === '_data')
    const targetSheetTitle = dataSheet ? '_data' : 'Transaksi'
    const targetSheetId = (dataSheet ?? meta?.data.sheets?.find((s) => s.properties?.title === 'Transaksi'))?.properties?.sheetId ?? 0

    const appendRes = await sheetsClient.spreadsheets.values.append({
      spreadsheetId,
      range: `${targetSheetTitle}!A:I`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'OVERWRITE',
      requestBody: {
        values: [rowValues],
      },
    })

    const updatedRange = appendRes.data.updates?.updatedRange
    if (updatedRange) {
      const match = updatedRange.match(/!A(\d+):/)
      if (match && match[1]) {
        const rowNumber = parseInt(match[1], 10)
        const rowIndex = rowNumber - 1

        // Format baris yang baru ditulis agar warna teks selalu gelap pekat (bukan putih)
        await sheetsClient.spreadsheets
          .batchUpdate({
            spreadsheetId,
            requestBody: {
              requests: [
                { repeatCell: { range: { sheetId: targetSheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex: 0, endColumnIndex: 1 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', numberFormat: { type: 'DATE', pattern: 'yyyy-mm-dd' }, textFormat: { foregroundColor: DARK_TEXT, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,numberFormat,textFormat)' } },
                { repeatCell: { range: { sheetId: targetSheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex: 1, endColumnIndex: 2 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', numberFormat: { type: 'TIME', pattern: 'hh:mm' }, textFormat: { foregroundColor: DARK_TEXT, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,numberFormat,textFormat)' } },
                { repeatCell: { range: { sheetId: targetSheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex: 2, endColumnIndex: 3 }, cell: { userEnteredFormat: { horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE', textFormat: { bold: true, foregroundColor: DARK_TEXT, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)' } },
                { repeatCell: { range: { sheetId: targetSheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex: 3, endColumnIndex: 4 }, cell: { userEnteredFormat: { horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE', textFormat: { foregroundColor: DARK_TEXT, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)' } },
                { repeatCell: { range: { sheetId: targetSheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex: 4, endColumnIndex: 5 }, cell: { userEnteredFormat: { horizontalAlignment: 'RIGHT', verticalAlignment: 'MIDDLE', textFormat: { bold: true, foregroundColor: GREEN_ACCENT, fontFamily: 'Google Sans' }, numberFormat: { type: 'CURRENCY', pattern: '"Rp "#,##0' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat,numberFormat)' } },
                { repeatCell: { range: { sheetId: targetSheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex: 5, endColumnIndex: 7 }, cell: { userEnteredFormat: { horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE', textFormat: { foregroundColor: DARK_TEXT, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)' } },
                { repeatCell: { range: { sheetId: targetSheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex: 7, endColumnIndex: 8 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', textFormat: { fontSize: 9, foregroundColor: MUTED, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)' } },
                { repeatCell: { range: { sheetId: targetSheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex: 8, endColumnIndex: 9 }, cell: { userEnteredFormat: { horizontalAlignment: 'LEFT', verticalAlignment: 'MIDDLE', textFormat: { fontSize: 8, foregroundColor: MUTED, fontFamily: 'Google Sans' } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)' } },
              ],
            },
          })
          .catch(() => {})
      }
    }
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
  const sheetsClient = await getSheetsClient(auth)

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
