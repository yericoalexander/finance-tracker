'use client'

import {
  Check,
  Copy,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'

import { createDirectDeviceTokenAction } from './actions'

interface DirectSetupCardProps {
  userName?: string
}

interface SetupResult {
  token: string
  shortcutsUrl: string
  endpoint: string
}

const ICLOUD_SHORTCUT_URL = 'https://www.icloud.com/shortcuts/4d6a9040bd104b02b91f2a198b0d8bef'
const SHORTCUT_NAME = 'Finance Tracker'

function buildShortcutsUrl(endpoint: string, token: string): string {
  const payload = JSON.stringify({
    action: 'setup',
    endpoint,
    token,
  })
  return `shortcuts://run-shortcut?name=${encodeURIComponent(SHORTCUT_NAME)}&input=text&text=${encodeURIComponent(payload)}`
}

export function DirectSetupCard({ userName }: DirectSetupCardProps) {
  const defaultLabel = `iPhone ${userName?.split(' ')[0] ?? 'Saya'}`
  const [deviceLabel, setDeviceLabel] = useState(defaultLabel)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SetupResult | null>(null)
  const [copiedType, setCopiedType] = useState<'token' | 'endpoint' | null>(null)
  const [showManualDetails, setShowManualDetails] = useState(false)

  async function handleDirectSetup() {
    setLoading(true)
    setError(null)
    try {
      const res = await createDirectDeviceTokenAction(deviceLabel)
      if (!res.ok || !res.deviceToken) {
        setError(res.error ?? 'Gagal membuat akses perangkat')
        return
      }

      // Otomatis salin token pribadi ke clipboard pengguna
      try {
        await navigator.clipboard.writeText(res.deviceToken)
        setCopiedType('token')
      } catch {
        // Fallback jika browser membatasi izin clipboard
      }

      // Token berhasil dibuat
      const endpoint = `${window.location.origin}/api/capture`
      const shortcutsUrl = buildShortcutsUrl(endpoint, res.deviceToken)

      setResult({
        token: res.deviceToken,
        shortcutsUrl,
        endpoint,
      })
    } catch {
      setError('Terjadi kendala jaringan saat menghubungkan')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy(text: string, type: 'token' | 'endpoint') {
    navigator.clipboard.writeText(text)
    setCopiedType(type)
    setTimeout(() => setCopiedType(null), 2000)
  }

  function handleReset() {
    setResult(null)
    setError(null)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        padding: 'var(--space-5)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <Smartphone size={20} style={{ color: 'var(--color-accent)' }} />
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            margin: 0,
            color: 'var(--color-text)',
          }}
        >
          Hubungkan iPhone Otomatis
        </h2>
      </div>

      {!result ? (
        <>
          <p
            style={{
              fontSize: '0.84rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Hubungkan iPhone Anda ke <strong>Finance Tracker</strong> untuk mencatat pengeluaran otomatis via Back Tap.
          </p>

          {/* Nama Perangkat */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label
              htmlFor="device-label-input"
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
              }}
            >
              Label Perangkat
            </label>
            <input
              id="device-label-input"
              type="text"
              value={deviceLabel}
              onChange={(e) => setDeviceLabel(e.target.value)}
              placeholder="Contoh: iPhone Rico"
              maxLength={40}
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '0 var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-raised)',
                color: 'var(--color-text)',
                fontFamily: 'inherit',
                fontSize: '0.88rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Konfirmasi Izin Pemilik */}
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
            }}
          >
            <ShieldCheck size={18} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--color-text)' }}>Privat &amp; Aman:</strong> Setiap perangkat
              memiliki token unik terenkripsi dan hanya menulis transaksi ke Google Sheets akun Anda.
            </div>
          </div>

          {error && (
            <p style={{ color: 'var(--color-error)', fontSize: '0.8rem', margin: 0 }}>
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleDirectSetup}
            disabled={loading}
            aria-label="Buat akses dan hubungkan iPhone"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              minHeight: '48px',
              width: '100%',
              padding: `var(--space-3) var(--space-4)`,
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-text)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity var(--duration-fast)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {loading ? (
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Sparkles size={18} />
            )}
            <span>{loading ? 'Menyiapkan Akses...' : 'Buat Akses iPhone (1-Klik)'}</span>
          </button>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {/* Status Sukses */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              fontSize: '0.86rem',
              fontWeight: 600,
            }}
          >
            <Check size={18} style={{ color: 'var(--color-accent)' }} />
            <span>Akses iPhone Berhasil Dibuat!</span>
          </div>

          {/* Tombol Utama: Hubungkan Otomatis ke iPhone */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid var(--color-accent)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Sparkles size={18} style={{ color: 'var(--color-accent)' }} />
              <strong style={{ fontSize: '0.88rem', color: 'var(--color-text)' }}>
                Hubungkan ke iPhone Otomatis (1-Klik)
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
              Ketuk tombol di bawah. iPhone Anda akan langsung membuka Pintasan dan menyambungkan akun Anda otomatis tanpa perlu ketik apapun.
            </p>
            <button
              type="button"
              onClick={() => {
                const autoUrl = `shortcuts://run-shortcut?name=${encodeURIComponent('Finance Tracker')}&input=text&text=${encodeURIComponent(result.token)}`
                window.location.href = autoUrl
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
                minHeight: '48px',
                width: '100%',
                marginTop: 'var(--space-1)',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accent-text)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'inherit',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Sparkles size={18} />
              <span>⚡ Hubungkan ke iPhone Sekarang</span>
            </button>
          </div>

          {/* Opsi Pasang Pintasan jika belum ada di iPhone */}
          <button
            type="button"
            onClick={() => window.open(ICLOUD_SHORTCUT_URL, '_blank')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              minHeight: '42px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span>📲 Belum punya pintasan? Pasang dari iCloud</span>
          </button>

          {/* Toggle Detail Manual */}
          <button
            type="button"
            onClick={() => setShowManualDetails(!showManualDetails)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--color-text-muted)',
              fontSize: '0.78rem',
              cursor: 'pointer',
              padding: 'var(--space-1) 0',
              textDecoration: 'underline',
              textAlign: 'center',
            }}
          >
            {showManualDetails ? 'Sembunyikan Nilai Teknis' : 'Ingin Salin Token / Endpoint Manual?'}
          </button>

          {showManualDetails && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-surface-raised)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '0.78rem',
              }}
            >
              <div>
                <p style={{ margin: '0 0 var(--space-1) 0', color: 'var(--color-text-muted)' }}>
                  URL Endpoint Capture:
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <input
                    readOnly
                    value={result.endpoint}
                    style={{
                      flex: 1,
                      minHeight: '38px',
                      padding: '0 var(--space-2)',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-text)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(result.endpoint, 'endpoint')}
                    style={{
                      minHeight: '38px',
                      padding: '0 var(--space-3)',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-text)',
                      cursor: 'pointer',
                    }}
                  >
                    {copiedType === 'endpoint' ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <p style={{ margin: '0 0 var(--space-1) 0', color: 'var(--color-text-muted)' }}>
                  Token Perangkat Rahasia:
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <input
                    readOnly
                    value={result.token}
                    style={{
                      flex: 1,
                      minHeight: '38px',
                      padding: '0 var(--space-2)',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-text)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(result.token, 'token')}
                    style={{
                      minHeight: '38px',
                      padding: '0 var(--space-3)',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-text)',
                      cursor: 'pointer',
                    }}
                  >
                    {copiedType === 'token' ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-1)',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--color-text-muted)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              padding: 'var(--space-2)',
            }}
          >
            <RotateCcw size={14} />
            <span>Hubungkan Perangkat Lainnya</span>
          </button>
        </div>
      )}
    </div>
  )
}
