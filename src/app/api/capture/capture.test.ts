// @vitest-environment node
import { createHash } from 'crypto'
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockDeviceFindFirst = vi.fn()
const mockCaptureFindFirst = vi.fn()
const mockUserFindFirst = vi.fn()
const mockTokenFindFirst = vi.fn()

const mockInsertReturning = vi.fn()
const mockInsertValues = vi.fn().mockReturnValue({ returning: mockInsertReturning })
const mockInsert = vi.fn().mockReturnValue({ values: mockInsertValues })

const mockUpdateWhere = vi.fn()
const mockUpdateSet = vi.fn().mockReturnValue({ where: mockUpdateWhere })
const mockUpdate = vi.fn().mockReturnValue({ set: mockUpdateSet })

vi.mock('@/lib/db/client', () => ({
  db: {
    query: {
      devices: { findFirst: mockDeviceFindFirst },
      captures: { findFirst: mockCaptureFindFirst },
      users: { findFirst: mockUserFindFirst },
      googleTokens: { findFirst: mockTokenFindFirst },
    },
    insert: mockInsert,
    update: mockUpdate,
  },
}))

vi.mock('@/lib/env', () => ({
  env: {
    DATABASE_URL: 'postgresql://mock:mock@localhost:5432/mock',
    NEXTAUTH_SECRET: 'mock-secret-at-least-32-chars-long-12345',
    NEXTAUTH_URL: 'http://localhost:3000',
    GOOGLE_CLIENT_ID: 'mock-client',
    GOOGLE_CLIENT_SECRET: 'mock-secret',
    ENCRYPTION_KEY: 'a'.repeat(64),
    GEMINI_API_KEY: 'mock-gemini-key',
    GEMINI_MODEL: 'gemini-1.5-flash',
  },
}))

const mockExtractReceipt = vi.fn()
vi.mock('@/lib/ai/gemini', () => ({
  defaultExtractionProvider: {
    extractReceipt: mockExtractReceipt,
  },
}))

import type * as SheetsModule from '@/lib/google/sheets'

const mockAppendTransactionRow = vi.fn()
const mockEnsureSpreadsheet = vi.fn()
vi.mock('@/lib/google/sheets', async (importOriginal) => {
  const actual = await importOriginal<typeof SheetsModule>()
  return {
    ...actual,
    appendTransactionRow: mockAppendTransactionRow,
    ensureSpreadsheet: mockEnsureSpreadsheet,
  }
})

vi.mock('@/lib/crypto', () => ({
  decrypt: vi.fn().mockReturnValue('mock-decrypted-refresh-token'),
}))

const { POST } = await import('./route')

// Helper untuk membuat valid PNG buffer (magic bytes 89 50 4E 47 0D 0A 1A 0A)
function createValidPngBuffer(): Buffer {
  return Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x01, 0x02, 0x03, 0x04])
}

function createMultipartRequest(
  token: string | null,
  fileContent?: Buffer,
  fieldName = 'image',
): NextRequest {
  const formData = new FormData()
  if (fileContent) {
    const blob = new Blob([fileContent], { type: 'image/png' })
    formData.append(fieldName, blob, 'receipt.png')
  }

  const headers: Record<string, string> = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return new NextRequest('http://localhost:3000/api/capture', {
    method: 'POST',
    headers,
    body: formData,
  })
}

describe('POST /api/capture', () => {
  const validToken = 'mock-device-token-12345'
  const validTokenHash = createHash('sha256').update(validToken).digest('hex')

  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdateWhere.mockResolvedValue({})
    mockInsertReturning.mockResolvedValue([{ id: 'capture-uuid-1' }])
    mockInsertValues.mockReturnValue({ returning: mockInsertReturning })
  })

  it('mengembalikan status 401 jika header Authorization tidak ada atau tidak valid', async () => {
    const req = createMultipartRequest(null, createValidPngBuffer())
    const res = await POST(req)
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.status).toBe('failed')
    expect(json.message).toContain('Token perangkat tidak ditemukan')
  })

  it('mengembalikan status 401 jika perangkat telah dicabut (revoked)', async () => {
    mockDeviceFindFirst.mockResolvedValueOnce({
      id: 'dev-1',
      userId: 'user-1',
      tokenHash: validTokenHash,
      revokedAt: new Date(),
    })

    const req = createMultipartRequest(validToken, createValidPngBuffer())
    const res = await POST(req)
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.message).toContain('akses telah dicabut')
  })

  it('mengembalikan status 400 jika field image kosong atau format bukan gambar valid', async () => {
    mockDeviceFindFirst.mockResolvedValueOnce({
      id: 'dev-1',
      userId: 'user-1',
      tokenHash: validTokenHash,
      revokedAt: null,
    })

    // Kirim buffer sembarang yang bukan gambar
    const req = createMultipartRequest(validToken, Buffer.from('bukan-gambar'))
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.status).toBe('failed')
  })

  it('mengembalikan status duplicate jika gambar pernah dicatat untuk user yang sama', async () => {
    mockDeviceFindFirst.mockResolvedValueOnce({
      id: 'dev-1',
      userId: 'user-1',
      tokenHash: validTokenHash,
      revokedAt: null,
    })

    // Mock hash gambar sudah ada di DB
    mockCaptureFindFirst.mockResolvedValueOnce({
      id: 'existing-cap-1',
      merchant: 'Kopi Kenangan',
      amountIdr: 45000,
    })

    const req = createMultipartRequest(validToken, createValidPngBuffer())
    const res = await POST(req)
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json.status).toBe('duplicate')
    expect(json.message).toContain('sudah pernah dicatat')
    // AI model tidak boleh dipanggil saat duplikat
    expect(mockExtractReceipt).not.toHaveBeenCalled()
  })

  it('berhasil memproses struk dengan confidence tinggi dan menulis ke Google Sheets', async () => {
    mockDeviceFindFirst.mockResolvedValueOnce({
      id: 'dev-1',
      userId: 'user-1',
      tokenHash: validTokenHash,
      revokedAt: null,
    })
    mockCaptureFindFirst.mockResolvedValueOnce(null) // Bukan duplikat

    mockExtractReceipt.mockResolvedValueOnce({
      date: '2026-10-13',
      time: '13:00',
      merchant: 'Starbucks',
      amountIdr: 65000,
      category: 'Makanan & Minuman',
      paymentMethod: 'BCA',
      note: 'Americano',
      confidence: 0.95,
    })

    mockUserFindFirst.mockResolvedValueOnce({ sheetId: 'sheet-123' })
    mockTokenFindFirst.mockResolvedValueOnce({
      refreshTokenEncrypted: 'enc',
      iv: 'iv',
      authTag: 'tag',
    })
    mockAppendTransactionRow.mockResolvedValueOnce(undefined)

    const req = createMultipartRequest(validToken, createValidPngBuffer())
    const res = await POST(req)
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json.status).toBe('ok')
    expect(json.merchant).toBe('Starbucks')
    expect(json.amount).toContain('65.000')
    expect(json.message).toContain('Tercatat:')

    // Memastikan baris ditulis ke Google Sheets
    expect(mockAppendTransactionRow).toHaveBeenCalledOnce()
  })

  it('menandai status needs_review dan tidak menulis ke Sheets jika confidence < 0.7', async () => {
    mockDeviceFindFirst.mockResolvedValueOnce({
      id: 'dev-1',
      userId: 'user-1',
      tokenHash: validTokenHash,
      revokedAt: null,
    })
    mockCaptureFindFirst.mockResolvedValueOnce(null)

    mockExtractReceipt.mockResolvedValueOnce({
      date: '2026-10-13',
      time: '13:00',
      merchant: 'Warung Tegal',
      amountIdr: 20000,
      category: 'Makanan & Minuman',
      paymentMethod: 'Tunai',
      note: 'Makan siang',
      confidence: 0.55, // Low confidence
    })

    const req = createMultipartRequest(validToken, createValidPngBuffer())
    const res = await POST(req)
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json.status).toBe('needs_review')
    expect(json.message).toContain('Perlu Dicek')

    // Sheets TIDAK boleh dipanggil saat confidence < 0.7
    expect(mockAppendTransactionRow).not.toHaveBeenCalled()
  })

  it('mengembalikan pesan ramah perbarui akses jika Google mengembalikan 401/403', async () => {
    mockDeviceFindFirst.mockResolvedValueOnce({
      id: 'dev-1',
      userId: 'user-1',
      tokenHash: validTokenHash,
      revokedAt: null,
    })
    mockCaptureFindFirst.mockResolvedValueOnce(null)

    mockExtractReceipt.mockResolvedValueOnce({
      date: '2026-10-13',
      time: '13:00',
      merchant: 'Indomaret',
      amountIdr: 30000,
      category: 'Belanja',
      paymentMethod: 'ShopeePay',
      note: 'Minuman',
      confidence: 0.9,
    })

    mockUserFindFirst.mockResolvedValueOnce({ sheetId: 'sheet-123' })
    mockTokenFindFirst.mockResolvedValueOnce({
      refreshTokenEncrypted: 'enc',
      iv: 'iv',
      authTag: 'tag',
    })

    const { GoogleApiError } = await import('@/lib/google/sheets')
    mockAppendTransactionRow.mockRejectedValueOnce(
      new GoogleApiError('Permission revoked', 403, 'PERMISSION_DENIED', 're-auth'),
    )

    const req = createMultipartRequest(validToken, createValidPngBuffer())
    const res = await POST(req)
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json.status).toBe('failed')
    expect(json.message).toBe('Akses Google perlu diperbarui, masuk ulang di aplikasi')
  })
})
