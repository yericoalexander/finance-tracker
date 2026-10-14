'use client'

import {
  Check,
  CheckCircle2,
  ExternalLink,
  Info,
  Loader2,
  LogOut,
  Smartphone,
  Sparkles,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { createDirectDeviceTokenAction } from './actions'

interface SetupGateProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  icloudShortcutUrl?: string
  onSignOut: () => Promise<void>
}

export function SetupGate({ user, icloudShortcutUrl, onSignOut }: SetupGateProps) {
  const router = useRouter()
  const firstName = user.name?.split(' ')[0] ?? 'Kamu'
  const defaultIcloudUrl =
    icloudShortcutUrl ||
    process.env.NEXT_PUBLIC_SHORTCUT_ICLOUD_URL ||
    'https://www.icloud.com/shortcuts/829aa46d8e254e1683b528945e1749c9'

  const deviceLabel = `iPhone ${firstName}`
  const [step1Done, setStep1Done] = useState(false)
  const [shortcutName, setShortcutName] = useState('Finance Tracker')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  function handleOpenAddShortcut() {
    setStep1Done(true)
    window.open(defaultIcloudUrl, '_blank')
  }

  async function handleConnectDevice() {
    setLoading(true)
    setError(null)
    try {
      const res = await createDirectDeviceTokenAction(deviceLabel)
      if (!res.ok || !res.deviceToken) {
        setError(res.error ?? 'Gagal membuat akses perangkat')
        setLoading(false)
        return
      }

      const endpoint = `${window.location.origin}/api/capture`
      const payload = JSON.stringify({
        action: 'setup',
        endpoint,
        token: res.deviceToken,
      })
      const trimmedName = shortcutName.trim() || 'Finance Tracker'
      const runUrl = `shortcuts://run-shortcut?name=${encodeURIComponent(trimmedName)}&input=text&text=${encodeURIComponent(payload)}`

      // Buka pintasan untuk simpan token otomatis
      window.location.href = runUrl

      setIsSuccess(true)

      // Refresh dashboard setelah 2 detik agar gate terbuka
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch {
      setError('Terjadi kendala jaringan saat menghubungkan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
        paddingTop: 'calc(var(--space-6) + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(var(--space-8) + env(safe-area-inset-bottom, 0px))',
        minHeight: '100svh',
        justifyContent: 'center',
      }}
    >
      {/* Header Selamat Datang */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-accent)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Smartphone size={28} />
        </div>
        <h1
          style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: 'var(--color-text)',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Siapkan Pintasan iPhone
        </h1>
        <p
          style={{
            fontSize: '0.84rem',
            color: 'var(--color-text-muted)',
            maxWidth: '320px',
            margin: 0,
            lineHeight: 1.45,
          }}
        >
          Halo <strong>{firstName}</strong>! Pasang dan hubungkan Pintasan ke iPhone Anda sebelum mulai
          menggunakan aplikasi.
        </p>
      </div>

      {isSuccess ? (
        <div
          style={{
            padding: 'var(--space-5)',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '2px solid var(--color-accent)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 'var(--space-3)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <CheckCircle2 size={40} style={{ color: 'var(--color-accent)' }} />
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
              iPhone Berhasil Terhubung!
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
              Pintasan siap digunakan dengan Back Tap. Membuka dashboard...
            </p>
          </div>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-accent)' }} />
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            padding: 'var(--space-5)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* LANGKAH 1: Tambahkan Pintasan (Add Shortcut) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-lg)',
              border: step1Done ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: step1Done ? 'var(--color-accent)' : 'var(--color-border)',
                    color: step1Done ? 'var(--color-accent-text)' : 'var(--color-text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {step1Done ? <Check size={14} /> : '1'}
                </div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                  Tambahkan Pintasan ke iPhone
                </h3>
              </div>
              {step1Done && (
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-accent)' }}>
                  ✓ Terpasang
                </span>
              )}
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4 }}>
              Ketuk tombol di bawah. Di layar iPhone Anda, ketuk tombol biru{' '}
              <strong style={{ color: 'var(--color-text)' }}>&quot;Tambahkan Pintasan&quot; (Add Shortcut)</strong>.
            </p>

            <button
              type="button"
              onClick={handleOpenAddShortcut}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
                minHeight: '44px',
                width: '100%',
                backgroundColor: step1Done ? 'var(--color-surface)' : 'var(--color-accent)',
                color: step1Done ? 'var(--color-text)' : 'var(--color-accent-text)',
                border: step1Done ? '1px solid var(--color-border)' : 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '0.86rem',
                cursor: 'pointer',
              }}
            >
              <ExternalLink size={15} />
              <span>{step1Done ? 'Buka Ulang Tautan Pintasan' : '1. Tambahkan Pintasan Sekarang'}</span>
            </button>
          </div>

          {/* LANGKAH 2: Hubungkan Akun (1-Klik) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accent-text)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                Hubungkan ke Akun Kamu
              </h3>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4 }}>
              Setelah pintasan ditambahkan, hubungkan akun kamu agar struk belanja otomatis masuk ke
              Google Sheets pribadi.
            </p>

            {/* Nama Pintasan */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                Nama Pintasan di iPhone:
              </span>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {(['Finance Tracker', 'Catat Pengeluaran'] as const).map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setShortcutName(name)}
                    style={{
                      flex: 1,
                      minHeight: '38px',
                      padding: 'var(--space-1) var(--space-2)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor:
                        shortcutName === name ? 'var(--color-accent)' : 'var(--color-surface)',
                      color:
                        shortcutName === name ? 'var(--color-accent-text)' : 'var(--color-text)',
                      fontSize: '0.78rem',
                      fontWeight: shortcutName === name ? 700 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Peringatan Selalu Izinkan */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-3)',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--color-accent)',
                fontSize: '0.74rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.4,
              }}
            >
              <Info size={16} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '1px' }} />
              <div>
                <strong>Penting:</strong> Saat iOS memunculkan konfirmasi izin jaringan, wajib pilih{' '}
                <strong style={{ color: 'var(--color-accent)' }}>Selalu Izinkan (Always Allow)</strong>.
              </div>
            </div>

            {error && (
              <p style={{ color: 'var(--color-error)', fontSize: '0.78rem', margin: 0 }}>
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleConnectDevice}
              disabled={loading}
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
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Sparkles size={16} />
              )}
              <span>{loading ? 'Menghubungkan...' : '2. Izinkan & Hubungkan iPhone'}</span>
            </button>
          </div>

          {/* Opsi Lewati & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-1)' }}>
            <button
              type="button"
              onClick={() => router.push('/dashboard?skip=true')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                fontSize: '0.74rem',
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline',
              }}
            >
              Lanjut ke Dashboard tanpa iPhone
            </button>

            <button
              type="button"
              onClick={() => onSignOut()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                color: 'var(--color-error)',
                fontSize: '0.74rem',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <LogOut size={13} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
