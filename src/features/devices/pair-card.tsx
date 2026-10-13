'use client'

import { Check, Copy, KeyRound, Loader2, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'

import { createPairingCodeAction } from './actions'

export function PairCard() {
  const [code, setCode] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [secondsLeft, setSecondsLeft] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerateCode() {
    setLoading(true)
    setError(null)
    setCopied(false)
    try {
      const res = await createPairingCodeAction()
      if (res.ok && res.code && res.expiresAt) {
        setCode(res.code)
        const exp = new Date(res.expiresAt)
        setExpiresAt(exp)
        setSecondsLeft(Math.max(0, Math.floor((exp.getTime() - Date.now()) / 1000)))
      } else {
        setError(res.error ?? 'Gagal membuat kode')
      }
    } catch {
      setError('Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  // Countdown timer effect
  useEffect(() => {
    if (!expiresAt) return

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
      setSecondsLeft(remaining)
      if (remaining <= 0) {
        setCode(null)
        setExpiresAt(null)
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [expiresAt])

  function handleCopy() {
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
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
        <KeyRound size={20} style={{ color: 'var(--color-accent)' }} />
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            margin: 0,
            color: 'var(--color-text)',
          }}
        >
          Hubungkan Perangkat Baru
        </h2>
      </div>

      <p
        style={{
          fontSize: '0.82rem',
          color: 'var(--color-text-muted)',
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        Buat kode sekali pakai di bawah ini dan masukkan ke Shortcut iOS Anda saat pertama kali
        menjalankan setup.
      </p>

      {error && (
        <p style={{ color: 'var(--color-error)', fontSize: '0.8rem', margin: 0 }}>
          {error}
        </p>
      )}

      {code ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-surface-raised)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--color-border)',
          }}
        >
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '2rem',
              fontWeight: 700,
              letterSpacing: '0.25em',
              color: 'var(--color-text)',
            }}
          >
            {code}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: '0.78rem',
              color: 'var(--color-text-muted)',
            }}
          >
            <span>Berlaku hingga:</span>
            <span
              style={{
                fontWeight: 600,
                color: secondsLeft < 60 ? 'var(--color-error)' : 'var(--color-accent)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatTimer(secondsLeft)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            aria-label="Salin kode"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              minHeight: '44px',
              padding: `var(--space-2) var(--space-4)`,
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.84rem',
              fontWeight: 500,
              color: 'var(--color-text)',
              cursor: 'pointer',
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleGenerateCode}
        disabled={loading}
        aria-label="Buat kode pairing baru"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-2)',
          minHeight: '44px',
          width: '100%',
          padding: `var(--space-3) var(--space-4)`,
          backgroundColor: 'var(--color-accent)',
          color: 'var(--color-accent-text)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600,
          fontSize: '0.9rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
        ) : (
          <RefreshCw size={16} />
        )}
        <span>{code ? 'Buat Kode Baru Lainnya' : 'Buat Kode Pairing'}</span>
      </button>
    </div>
  )
}
