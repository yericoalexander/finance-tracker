import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock dependencies
const mockDbSelect = vi.fn()
const mockDbInsert = vi.fn()
const mockDbUpdate = vi.fn()
const mockDbDelete = vi.fn()
const mockAppendTransactionRow = vi.fn()
const mockDeleteTransactionRow = vi.fn()
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
          then: (resolve: (v: unknown) => void, reject?: (e: unknown) => void) =>
            Promise.resolve(mockDbSelect()).then(resolve, reject),
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
    delete: () => ({
      where: () => mockDbDelete(),
    }),
  },
}))

vi.mock('@/lib/crypto', () => ({
  decrypt: () => 'mock-refresh-token',
}))

vi.mock('@/lib/google/sheets', () => ({
  appendTransactionRow: (...args: unknown[]) => mockAppendTransactionRow(...args),
  deleteTransactionRow: (...args: unknown[]) => mockDeleteTransactionRow(...args),
}))

const { approveReviewAction, dismissReviewAction, getMonthSummaryAction, deleteTransactionAction } = await import('./actions')
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

  describe('getMonthSummaryAction', () => {
    it('mengembalikan error jika belum login', async () => {
      mockAuth.mockResolvedValue(null)
      const res = await getMonthSummaryAction('2026-10')
      expect(res.ok).toBe(false)
      expect(res.error).toContain('Sesi telah berakhir')
    })

    it('mengembalikan error jika format bulan tidak valid', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-123' } })
      const res = await getMonthSummaryAction('2026/10')
      expect(res.ok).toBe(false)
      expect(res.error).toContain('Format bulan tidak valid')
    })

    it('berhasil mengembalikan total, txCount, dan categoryBreakdown jika valid', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-123' } })
      mockDbSelect.mockResolvedValueOnce([
        { amountIdr: 50000, category: 'Makanan & Minuman' },
        { amountIdr: 25000, category: 'Makanan & Minuman' },
        { amountIdr: 25000, category: 'Transportasi' },
      ])

      const res = await getMonthSummaryAction('2026-09')
      expect(res.ok).toBe(true)
      expect(res.data?.total).toBe(100000)
      expect(res.data?.txCount).toBe(3)
      expect(res.data?.categoryBreakdown).toHaveLength(2)
      expect(res.data?.categoryBreakdown[0]?.category).toBe('Makanan & Minuman')
      expect(res.data?.categoryBreakdown[0]?.total).toBe(75000)
      expect(res.data?.categoryBreakdown[0]?.percentage).toBe(75)
    })
  })

  describe('deleteTransactionAction', () => {
    it('mengembalikan error jika belum login', async () => {
      mockAuth.mockResolvedValue(null)
      const res = await deleteTransactionAction('tx-123')
      expect(res.ok).toBe(false)
      expect(res.error).toContain('Sesi telah berakhir')
    })

    it('mengembalikan error jika transaksi tidak ditemukan', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-123' } })
      mockDbSelect.mockResolvedValueOnce([]) // captureRecord not found
      const res = await deleteTransactionAction('tx-nonexistent')
      expect(res.ok).toBe(false)
      expect(res.error).toBe('Transaksi tidak ditemukan')
    })

    it('berhasil menghapus dari database dan memanggil deleteTransactionRow di Google Sheets', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-123' } })
      // 1. captureRecord
      mockDbSelect.mockResolvedValueOnce([
        {
          id: 'tx-123',
          userId: 'user-123',
          merchant: 'Kopi Kenangan',
          amountIdr: 25000,
          txDate: '2026-10-15',
        },
      ])
      // 2. userRecord
      mockDbSelect.mockResolvedValueOnce([{ sheetId: 'sheet-123' }])
      // 3. tokenRecord
      mockDbSelect.mockResolvedValueOnce([
        {
          refreshTokenEncrypted: 'enc',
          iv: 'iv',
          authTag: 'tag',
        },
      ])
      mockDeleteTransactionRow.mockResolvedValue({ deleted: true, rowIndex: 5 })

      const res = await deleteTransactionAction('tx-123')
      expect(res.ok).toBe(true)
      expect(mockDeleteTransactionRow).toHaveBeenCalledWith(
        'mock-refresh-token',
        'sheet-123',
        'tx-123',
        expect.objectContaining({
          merchant: 'Kopi Kenangan',
          amountIdr: 25000,
          date: '2026-10-15',
        }),
      )
      expect(mockDbDelete).toHaveBeenCalled()
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
    })
  })
})

