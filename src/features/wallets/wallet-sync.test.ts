import { describe, expect, it, vi } from 'vitest'
import { applyTransactionToWallets, findMatchingWallet, STARTER_WALLETS } from './wallet-sync'
import type { WalletRecord } from '@/lib/db/schema'

const mockUpdateSet = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) })
const mockUpdate = vi.fn().mockReturnValue({ set: mockUpdateSet })

vi.mock('@/lib/db/client', () => ({
  db: {
    query: {
      wallets: {
        findMany: vi.fn(),
      },
    },
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn(),
      }),
    }),
    update: () => mockUpdate(),
  },
}))

describe('findMatchingWallet', () => {
  const mockWallets: WalletRecord[] = STARTER_WALLETS.map((w, idx) => ({
    id: `mock-uuid-${idx + 1}`,
    userId: 'mock-user-123',
    name: w.name,
    balanceIdr: w.balanceIdr,
    themeId: w.themeId,
    order: w.order,
    createdAt: new Date(),
    updatedAt: new Date(),
  }))

  it('matches exact wallet name (SeaBank)', () => {
    const matched = findMatchingWallet(mockWallets, 'SeaBank')
    expect(matched).toBeDefined()
    expect(matched?.name).toBe('SeaBank')
  })

  it('matches lowercase wallet name (krom)', () => {
    const matched = findMatchingWallet(mockWallets, 'krom')
    expect(matched).toBeDefined()
    expect(matched?.name).toBe('Krom')
  })

  it('matches bank alias from paymentMethod (QRIS BCA)', () => {
    const matched = findMatchingWallet(mockWallets, 'QRIS BCA')
    expect(matched).toBeDefined()
    expect(matched?.name).toBe('BCA')
  })

  it('matches BRIMo to BRI', () => {
    const matched = findMatchingWallet(mockWallets, 'BRImo')
    expect(matched).toBeDefined()
    expect(matched?.name).toBe('BRI')
  })

  it('returns undefined for non-existent wallet query', () => {
    const matched = findMatchingWallet(mockWallets, 'Bank Antartika')
    expect(matched).toBeUndefined()
  })

  it('returns undefined for empty or null query', () => {
    expect(findMatchingWallet(mockWallets, '')).toBeUndefined()
    expect(findMatchingWallet(mockWallets, null)).toBeUndefined()
  })
})

describe('applyTransactionToWallets: Inter-bank transfer', () => {
  it('deducts source (SeaBank) and adds destination (Krom) on transfer', async () => {
    const { db } = await import('@/lib/db/client')
    const walletsList: WalletRecord[] = [
      {
        id: 'seabank-id',
        userId: 'user-rico',
        name: 'SeaBank',
        balanceIdr: 5000000,
        themeId: 'seabank',
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'krom-id',
        userId: 'user-rico',
        name: 'Krom',
        balanceIdr: 2000000,
        themeId: 'krom',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    vi.mocked(db.query.wallets.findMany).mockResolvedValueOnce(walletsList)

    const result = await applyTransactionToWallets('user-rico', {
      amountIdr: 10000,
      sourceBank: 'SeaBank',
      destinationBank: 'Krom',
      isTransfer: true,
      category: 'Transfer Antar Bank',
    })

    expect(result.applied).toBe(true)
    expect(result.isTransfer).toBe(true)
    expect(result.sourceWallet?.name).toBe('SeaBank')
    expect(result.sourceWallet?.newBalance).toBe(4990000)
    expect(result.destWallet?.name).toBe('Krom')
    expect(result.destWallet?.newBalance).toBe(2010000)
    expect(result.summaryMessage).toContain('SeaBank')
    expect(result.summaryMessage).toContain('Krom')
  })
})
