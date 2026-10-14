'use client'

import {
  CheckCircle2,
  Loader2,
  LogOut,
  ShieldCheck,
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

const ICLOUD_SHORTCUT_URL = 'https://www.icloud.com/shortcuts/829aa46d8e254e1683b528945e1749c9'

export function SetupGate({ user, onSignOut }: SetupGateProps) {
  const router = useRouter()
  const firstName = user.name?.split(' ')[0] ?? 'Kamu'
  const deviceLabel = `iPhone ${firstName}`

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleOneClickSetup() {
    setLoading(true)
    setError(null)
    try {
      const res = await createDirectDeviceTokenAction(deviceLabel)
      if (!res.ok || !res.deviceToken) {
        setError(res.error ?? 'Gagal membuat akses perangkat')
        setLoading(false)
        return
      }

      // 1. Langsung buka sheet native iOS "Tambahkan Pintasan"
      window.open(ICLOUD_SHORTCUT_URL, '_blank')

      setIsSuccess(true)

      // 2. Beri waktu user untuk menambahkan pintasan, lalu buka Dashboard
      setTimeout(() => {
        router.refresh()
      }, 2500)
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
          Pasang Pintasan iPhone
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
          Halo <strong>{firstName}</strong>! Pasang pintasan <em>Finance Tracker</em> ke iPhone Anda untuk
          mulai mencatat pengeluaran otomatis.
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
              Ketuk <strong>Tambahkan Pintasan</strong> di iPhone Anda. Membuka dashboard...
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
          {/* Instruksi 1-Langkah Jelas */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <ShieldCheck size={18} style={{ color: 'var(--color-accent)' }} />
              <strong style={{ fontSize: '0.86rem', color: 'var(--color-text)' }}>
                Petunjuk Cepat di Layar iPhone:
              </strong>
            </div>
            <ol
              style={{
                fontSize: '0.78rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.5,
                margin: 0,
                paddingLeft: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
              }}
            >
              <li>
                Ketuk tombol <strong>&quot;Pasang &amp; Hubungkan Pintasan&quot;</strong> di bawah.
              </li>
              <li>
                iPhone akan membuka pop-up: ketuk{' '}
                <strong style={{ color: 'var(--color-text)' }}>Tambahkan Pintasan (Add Shortcut)</strong>.
              </li>
              <li>
                Saat pertama kali dipakai, pilih:{' '}
                <strong style={{ color: 'var(--color-accent)' }}>Selalu Izinkan (Always Allow)</strong>.
              </li>
            </ol>
          </div>

          {error && (
            <p style={{ color: 'var(--color-error)', fontSize: '0.78rem', margin: 0 }}>
              {error}
            </p>
          )}

          {/* Tombol Utama 1-Klik Tunggal */}
          <button
            type="button"
            onClick={handleOneClickSetup}
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
              fontSize: '0.92rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {loading ? (
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Sparkles size={18} />
            )}
            <span>{loading ? 'Menghubungkan...' : 'Pasang & Hubungkan Pintasan (1-Klik)'}</span>
          </button>

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
