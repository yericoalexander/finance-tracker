import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockAuth = vi.fn()
const mockRevalidatePath = vi.fn()
const mockFindMany = vi.fn()
const mockFindFirst = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()

vi.mock('@/auth', () => ({
  auth: () => mockAuth(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: (path: string) => mockRevalidatePath(path),
}))

vi.mock('@/lib/db/client', () => ({
  db: {
    query: {
      wallets: {
        findMany: (...args: unknown[]) => mockFindMany(...args),
        findFirst: (...args: unknown[]) => mockFindFirst(...args),
      },
    },
    insert: () => ({
      values: () =>
        Object.assign(Promise.resolve(mockInsert()), {
          returning: () => Promise.resolve(mockInsert()),
        }),
    }),
    update: () => ({
      set: () => ({
        where: () => mockUpdate(),
      }),
    }),
    delete: () => ({
      where: () => mockDelete(),
    }),
  },
}))

describe('Wallet Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getWalletsAction returns error if unauthenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const { getWalletsAction } = await import('./actions')
    const res = await getWalletsAction()
    expect(res.ok).toBe(false)
    expect(res.error).toContain('Sesi berakhir')
  })

  it('getWalletsAction returns custom wallets from DB', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-123' } })
    mockFindMany.mockResolvedValue([
      {
        id: 'w-1',
        userId: 'user-123',
        name: 'SeaBank',
        balanceIdr: 432000,
        themeId: 'seabank',
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const { getWalletsAction } = await import('./actions')
    const res = await getWalletsAction()
    expect(res.ok).toBe(true)
    expect(res.data).toHaveLength(1)
    expect(res.data?.[0]?.name).toBe('SeaBank')
  })

  it('createWalletAction rejects invalid form input', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-123' } })
    const { createWalletAction } = await import('./actions')
    const res = await createWalletAction({ name: '', balanceIdr: -100, themeId: 'bca' })
    expect(res.ok).toBe(false)
  })

  it('createWalletAction inserts wallet and revalidates dashboard', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-123' } })
    mockFindMany.mockResolvedValue([])
    mockInsert.mockResolvedValue([
      {
        id: 'w-new',
        userId: 'user-123',
        name: 'Krom Bisnis',
        balanceIdr: 10000000,
        themeId: 'krom',
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const { createWalletAction } = await import('./actions')
    const res = await createWalletAction({
      name: 'Krom Bisnis',
      balanceIdr: 10000000,
      themeId: 'krom',
    })

    expect(res.ok).toBe(true)
    expect(res.data?.name).toBe('Krom Bisnis')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
  })

  it('quickAdjustWalletAction updates balance correctly', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-123' } })
    mockFindFirst.mockResolvedValue({
      id: 'w-1',
      balanceIdr: 50000,
    })
    mockUpdate.mockResolvedValue([{ id: 'w-1' }])

    const { quickAdjustWalletAction } = await import('./actions')
    const res = await quickAdjustWalletAction('w-1', -10000)

    expect(res.ok).toBe(true)
    expect(res.newBalance).toBe(40000)
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
  })

  it('transferBetweenWalletsAction transfers balance between two wallets', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-123' } })
    mockFindFirst
      .mockResolvedValueOnce({
        id: 'w-source',
        name: 'SeaBank',
        balanceIdr: 500000,
      })
      .mockResolvedValueOnce({
        id: 'w-dest',
        name: 'Krom',
        balanceIdr: 100000,
      })

    const { transferBetweenWalletsAction } = await import('./actions')
    const res = await transferBetweenWalletsAction({
      sourceWalletId: '11111111-1111-1111-1111-111111111111',
      destWalletId: '22222222-2222-2222-2222-222222222222',
      amountIdr: 50000,
    })

    expect(res.ok).toBe(true)
    expect(res.sourceWallet?.newBalance).toBe(450000)
    expect(res.destWallet?.newBalance).toBe(150000)
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
  })
})

