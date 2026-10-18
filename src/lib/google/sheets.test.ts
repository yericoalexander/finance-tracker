import { describe, expect, it, vi, beforeEach } from 'vitest'

// Mock semua dependensi eksternal sebelum import
vi.mock('@/lib/env', () => ({
  env: {
    GOOGLE_CLIENT_ID: 'mock-client-id',
    GOOGLE_CLIENT_SECRET: 'mock-client-secret',
    NEXTAUTH_URL: 'http://localhost:3000',
  },
}))

// Mock googleapis
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockGet = vi.fn()
const mockBatchUpdate = vi.fn()

vi.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: vi.fn().mockImplementation(function () {
        return {
          setCredentials: vi.fn(),
        }
      }),
    },
    sheets: vi.fn().mockReturnValue({
      spreadsheets: {
        create: mockCreate,
        get: mockGet,
        batchUpdate: mockBatchUpdate,
        values: { update: mockUpdate },
      },
    }),
  },
}))

const { ensureSpreadsheet, formatSpreadsheet, GoogleApiError } = await import('@/lib/google/sheets')

describe('ensureSpreadsheet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreate.mockResolvedValue({ data: { spreadsheetId: 'sheet-abc-123' } })
    mockUpdate.mockResolvedValue({ data: {} })
    mockGet.mockResolvedValue({
      data: {
        sheets: [
          { properties: { title: 'Transaksi', sheetId: 0 } },
          { properties: { title: '_data', sheetId: 1, hidden: true } },
          { properties: { title: 'Ringkasan', sheetId: 2 } },
        ],
      },
    })
    mockBatchUpdate.mockResolvedValue({ data: {} })
  })

  it('idempoten: langsung kembalikan sheetId jika sudah ada', async () => {
    const result = await ensureSpreadsheet('refresh-token', 'existing-sheet-id')
    expect(result).toBe('existing-sheet-id')
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('buat spreadsheet jika sheetId null', async () => {
    const result = await ensureSpreadsheet('refresh-token', null)
    expect(result).toBe('sheet-abc-123')
    expect(mockCreate).toHaveBeenCalledOnce()
    expect(mockUpdate).toHaveBeenCalledTimes(4)
  })

  it('melempar GoogleApiError 401 saat token expired', async () => {
    const { GaxiosError } = await import('gaxios')
    const err401 = new GaxiosError('Unauthorized', {} as never, { status: 401 } as never, null)
    mockCreate.mockRejectedValue(Object.assign(err401, { response: { status: 401 } }))

    await expect(ensureSpreadsheet('bad-token', null)).rejects.toMatchObject({
      code: 401,
      action: 'refresh',
      step: 'create spreadsheet',
    })
  })

  it('melempar GoogleApiError 403 saat izin dicabut', async () => {
    const { GaxiosError } = await import('gaxios')
    const err403 = new GaxiosError('Forbidden', {} as never, { status: 403 } as never, null)
    mockCreate.mockRejectedValue(Object.assign(err403, { response: { status: 403 } }))

    await expect(ensureSpreadsheet('revoked-token', null)).rejects.toMatchObject({
      code: 403,
      action: 're-auth',
      step: 'create spreadsheet',
    })
  })

  it('melempar GoogleApiError jika API tidak kembalikan spreadsheetId', async () => {
    mockCreate.mockResolvedValue({ data: { spreadsheetId: null } })
    await expect(ensureSpreadsheet('refresh-token', null)).rejects.toThrow(GoogleApiError)
  })

  it('meneruskan kode error Google asli dari respons (tidak jadi "unknown")', async () => {
    const googleCloudError = {
      message: 'Google Sheets API has not been used in project before or it is disabled.',
      response: {
        status: 403,
        data: {
          error: {
            code: 403,
            message: 'Google Sheets API has not been used in project before or it is disabled.',
            status: 'PERMISSION_DENIED',
            details: [
              {
                reason: 'SERVICE_DISABLED',
                domain: 'googleapis.com',
              },
            ],
          },
        },
      },
    }
    mockCreate.mockRejectedValue(googleCloudError)

    await expect(ensureSpreadsheet('refresh-token', null)).rejects.toMatchObject({
      code: 403,
      googleCode: 'SERVICE_DISABLED',
      action: 're-auth',
      step: 'create spreadsheet',
      message: 'Google Sheets API has not been used in project before or it is disabled.',
    })
  })

  it('meneruskan kode INVALID_ARGUMENT dan langkah create spreadsheet saat argumen salah', async () => {
    const invalidArgError = {
      message: 'Invalid properties: Unsupported locale: id_ID',
      response: {
        status: 400,
        data: {
          error: {
            code: 400,
            message: 'Invalid properties: Unsupported locale: id_ID',
            status: 'INVALID_ARGUMENT',
          },
        },
      },
    }
    mockCreate.mockRejectedValue(invalidArgError)

    await expect(ensureSpreadsheet('refresh-token', null)).rejects.toMatchObject({
      code: 400,
      googleCode: 'INVALID_ARGUMENT',
      action: 'fix_request',
      step: 'create spreadsheet',
      message: 'Invalid properties: Unsupported locale: id_ID',
    })
  })

  it('meneruskan error saat penulisan rumus Ringkasan gagal', async () => {
    mockCreate.mockResolvedValue({ data: { spreadsheetId: 'sheet-123' } })
    mockUpdate.mockRejectedValue({
      message: 'Formula parse error',
      response: {
        status: 400,
        data: {
          error: {
            code: 400,
            message: 'Formula parse error',
            status: 'INVALID_ARGUMENT',
          },
        },
      },
    })

    await expect(ensureSpreadsheet('refresh-token', null)).rejects.toMatchObject({
      code: 400,
      googleCode: 'INVALID_ARGUMENT',
      step: 'tulis rumus Ringkasan',
    })
  })
})

describe('formatSpreadsheet', () => {
  it('berhasil memanggil batchUpdate dengan konfigurasi formatting lengkap', async () => {
    await formatSpreadsheet('refresh-token', 'sheet-abc-123')
    expect(mockGet).toHaveBeenCalledWith({ spreadsheetId: 'sheet-abc-123' })
    expect(mockBatchUpdate).toHaveBeenCalledOnce()
    const callArgs = mockBatchUpdate.mock.calls[0]?.[0] as {
      spreadsheetId: string
      requestBody: { requests: unknown[] }
    }
    expect(callArgs.spreadsheetId).toBe('sheet-abc-123')
    expect(callArgs.requestBody.requests.length).toBeGreaterThan(10)
  })
})
