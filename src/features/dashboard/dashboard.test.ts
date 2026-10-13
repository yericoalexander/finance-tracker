import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock dependencies
const mockDbSelect = vi.fn()
const mockDbUpdate = vi.fn()
const mockAppendTransactionRow = vi.fn()
const mockAuth = vi.fn()
const mockRevalidatePath = vi.fn()

vi.mock('@/auth', () => ({
  auth: () => mockAuth(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: (path: string) => mockRevalidatePath(path),
}))

vi.mock('@/lib/db/client', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          orderBy: () => ({
            limit: () => mockDbSelect(),
          }),
        }),
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => mockDbUpdate(),
      }),
    }),
  },
}))

vi.mock('@/lib/crypto', () => ({
  decrypt: () => 'mock-refresh-token',
}))

vi.mock('@/lib/google/sheets', () => ({
  appendTransactionRow: (...args: unknown[]) => mockAppendTransactionRow(...args),
}))

const { approveReviewAction, dismissReviewAction } = await import('./actions')

describe('Dashboard Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('approveReviewAction', () => {
    it('mengembalikan error jika belum login', async () => {
      mockAuth.mockResolvedValue(null)
      const res = await approveReviewAction({
        captureId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        merchant: 'Kopi Kenangan',
        amountIdr: 25000,
        category: 'Makanan & Minuman',
        txDate: '2026-10-13',
      })

      expect(res.ok).toBe(false)
      expect(res.error).toContain('Sesi telah berakhir')
    })

    it('mengembalikan error jika input tidak lolos validasi Zod', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-123' } })
      const res = await approveReviewAction({
        captureId: 'invalid-uuid',
        merchant: '',
        amountIdr: -100,
        category: 'Makanan & Minuman',
        txDate: '2026-10-13',
      })

      expect(res.ok).toBe(false)
      expect(res.error).toBeDefined()
    })
  })

  describe('dismissReviewAction', () => {
    it('mengembalikan error jika belum login', async () => {
      mockAuth.mockResolvedValue(null)
      const res = await dismissReviewAction('a1b2c3d4-e5f6-7890-abcd-ef1234567890')
      expect(res.ok).toBe(false)
      expect(res.error).toContain('Sesi telah berakhir')
    })

    it('berhasil mengabaikan transaksi jika sudah login', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-123' } })
      mockDbUpdate.mockResolvedValue({ rowCount: 1 })

      const res = await dismissReviewAction('a1b2c3d4-e5f6-7890-abcd-ef1234567890')
      expect(res.ok).toBe(true)
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
    })
  })
})
