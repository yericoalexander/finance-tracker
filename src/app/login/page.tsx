'use client'

import { AlertCircle, Loader2, ShieldCheck } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignIn() {
    setLoading(true)
    setError(null)
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch {
      setError('Gagal terhubung ke Google. Coba lagi.')
      setLoading(false)
    }
  }

  return (
    <main
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
        paddingBottom: 'calc(var(--space-6) + env(safe-area-inset-bottom))',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '375px',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-8)',
        }}
      >
        {/* Logo / Nama app */}
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-2)',
            }}
          >
            Finance Tracker
          </p>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--color-text)',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            Catat pengeluaran
            <br />
            tanpa ribet.
          </h1>
          <p
            style={{
              marginTop: 'var(--space-3)',
              color: 'var(--color-text-muted)',
              fontSize: '0.9rem',
              lineHeight: 1.6,
            }}
          >
            Screenshot struk atau bukti transfer di iPhone,
            langsung masuk ke Google Sheets milikmu.
          </p>
        </div>

        {/* Card tombol + info izin */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-5)',
          }}
        >
          {/* Info izin */}
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-accent-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <ShieldCheck
              size={18}
              style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }}
            />
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text)', lineHeight: 1.5 }}>
              <strong>Izin yang diminta:</strong> akses email dan akun Google, serta
              membuat file spreadsheet baru di Google Drive milikmu.
              Kami tidak membaca file lain di Drive-mu.
            </div>
          </div>

          {/* Pesan error */}
          {error && (
            <div
              role="alert"
              style={{
                display: 'flex',
                gap: 'var(--space-2)',
                alignItems: 'center',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-error-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                color: 'var(--color-error)',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* Tombol utama */}
          <button
            onClick={handleSignIn}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-3)',
              minHeight: '44px',
              padding: `var(--space-3) var(--space-5)`,
              backgroundColor: loading ? 'var(--color-border)' : 'var(--color-text)',
              color: loading ? 'var(--color-text-muted)' : 'var(--color-bg)',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: `background-color var(--duration-base) var(--ease-default),
                           opacity var(--duration-base) var(--ease-default)`,
              width: '100%',
            }}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Menghubungkan...
              </>
            ) : (
              <>
                <GoogleIcon />
                Lanjutkan dengan Google
              </>
            )}
          </button>

          <p
            style={{
              textAlign: 'center',
              fontSize: '0.78rem',
              color: 'var(--color-text-muted)',
              margin: 0,
            }}
          >
            Dengan masuk, kamu menyetujui{' '}
            <a href="/ketentuan" style={{ color: 'var(--color-accent)' }}>
              Ketentuan Layanan
            </a>{' '}
            dan{' '}
            <a href="/privasi" style={{ color: 'var(--color-accent)' }}>
              Kebijakan Privasi
            </a>
            .
          </p>
        </div>
      </div>

      {/* Keyframe spin untuk loader */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}
