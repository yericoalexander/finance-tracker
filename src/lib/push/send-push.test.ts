import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockFindMany = vi.fn()
const mockDeleteWhere = vi.fn().mockResolvedValue(undefined)
const mockDelete = vi.fn().mockReturnValue({ where: mockDeleteWhere })

vi.mock('@/lib/db/client', () => ({
  db: {
    query: {
      pushSubscriptions: {
        findMany: () => mockFindMany(),
      },
    },
    delete: () => mockDelete(),
  },
}))

const mockSendNotification = vi.fn()
const mockSetVapidDetails = vi.fn()

vi.mock('web-push', () => ({
  default: {
    setVapidDetails: (...args: unknown[]) => mockSetVapidDetails(...args),
    sendNotification: (...args: unknown[]) => mockSendNotification(...args),
  },
}))

vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: 'test-pub-key',
    VAPID_PRIVATE_KEY: 'test-priv-key',
    VAPID_SUBJECT: 'mailto:test@example.com',
  },
}))

import { sendPushNotificationToUser } from './send-push'

describe('sendPushNotificationToUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mengembalikan { sent: 0, failed: 0 } jika pengguna tidak memiliki langganan push', async () => {
    mockFindMany.mockResolvedValue([])

    const result = await sendPushNotificationToUser('user-1', {
      title: 'Peringatan',
      body: 'Pengeluaran mendekati batas',
    })

    expect(result).toEqual({ sent: 0, failed: 0 })
    expect(mockSendNotification).not.toHaveBeenCalled()
  })

  it('berhasil mengirim push notification ke perangkat yang terdaftar', async () => {
    mockFindMany.mockResolvedValue([
      {
        id: 'sub-1',
        userId: 'user-1',
        endpoint: 'https://push.apple.com/endpoint-1',
        p256dh: 'p256dh-key',
        auth: 'auth-key',
      },
    ])
    mockSendNotification.mockResolvedValue({ statusCode: 201 })

    const result = await sendPushNotificationToUser('user-1', {
      title: '🚨 Batas Anggaran',
      body: 'Pengeluaran melebihi limit',
    })

    expect(result).toEqual({ sent: 1, failed: 0 })
    expect(mockSendNotification).toHaveBeenCalledTimes(1)
  })

  it('menghapus langganan dari database jika endpoint mengembalikan status 410 Gone', async () => {
    mockFindMany.mockResolvedValue([
      {
        id: 'sub-dead',
        userId: 'user-1',
        endpoint: 'https://push.apple.com/dead',
        p256dh: 'p256dh-key',
        auth: 'auth-key',
      },
    ])
    const error410 = new Error('Gone')
    ;(error410 as unknown as { statusCode: number }).statusCode = 410
    mockSendNotification.mockRejectedValue(error410)

    const result = await sendPushNotificationToUser('user-1', {
      title: 'Peringatan',
      body: 'Test',
    })

    expect(result).toEqual({ sent: 0, failed: 1 })
    expect(mockDelete).toHaveBeenCalled()
  })
})
