import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock dependencies
const mockDbSelect = vi.fn()
const mockDbInsert = vi.fn()
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
          limit: () => mockDbSelect(),
          orderBy: () => ({
            limit: () => mockDbSelect(),
          }),
        }),
      }),
    }),
    insert: () => ({
      values: () => mockDbInsert(),
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
const { createManualTransactionAction } = await import('./manual-entry-action')

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
    })
  })

  describe('createManualTransactionAction', () => {
    it('mengembalikan error jika belum login', async () => {
      mockAuth.mockResolvedValue(null)
      const res = await createManualTransactionAction({
        merchant: 'Kopi Kenangan',
        amountIdr: 25000,
        category: 'Makanan & Minuman',
        txDate: '2026-10-13',
      })
      expect(res.ok).toBe(false)
      expect(res.error).toContain('Sesi telah berakhir')
    })

    it('mengembalikan error jika merchant kosong atau amount tidak valid', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-123' } })
      const res = await createManualTransactionAction({
        merchant: '',
        amountIdr: 0,
        category: 'Makanan & Minuman',
        txDate: '2026-10-13',
      })
      expect(res.ok).toBe(false)
      expect(res.error).toBeDefined()
    })

    it('berhasil menyimpan transaksi manual ke Google Sheets dan DB jika valid', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-123' } })
      mockDbSelect
        .mockResolvedValueOnce([{ sheetId: 'mock-sheet-id' }])
        .mockResolvedValueOnce([
          { refreshTokenEncrypted: 'enc', iv: 'iv', authTag: 'tag' },
        ])
      mockAppendTransactionRow.mockResolvedValue(undefined)
      mockDbInsert.mockResolvedValue({ rowCount: 1 })

      const res = await createManualTransactionAction({
        merchant: 'Kopi Kenangan',
        amountIdr: 25000,
        category: 'Makanan & Minuman',
        txDate: '2026-10-13',
        paymentMethod: 'QRIS',
        note: 'Meeting sore',
      })

      expect(res.ok).toBe(true)
      expect(mockAppendTransactionRow).toHaveBeenCalled()
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
    })
  })
})
