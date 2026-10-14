'use client'

import {
  Check,
  Copy,
  ExternalLink,
  Info,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Smartphone,
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

function buildShortcutsUrl(endpoint: string, token: string, shortcutName: string): string {
  const payload = JSON.stringify({
    action: 'setup',
    endpoint,
    token,
  })
  const trimmedName = shortcutName.trim() || 'Finance Tracker'
  return `shortcuts://run-shortcut?name=${encodeURIComponent(trimmedName)}&input=text&text=${encodeURIComponent(payload)}`
}

export function DirectSetupCard({ userName }: DirectSetupCardProps) {
  const defaultLabel = `iPhone ${userName?.split(' ')[0] ?? 'Saya'}`
  const [deviceLabel, setDeviceLabel] = useState(defaultLabel)
  const [shortcutName, setShortcutName] = useState('Finance Tracker')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SetupResult | null>(null)
  const [copiedType, setCopiedType] = useState<'url' | 'token' | 'endpoint' | null>(null)
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

      const endpoint = `${window.location.origin}/api/capture`
      const shortcutsUrl = buildShortcutsUrl(endpoint, res.deviceToken, shortcutName)

      setResult({
        token: res.deviceToken,
        shortcutsUrl,
        endpoint,
      })

      // Otomatis buka aplikasi Pintasan di iPhone
      window.location.href = shortcutsUrl
    } catch {
      setError('Terjadi kendala jaringan saat menghubungkan')
    } finally {
      setLoading(false)
    }
  }

  function handleSwitchShortcutName(newName: string) {
    setShortcutName(newName)
    if (result) {
      const updatedUrl = buildShortcutsUrl(result.endpoint, result.token, newName)
      setResult({
        ...result,
        shortcutsUrl: updatedUrl,
      })
    }
  }

  function handleCopy(text: string, type: 'url' | 'token' | 'endpoint') {
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
          {/* Banner Tambahkan Pintasan jika belum ada */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              gap: 'var(--space-2)',
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.84rem', color: 'var(--color-text)' }}>
                Belum Punya Pintasannya?
              </p>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                Pasang sekali ke iPhone via iCloud resmi Apple.
              </p>
            </div>
            <a
              href="https://www.icloud.com/shortcuts/829aa46d8e254e1683b528945e1749c9"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accent-text)',
                fontSize: '0.78rem',
                fontWeight: 700,
                textDecoration: 'none',
                minHeight: '44px',
                whiteSpace: 'nowrap',
              }}
            >
              <span>+ Pasang Pintasan</span>
              <ExternalLink size={13} />
            </a>
          </div>

          <p
            style={{
              fontSize: '0.84rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Pasang koneksi langsung ke aplikasi Pintasan iPhone tanpa perlu mengetik atau menyalin kode
            secara manual.
          </p>

          {/* Pilihan Nama Pintasan di iPhone */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label
              htmlFor="shortcut-name-select"
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
              }}
            >
              Nama Pintasan di iPhone Anda
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {(['Finance Tracker', 'Catat Pengeluaran'] as const).map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setShortcutName(name)}
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor:
                      shortcutName === name ? 'var(--color-accent)' : 'var(--color-surface-raised)',
                    color:
                      shortcutName === name ? 'var(--color-accent-text)' : 'var(--color-text)',
                    fontSize: '0.82rem',
                    fontWeight: shortcutName === name ? 700 : 500,
                    cursor: 'pointer',
                    minHeight: '44px',
                    transition: 'all var(--duration-fast)',
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', margin: 0 }}>
              💡 Samakan dengan nama pintasan di aplikasi Shortcuts iPhone kamu.
            </p>
          </div>

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
              <strong style={{ color: 'var(--color-text)' }}>Izin Pemilik Akun:</strong> Dengan menekan
              tombol di bawah, Anda mengizinkan pintasan di perangkat ini untuk mengakses akun dan mencatat
              pengeluaran secara otomatis ke Google Sheets Anda.
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
            aria-label="Izinkan dan hubungkan iPhone ini"
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
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity var(--duration-fast)',
            }}
          >
            {loading ? (
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <ExternalLink size={18} />
            )}
            <span>{loading ? 'Menghubungkan...' : `Izinkan & Buka "${shortcutName}" (1-Klik)`}</span>
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
            <span>Pintasan Telah Dikirim ke iPhone!</span>
          </div>

          {/* Pilihan Nama Pintasan Saat Ini */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          >
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              Target Nama Pintasan di iPhone Anda:
            </span>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {(['Finance Tracker', 'Catat Pengeluaran'] as const).map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSwitchShortcutName(name)}
                  style={{
                    flex: 1,
                    minHeight: '44px',
                    padding: 'var(--space-2)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor:
                      shortcutName === name ? 'var(--color-accent)' : 'var(--color-surface)',
                    color:
                      shortcutName === name ? 'var(--color-accent-text)' : 'var(--color-text)',
                    fontSize: '0.82rem',
                    fontWeight: shortcutName === name ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.73rem', color: 'var(--color-text-muted)', margin: 0 }}>
              ⚠️ Jika muncul <em>&quot;Could not find the shortcut&quot;</em>, pilih nama yang sesuai dengan
              kotak pintasan di iPhone kamu, atau pasang pintasannya terlebih dahulu:
            </p>
            <a
              href="https://www.icloud.com/shortcuts/829aa46d8e254e1683b528945e1749c9"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: 'var(--space-2)',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-accent)',
                fontSize: '0.8rem',
                fontWeight: 600,
                textDecoration: 'none',
                minHeight: '40px',
              }}
            >
              <span>+ Pasang Pintasan &quot;Finance Tracker&quot; via iCloud</span>
              <ExternalLink size={14} />
            </a>
          </div>

          {/* PERINGATAN KRUSIAL: Selalu Izinkan */}
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
              <Info size={18} style={{ color: 'var(--color-accent)' }} />
              <strong style={{ fontSize: '0.88rem', color: 'var(--color-text)' }}>
                Langkah Wajib di Layar iPhone:
              </strong>
            </div>
            <p
              style={{
                fontSize: '0.82rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Saat Pintasan berjalan di iPhone, iOS akan memunculkan dialog keamanan:
            </p>
            <div
              style={{
                padding: 'var(--space-2) var(--space-3)',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--color-border)',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--color-text)',
                textAlign: 'center',
              }}
            >
              «Izinkan &quot;{shortcutName}&quot; untuk terhubung?»
              <br />
              👉 <span style={{ color: 'var(--color-accent)' }}>Pilih: Selalu Izinkan (Always Allow)</span>
            </div>
            <p
              style={{
                fontSize: '0.76rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.4,
                margin: 0,
              }}
            >
              Izin ini hanya muncul sekali agar iPhone dapat mengirim tangkapan layar otomatis ke sistem
              keuangan Anda.
            </p>
          </div>

          {/* Tombol Aksi Buka Ulang & Salin Link */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <a
              href={result.shortcutsUrl}
              aria-label={`Buka di aplikasi Pintasan (${shortcutName})`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
                minHeight: '44px',
                width: '100%',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accent-text)',
                textDecoration: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '0.88rem',
              }}
            >
              <ExternalLink size={16} />
              <span>Buka Pintasan &quot;{shortcutName}&quot;</span>
            </a>

            <button
              type="button"
              onClick={() => handleCopy(result.shortcutsUrl, 'url')}
              aria-label="Salin tautan pintasan"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
                minHeight: '44px',
                width: '100%',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 500,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              {copiedType === 'url' ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiedType === 'url' ? 'Tautan Tersalin!' : 'Salin Tautan Pintasan'}</span>
            </button>
          </div>

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
