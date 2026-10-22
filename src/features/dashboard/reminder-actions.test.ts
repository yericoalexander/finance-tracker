import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockAuth = vi.fn()

vi.mock('@/auth', () => ({
  auth: () => mockAuth(),
}))

vi.mock('@/lib/db/client', () => ({
  db: {
    query: {
      reminderSettings: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(),
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/push/send-push', () => ({
  sendPushNotificationToUser: vi.fn().mockResolvedValue({ sent: 1, failed: 0 }),
}))

vi.mock('./reminder-evaluator', () => ({
  evaluateBudgetReminder: vi.fn().mockResolvedValue({ shouldAlert: false }),
}))

import {
  getReminderSettingsAction,
  updateReminderSettingsAction,
  sendTestNotificationAction,
} from './reminder-actions'

describe('reminder-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getReminderSettingsAction', () => {
    it('mengembalikan error jika user belum terautentikasi', async () => {
      mockAuth.mockResolvedValueOnce(null)

      const result = await getReminderSettingsAction()
      expect(result.ok).toBe(false)
      expect(result.error).toContain('Sesi telah berakhir')
    })
  })

  describe('updateReminderSettingsAction', () => {
    it('mengembalikan error jika user belum terautentikasi', async () => {
      mockAuth.mockResolvedValueOnce(null)

      const result = await updateReminderSettingsAction({
        monthlyLimitIdr: 1500000,
        customMessage: 'Awas boros',
        isEnabled: true,
      })
      expect(result.ok).toBe(false)
      expect(result.error).toContain('Sesi telah berakhir')
    })

    it('menolak nominal limit di bawah Rp 10.000', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: 'test-user-id' },
        expires: '2099-01-01',
      })

      const result = await updateReminderSettingsAction({
        monthlyLimitIdr: 5000,
        customMessage: 'Awas boros',
        isEnabled: true,
      })
      expect(result.ok).toBe(false)
      expect(result.error).toContain('minimal Rp 10.000')
    })

    it('menolak pesan custom yang melebihi 150 karakter', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: 'test-user-id' },
        expires: '2099-01-01',
      })

      const longMessage = 'A'.repeat(151)
      const result = await updateReminderSettingsAction({
        monthlyLimitIdr: 1500000,
        customMessage: longMessage,
        isEnabled: true,
      })
      expect(result.ok).toBe(false)
      expect(result.error).toContain('maksimal 150 karakter')
    })

    it('menolak persentase threshold di luar rentang 0-100', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: 'test-user-id' },
        expires: '2099-01-01',
      })

      const result = await updateReminderSettingsAction({
        monthlyLimitIdr: 1500000,
        warningThresholdPercent: 120,
        isEnabled: true,
      })
      expect(result.ok).toBe(false)
    })
  })

  describe('sendTestNotificationAction', () => {
    it('mengembalikan error jika user belum terautentikasi', async () => {
      mockAuth.mockResolvedValueOnce(null)

      const result = await sendTestNotificationAction()
      expect(result.ok).toBe(false)
      expect(result.error).toContain('Sesi telah berakhir')
    })

    it('berhasil mengirim notifikasi uji coba saat user terautentikasi', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: 'test-user-id' },
        expires: '2099-01-01',
      })

      const result = await sendTestNotificationAction()
      expect(result.ok).toBe(true)
      expect(result.sentCount).toBe(1)
    })
  })
})

