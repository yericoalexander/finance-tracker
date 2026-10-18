import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockAuth = vi.fn()
vi.mock('@/auth', () => ({
  auth: () => mockAuth(),
}))

const mockInsertValues = vi.fn()
const mockOnConflictDoUpdate = vi.fn()
const mockInsert = vi.fn().mockReturnValue({
  values: mockInsertValues.mockReturnValue({
    onConflictDoUpdate: mockOnConflictDoUpdate,
  }),
})

const mockDeleteWhere = vi.fn()
const mockDelete = vi.fn().mockReturnValue({
  where: mockDeleteWhere,
})

vi.mock('@/lib/db/client', () => ({
  db: {
    insert: () => mockInsert(),
    delete: () => mockDelete(),
  },
}))

vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: 'test-public-vapid-key',
  },
}))

import { GET, POST, DELETE } from './route'

describe('/api/push/subscribe route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mengembalikan 401 Unauthorized jika belum login', async () => {
    mockAuth.mockResolvedValue(null)

    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('mengembalikan publicKey pada GET request yang terotentikasi', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })

    const res = await GET()
    expect(res.status).toBe(200)
    const json = (await res.json()) as { publicKey: string }
    expect(json.publicKey).toBe('test-public-vapid-key')
  })

  it('berhasil menyimpan atau memperbarui langganan push pada POST request', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockOnConflictDoUpdate.mockResolvedValue(undefined)

    const req = new Request('http://localhost:3000/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: 'https://push.apple.com/endpoint-123',
        p256dh: 'p256dh-secret',
        auth: 'auth-secret',
        userAgent: 'iPhone iOS 18',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = (await res.json()) as { ok: boolean }
    expect(json.ok).toBe(true)
    expect(mockInsert).toHaveBeenCalled()
  })

  it('menolak payload tidak valid dengan 400 pada POST request', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })

    const req = new Request('http://localhost:3000/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: 'bukan-url-valid',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('berhasil menghapus langganan pada DELETE request', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockDeleteWhere.mockResolvedValue(undefined)

    const req = new Request('http://localhost:3000/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: 'https://push.apple.com/endpoint-123',
      }),
    })

    const res = await DELETE(req)
    expect(res.status).toBe(200)
    const json = (await res.json()) as { ok: boolean }
    expect(json.ok).toBe(true)
    expect(mockDelete).toHaveBeenCalled()
  })
})
