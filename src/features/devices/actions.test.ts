// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockAuth = vi.fn()
const mockInsertValues = vi.fn()
const mockInsert = vi.fn().mockReturnValue({ values: mockInsertValues })
const mockRevalidatePath = vi.fn()

vi.mock('@/auth', () => ({
  auth: () => mockAuth(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}))

vi.mock('@/lib/db/client', () => ({
  db: {
    insert: () => mockInsert(),
    query: {
      pairingCodes: {
        findFirst: vi.fn(),
      },
    },
  },
}))

const { createDirectDeviceTokenAction } = await import('./actions')

describe('createDirectDeviceTokenAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gagal jika user belum login', async () => {
    mockAuth.mockResolvedValueOnce(null)

    const res = await createDirectDeviceTokenAction()
    expect(res.ok).toBe(false)
    expect(res.error).toContain('Sesi telah berakhir')
  })

  it('berhasil membuat direct device token 32-byte untuk user aktif', async () => {
    mockAuth.mockResolvedValueOnce({
      user: {
        id: 'user-direct-1',
        name: 'Rico Alexander',
      },
    })
    mockInsertValues.mockResolvedValueOnce({})

    const res = await createDirectDeviceTokenAction('iPhone Rico')
    expect(res.ok).toBe(true)
    expect(res.deviceToken).toBeDefined()
    // 32-byte hex string = 64 karakter
    expect(res.deviceToken).toHaveLength(64)

    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-direct-1',
        label: 'iPhone Rico',
        tokenHash: expect.any(String),
      }),
    )
    expect(mockRevalidatePath).toHaveBeenCalledWith('/pair')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
  })

  it('menggunakan default label jika parameter label kosong', async () => {
    mockAuth.mockResolvedValueOnce({
      user: {
        id: 'user-direct-2',
        name: 'Budi Santoso',
      },
    })
    mockInsertValues.mockResolvedValueOnce({})

    const res = await createDirectDeviceTokenAction()
    expect(res.ok).toBe(true)
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'iPhone Budi',
      }),
    )
  })
})
