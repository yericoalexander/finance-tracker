// @vitest-environment node
import { createHash } from 'crypto'
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockFindFirst = vi.fn()
const mockInsertValues = vi.fn()
const mockInsert = vi.fn().mockReturnValue({ values: mockInsertValues })
const mockUpdateSet = vi.fn()
const mockUpdateWhere = vi.fn()
const mockUpdate = vi.fn().mockReturnValue({
  set: mockUpdateSet.mockReturnValue({
    where: mockUpdateWhere,
  }),
})

vi.mock('@/lib/db/client', () => ({
  db: {
    query: {
      pairingCodes: {
        findFirst: mockFindFirst,
      },
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

const { POST } = await import('./route')

describe('POST /api/devices/pair', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('berhasil menukar kode pairing valid dengan device token 32-byte', async () => {
    const rawCode = 'ABC12345'
    const codeHash = createHash('sha256').update(rawCode).digest('hex')

    mockFindFirst.mockResolvedValueOnce({
      id: 'pairing-code-id-1',
      userId: 'user-id-1',
      codeHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      usedAt: null,
    })
    mockInsertValues.mockResolvedValueOnce({})
    mockUpdateWhere.mockResolvedValueOnce({})

    const req = new NextRequest('http://localhost:3000/api/devices/pair', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: rawCode, label: 'iPhone Rico' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.ok).toBe(true)
    expect(data.label).toBe('iPhone Rico')
    expect(data.deviceToken).toBeDefined()
    // 32 byte hex string = 64 karakter
    expect(data.deviceToken).toHaveLength(64)

    // Memastikan kode ditandai sudah digunakan
    expect(mockUpdate).toHaveBeenCalled()
    // Memastikan hash token disimpan ke tabel devices
    expect(mockInsert).toHaveBeenCalled()
  })

  it('mengembalikan status 400 jika kode pairing tidak ditemukan atau sudah kedaluwarsa', async () => {
    mockFindFirst.mockResolvedValueOnce(null)

    const req = new NextRequest('http://localhost:3000/api/devices/pair', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'WRONG123', label: 'iPhone' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)

    const data = await res.json()
    expect(data.ok).toBe(false)
    expect(data.error).toBe('INVALID_OR_EXPIRED_CODE')
  })

  it('mengembalikan status 400 jika panjang kode tidak 8 karakter atau label kosong', async () => {
    const req = new NextRequest('http://localhost:3000/api/devices/pair', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'SHORT', label: '' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)

    const data = await res.json()
    expect(data.ok).toBe(false)
    expect(data.error).toBe('VALIDATION_ERROR')
  })
})
