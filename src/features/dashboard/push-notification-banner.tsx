'use client'

import { Bell, CheckCircle2, ChevronRight, Loader2, Share, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { sendTestNotificationAction } from './reminder-actions'
import { registerAndSubscribePush, requestAndSubscribePush } from '@/lib/push/client'

type BannerState = 'loading' | 'hidden' | 'prompt' | 'ios_guide' | 'success'

export function PushNotificationBanner() {
  const [state, setState] = useState<BannerState>('loading')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testSuccess, setTestSuccess] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const dismissed = sessionStorage.getItem('dismissed_push_banner') === 'true'
    if (dismissed) {
      setState('hidden')
      return
    }

    // Periksa apakah browser mendukung Notification API
    const hasNotification = 'Notification' in window
    if (hasNotification) {
      if (window.Notification.permission === 'granted') {
        // Sinkronkan token langganan push di background jika sudah diizinkan
        void registerAndSubscribePush().catch(() => null)
        setState('hidden')
      } else if (window.Notification.permission === 'default') {
        setState('prompt')
      } else {
        setState('hidden')
      }
      return
    }

    // Jika di iOS Safari biasa (bukan PWA di Layar Utama), Web Push membutuhkan PWA
    const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent)
    const isStandalone =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(display-mode: standalone)').matches
        : Boolean((navigator as unknown as { standalone?: boolean }).standalone)

    if (isIos && !isStandalone) {
      setState('ios_guide')
    } else {
      setState('hidden')
    }
  }, [])

  const handleDismiss = () => {
    sessionStorage.setItem('dismissed_push_banner', 'true')
    setState('hidden')
  }

  const handleEnablePush = async () => {
    setIsSubscribing(true)
    try {
      const res = await requestAndSubscribePush()
      if (res.ok) {
        setState('success')
        // Otomatis kirim notifikasi uji coba agar langsung muncul di layar HP
        void sendTestNotificationAction()
          .then((testRes) => {
            if (testRes.ok) setTestSuccess(true)
          })
          .catch(() => null)
      } else if (res.permission === 'denied') {
        setState('hidden')
      }
    } finally {
      setIsSubscribing(false)
    }
  }

  const handleSendTest = async () => {
    setIsTesting(true)
    try {
      const res = await sendTestNotificationAction()
      if (res.ok) {
        setTestSuccess(true)
        setTimeout(() => setTestSuccess(false), 4000)
      }
    } finally {
      setIsTesting(false)
    }
  }

  if (state === 'loading' || state === 'hidden') {
    return null
  }

  // Tampilan Berhasil: Notifikasi Aktif
  if (state === 'success') {
    return (
      <div
        className="animate-slide-up"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          padding: 'var(--space-4)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                }}
              >
                Notifikasi HP Berhasil Aktif!
              </p>
              <p
                style={{
                  margin: '2px 0 0 0',
                  fontSize: '0.8rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                Peringatan anggaran akan otomatis muncul langsung di layar HP Anda.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Tutup pemberitahuan"
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
          <button
            type="button"
            onClick={handleSendTest}
            disabled={isTesting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              minHeight: '44px',
              padding: '0 var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isTesting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Mengirim Notifikasi...</span>
              </>
            ) : testSuccess ? (
              <>
                <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                <span>Terkirim ke Layar HP!</span>
              </>
            ) : (
              <>
                <Bell size={16} />
                <span>Kirim Uji Coba Notifikasi</span>
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  // Panduan Tambah ke Layar Utama iPhone jika di Safari biasa
  if (state === 'ios_guide') {
    return (
      <div
        className="animate-slide-up"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          padding: 'var(--space-4)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                color: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Share size={18} />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                }}
              >
                Aktifkan Notifikasi Langsung di iPhone
              </p>
              <p
                style={{
                  margin: '2px 0 0 0',
                  fontSize: '0.8rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                Agar notifikasi dapat muncul langsung di lockscreen tanpa membuka web:
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Tutup panduan"
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-surface-raised)',
            borderRadius: 'var(--radius-lg)',
            fontSize: '0.82rem',
            color: 'var(--color-text)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>1.</span>
            <span>
              Ketuk tombol <strong>Bagikan (Share ⎋)</strong> di baris bawah Safari.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>2.</span>
            <span>
              Pilih <strong>Tambah ke Layar Utama (Add to Home Screen)</strong>.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>3.</span>
            <span>Buka Finance Tracker dari Layar Utama lalu ketuk Izinkan Notifikasi.</span>
          </div>
        </div>
      </div>
    )
  }

  // Tampilan Default: Tombol 1-Klik Izinkan Notifikasi Langsung
  return (
    <div
      className="animate-slide-up"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              color: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Bell size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                }}
              >
                Notifikasi Pengingat Pengeluaran
              </p>
              <Sparkles size={14} style={{ color: 'var(--color-accent)' }} />
            </div>
            <p
              style={{
                margin: '2px 0 0 0',
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.4,
              }}
            >
              Terima peringatan otomatis langsung dari aplikasi saat pengeluaran mendekati atau
              melewati batas anggaran.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Tutup banner notifikasi"
          style={{
            background: 'none',
            border: 'none',
            padding: '6px',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            minWidth: '44px',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button
          type="button"
          onClick={handleEnablePush}
          disabled={isSubscribing}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-2)',
            minHeight: '44px',
            padding: '0 var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-accent-text)',
            border: 'none',
            fontSize: '0.86rem',
            fontWeight: 600,
            cursor: isSubscribing ? 'not-allowed' : 'pointer',
            opacity: isSubscribing ? 0.8 : 1,
            flex: 1,
          }}
        >
          {isSubscribing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Mengaktifkan...</span>
            </>
          ) : (
            <>
              <Bell size={16} />
              <span>Izinkan Notifikasi Langsung</span>
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
