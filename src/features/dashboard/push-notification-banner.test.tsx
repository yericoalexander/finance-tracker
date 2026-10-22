import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PushNotificationBanner } from './push-notification-banner'

vi.mock('@/lib/push/client', () => ({
  registerAndSubscribePush: vi.fn().mockResolvedValue({ ok: true }),
  requestAndSubscribePush: vi.fn().mockResolvedValue({ ok: true, permission: 'granted' }),
}))

vi.mock('./reminder-actions', () => ({
  sendTestNotificationAction: vi.fn().mockResolvedValue({ ok: true, sentCount: 1 }),
}))

describe('PushNotificationBanner', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('tidak menampilkan banner jika permission sudah granted', () => {
    Object.defineProperty(window, 'Notification', {
      value: { permission: 'granted' },
      writable: true,
      configurable: true,
    })

    const { container } = render(<PushNotificationBanner />)
    expect(container.firstChild).toBeNull()
  })

  it('menampilkan banner jika permission masih default', () => {
    Object.defineProperty(window, 'Notification', {
      value: { permission: 'default', requestPermission: vi.fn() },
      writable: true,
      configurable: true,
    })

    render(<PushNotificationBanner />)
    expect(screen.getByText('Notifikasi Pengingat Pengeluaran')).toBeInTheDocument()
    expect(screen.getByText('Izinkan Notifikasi Langsung')).toBeInTheDocument()
  })

  it('berhasil meminta izin dan menampilkan status sukses', async () => {
    Object.defineProperty(window, 'Notification', {
      value: { permission: 'default' },
      writable: true,
      configurable: true,
    })

    render(<PushNotificationBanner />)
    const btn = screen.getByText('Izinkan Notifikasi Langsung')
    fireEvent.click(btn)

    await waitFor(() => {
      expect(screen.getByText('Notifikasi HP Berhasil Aktif!')).toBeInTheDocument()
    })
  })

  it('menyembunyikan banner saat tombol X diklik', () => {
    Object.defineProperty(window, 'Notification', {
      value: { permission: 'default' },
      writable: true,
      configurable: true,
    })

    const { container } = render(<PushNotificationBanner />)
    const closeBtn = screen.getByLabelText('Tutup banner notifikasi')
    fireEvent.click(closeBtn)

    expect(container.firstChild).toBeNull()
    expect(sessionStorage.getItem('dismissed_push_banner')).toBe('true')
  })
})
