'use client'

import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
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
  const [deviceToken, setDeviceToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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

      setDeviceToken(res.deviceToken)

      // Otomatis salin token pribadi ke clipboard pengguna
      try {
        await navigator.clipboard.writeText(res.deviceToken)
        setCopied(true)
      } catch {
        // Fallback jika browser membatasi izin clipboard
      }

      // Langsung buka sheet native iOS "Tambahkan Pintasan"
      window.open(ICLOUD_SHORTCUT_URL, '_blank')
    } catch {
      setError('Terjadi kendala jaringan saat menghubungkan')
    } finally {
      setLoading(false)
    }
  }

  function handleCopyToken(token: string) {
    navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
          mulai mencatat pengeluaran otomatis ke Google Sheets pribadi.
        </p>
      </div>

      {deviceToken ? (
        <div
          style={{
            padding: 'var(--space-5)',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '2px solid var(--color-accent)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <CheckCircle2 size={24} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                Pintasan Dibuka di Layar iPhone!
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                Simpan token ini agar pengeluaran masuk ke spreadsheet Anda sendiri
              </p>
            </div>
          </div>

          {/* Kartu Token Pribadi */}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: '0.82rem', color: 'var(--color-text)' }}>
                🔑 Token Pribadi Anda
              </strong>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                {copied ? '✅ Tersalin di clipboard' : 'Khusus Akun Anda'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                readOnly
                value={deviceToken}
                style={{
                  flex: 1,
                  minHeight: '40px',
                  padding: '0 var(--space-3)',
                  fontSize: '0.76rem',
                  fontFamily: 'monospace',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text)',
                }}
              />
              <button
                type="button"
                onClick={() => handleCopyToken(deviceToken)}
                style={{
                  minHeight: '40px',
                  padding: '0 var(--space-3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accent-text)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              Token ini menjamin catatan keuangan Anda <strong>100% masuk ke Google Sheets pribadi</strong> ({user.email}).
            </p>
          </div>

          {/* Langkah Jelas di iPhone */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              fontSize: '0.8rem',
              lineHeight: 1.5,
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
            }}
          >
            <strong style={{ fontSize: '0.84rem', color: 'var(--color-text)' }}>
              Langkah Cepat di iPhone:
            </strong>
            <ol
              style={{
                margin: 0,
                paddingLeft: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                color: 'var(--color-text-muted)',
              }}
            >
              <li>
                Ketuk tombol <strong style={{ color: 'var(--color-text)' }}>&quot;Tambahkan Pintasan&quot;</strong> di layar pop-up iPhone.
              </li>
              <li>
                Buka aplikasi <strong style={{ color: 'var(--color-text)' }}>Pintasan</strong> → ketuk titik tiga <code>...</code> pada <strong>Finance Tracker</strong> → di bagian <em>Authorization</em>, pastikan terisi <strong>Token Pribadi</strong> Anda di atas.
              </li>
              <li>
                Saat pertama kali scan struk, pilih <strong style={{ color: 'var(--color-text)' }}>Selalu Izinkan (Always Allow)</strong>.
              </li>
            </ol>
          </div>

          {/* Tombol Aksi Buka Dashboard */}
          <button
            type="button"
            onClick={() => router.refresh()}
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
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <span>Buka Dashboard</span>
            <ArrowRight size={18} />
          </button>

          {/* Link cadangan jika pop-up iCloud tidak terbuka */}
          <button
            type="button"
            onClick={() => window.open(ICLOUD_SHORTCUT_URL, '_blank')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              fontSize: '0.74rem',
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline',
            }}
          >
            <ExternalLink size={13} />
            <span>Buka Ulang Pintasan iCloud jika belum muncul</span>
          </button>
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
