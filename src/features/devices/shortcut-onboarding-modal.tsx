'use client'

import { ExternalLink, ShieldAlert, Smartphone, Sparkles, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ShortcutOnboardingModalProps {
  hasActiveDevice: boolean
  userName?: string
}

export function ShortcutOnboardingModal({
  hasActiveDevice,
  userName,
}: ShortcutOnboardingModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  useEffect(() => {
    // Jika sudah ada perangkat aktif, tidak perlu menampilkan onboarding
    if (hasActiveDevice) return

    // Cek apakah user sudah menutup modal pada sesi ini
    const dismissed = sessionStorage.getItem('dismissed_shortcut_prompt')
    if (!dismissed) {
      setIsOpen(true)
    }
  }, [hasActiveDevice])

  function handleDismiss() {
    sessionStorage.setItem('dismissed_shortcut_prompt', 'true')
    setIsOpen(false)
  }

  function handleGoToPair() {
    sessionStorage.setItem('dismissed_shortcut_prompt', 'true')
    setIsOpen(false)
    router.push('/pair')
  }

  if (!isOpen || !mounted) return null

  const firstName = userName?.split(' ')[0] ?? 'Kamu'

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        animation: 'fadeIn var(--duration-fast) var(--ease-default)',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          padding: 'var(--space-5)',
          width: '100%',
          maxWidth: '400px',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          position: 'relative',
        }}
      >
        {/* Tombol Tutup Silang di Kanan Atas */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Tutup jendela saran"
          style={{
            position: 'absolute',
            top: 'var(--space-4)',
            right: 'var(--space-4)',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            padding: 'var(--space-1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '44px',
            minWidth: '44px',
          }}
        >
          <X size={20} />
        </button>

        {/* Header Ikon & Judul */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-accent)',
              flexShrink: 0,
            }}
          >
            <Smartphone size={22} />
          </div>
          <div>
            <h2
              id="onboarding-modal-title"
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                margin: 0,
                color: 'var(--color-text)',
                lineHeight: 1.3,
              }}
            >
              Pasang Pintasan iPhone
            </h2>
            <p
              style={{
                fontSize: '0.78rem',
                color: 'var(--color-text-muted)',
                margin: '2px 0 0 0',
              }}
            >
              Halo {firstName}, siapkan integrasi otomatis
            </p>
          </div>
        </div>

        {/* Deskripsi Manfaat */}
        <p
          style={{
            fontSize: '0.84rem',
            color: 'var(--color-text-muted)',
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Aplikasi ini mencatat pengeluaran langsung dari tangkapan layar iPhone Anda via{' '}
          <strong style={{ color: 'var(--color-text)' }}>Ketuk Bagian Belakang (Back Tap)</strong> dalam
          2 detik.
        </p>

        {/* Peringatan Wajib: Disarankan Allow Semua / Selalu Izinkan */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-surface-raised)',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid var(--color-accent)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <ShieldAlert size={18} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
            <strong style={{ fontSize: '0.86rem', color: 'var(--color-text)' }}>
              Wajib: Pilih &quot;Selalu Izinkan&quot;
            </strong>
          </div>
          <p
            style={{
              fontSize: '0.78rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.45,
              margin: 0,
            }}
          >
            Saat iPhone memunculkan konfirmasi izin jaringan untuk pertama kali:
          </p>
          <div
            style={{
              padding: 'var(--space-2)',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--color-border)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--color-text)',
              textAlign: 'center',
            }}
          >
            👉 Pilih: <span style={{ color: 'var(--color-accent)' }}>Selalu Izinkan (Always Allow)</span>
          </div>
          <p
            style={{
              fontSize: '0.73rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.35,
              margin: 0,
            }}
          >
            Pastikan tidak memilih &quot;Jangan Izinkan&quot; agar pengiriman struk belanja ke Google
            Sheets Anda tidak terblokir oleh iOS.
          </p>
        </div>

        {/* Tombol Aksi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <button
            type="button"
            onClick={handleGoToPair}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              minHeight: '48px',
              width: '100%',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-text)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Sparkles size={16} />
            <span>Pasang Sekarang (1-Klik)</span>
            <ExternalLink size={15} />
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            style={{
              minHeight: '44px',
              width: '100%',
              backgroundColor: 'transparent',
              color: 'var(--color-text-muted)',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Nanti Saja
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
