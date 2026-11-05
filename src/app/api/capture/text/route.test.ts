// @vitest-environment node
import { createHash } from 'crypto'
import type * as NextServerModule from 'next/server'
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockDeviceFindFirst,
  mockCaptureFindFirst,
  mockUserFindFirst,
  mockTokenFindFirst,
  mockInsert,
  mockInsertReturning,
  mockUpdate,
  mockUpdateWhere,
  mockSyncCaptureToGoogleSheets,
} = vi.hoisted(() => {
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

  const mockSyncCaptureToGoogleSheets = vi.fn()

  return {
    mockDeviceFindFirst,
    mockCaptureFindFirst,
    mockUserFindFirst,
    mockTokenFindFirst,
    mockInsertReturning,
    mockInsertValues,
    mockInsert,
    mockUpdateWhere,
    mockUpdateSet,
    mockUpdate,
    mockSyncCaptureToGoogleSheets,
  }
})

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock next/server after() to execute callback synchronously for test assertions
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof NextServerModule>()
  return {
    ...actual,
    after: vi.fn((cb: () => Promise<void> | void) => {
      // Execute the background task in test
      return Promise.resolve(cb()).catch(() => {})
    }),
  }
})

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

vi.mock('@/lib/google/sync-helper', () => ({
  syncCaptureToGoogleSheets: (...args: unknown[]) => mockSyncCaptureToGoogleSheets(...args),
}))

vi.mock('@/features/dashboard/reminder-evaluator', () => ({
  evaluateBudgetReminder: vi.fn().mockResolvedValue({ shouldAlert: false }),
}))

vi.mock('@/lib/push/send-push', () => ({
  sendPushNotificationToUser: vi.fn().mockResolvedValue(true),
}))

import { POST } from './route'

const VALID_TOKEN = 'test-device-token-123'
const VALID_TOKEN_HASH = createHash('sha256').update(VALID_TOKEN).digest('hex')
const MOCK_USER_ID = '11111111-1111-1111-1111-111111111111'
const MOCK_DEVICE_ID = '22222222-2222-2222-2222-222222222222'

const MOCK_DEVICE = {
  id: MOCK_DEVICE_ID,
  userId: MOCK_USER_ID,
  tokenHash: VALID_TOKEN_HASH,
  label: 'iPhone Pribadi',
  revokedAt: null,
}

describe('POST /api/capture/text', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDeviceFindFirst.mockResolvedValue(MOCK_DEVICE)
    mockCaptureFindFirst.mockResolvedValue(null)
    mockInsertReturning.mockResolvedValue([
      {
        id: 'capture-uuid-123',
        userId: MOCK_USER_ID,
        amountIdr: 25000,
        merchant: 'KOPI KENANGAN',
        status: 'ok',
        txType: 'expense',
      },
    ])
    mockUpdateWhere.mockResolvedValue(undefined)
    mockSyncCaptureToGoogleSheets.mockResolvedValue(undefined)
  })

  it('mengembalikan status 401 jika header Authorization tidak ada', async () => {
    const req = new NextRequest('http://localhost:3000/api/capture/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Pembayaran QRIS Rp 25.000 ke Kopi Kenangan berhasil' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(401)
    const json = (await res.json()) as { status: string; message: string }
    expect(json.status).toBe('failed')
  })

  it('mengembalikan status 401 jika perangkat telah dicabut (revoked)', async () => {
    mockDeviceFindFirst.mockResolvedValueOnce({
      ...MOCK_DEVICE,
      revokedAt: new Date(),
    })

    const req = new NextRequest('http://localhost:3000/api/capture/text', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${VALID_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: 'Pembayaran QRIS Rp 25.000 ke Kopi Kenangan berhasil' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('mengembalikan status 400 jika teks notifikasi kosong atau terlalu pendek', async () => {
    const req = new NextRequest('http://localhost:3000/api/capture/text', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${VALID_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: 'Rp' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = (await res.json()) as { status: string; message: string }
    expect(json.status).toBe('failed')
  })

  it('mengembalikan duplicate jika teks yang persis sama sudah dicatat', async () => {
    mockCaptureFindFirst.mockResolvedValueOnce({
      id: 'existing-capture-id',
      merchant: 'KOPI KENANGAN',
      amountIdr: 25000,
    })

    const req = new NextRequest('http://localhost:3000/api/capture/text', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${VALID_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: 'Pembayaran QRIS Rp 25.000 ke KOPI KENANGAN berhasil' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = (await res.json()) as { status: string }
    expect(json.status).toBe('duplicate')
  })

  it('berhasil memproses notifikasi QRIS pengeluaran (expense)', async () => {
    const req = new NextRequest('http://localhost:3000/api/capture/text', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${VALID_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Pembayaran QRIS sebesar Rp 25.000 ke KOPI KENANGAN berhasil',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = (await res.json()) as {
      status: string
      amountIdr: number
      merchant: string
      txType: string
    }

    expect(json.status).toBe('ok')
    expect(json.amountIdr).toBe(25000)
    expect(json.merchant).toBe('KOPI KENANGAN')
    expect(json.txType).toBe('expense')

    // Verifikasi sync ke Google Sheets dipanggil
    expect(mockSyncCaptureToGoogleSheets).toHaveBeenCalled()
  })

  it('berhasil memproses notifikasi transfer masuk (income / uang masuk)', async () => {
    mockInsertReturning.mockResolvedValueOnce([
      {
        id: 'capture-uuid-income',
        userId: MOCK_USER_ID,
        amountIdr: 500000,
        merchant: 'BUDI SANTOSO',
        status: 'ok',
        txType: 'income',
      },
    ])

    const req = new NextRequest('http://localhost:3000/api/capture/text', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${VALID_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Transfer Masuk Rp 500.000 dari BUDI SANTOSO berhasil',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = (await res.json()) as {
      status: string
      amountIdr: number
      merchant: string
      txType: string
    }

    expect(json.status).toBe('ok')
    expect(json.amountIdr).toBe(500000)
    expect(json.merchant).toBe('BUDI SANTOSO')
    expect(json.txType).toBe('income')
  })
})
