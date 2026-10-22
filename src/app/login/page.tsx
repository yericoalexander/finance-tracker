'use client'

import { AlertCircle, CheckSquare, Loader2, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

import { LanguageToggle } from '@/components/ui/language-toggle'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useI18n } from '@/lib/i18n/context'

export default function LoginPage() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignIn() {
    setLoading(true)
    setError(null)
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch {
      setError(t('loginError'))
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
        padding: 'var(--space-5)',
        paddingTop: 'calc(var(--space-4) + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(var(--space-6) + env(safe-area-inset-bottom, 0px))',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '390px',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        {/* Top Controls: Theme & Language Switcher */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <ThemeToggle />
          <LanguageToggle />
        </div>

        {/* Header App Info */}
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-1)',
              fontWeight: 700,
            }}
          >
            Finance Tracker
          </p>
          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: 'var(--color-text)',
              lineHeight: 1.25,
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Catat pengeluaran
            <br />
            tanpa ribet.
          </h1>
          <p
            style={{
              marginTop: 'var(--space-2)',
              color: 'var(--color-text-muted)',
              fontSize: '0.85rem',
              lineHeight: 1.5,
              margin: 'var(--space-2) 0 0 0',
            }}
          >
            Screenshot struk atau bukti transfer di iPhone, langsung masuk ke Google Sheets milikmu.
          </p>
        </div>

        {/* Card Utama */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-5)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          {/* Card Panduan Centang Izin Google Drive */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--color-accent)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span
                style={{
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accent-text)',
                }}
              >
                {t('loginDriveNoticeBadge')}
              </span>
            </div>

            <h2
              style={{
                fontSize: '0.92rem',
                fontWeight: 700,
                color: 'var(--color-text)',
                margin: 0,
                lineHeight: 1.35,
              }}
            >
              {t('loginDriveNoticeTitle')}
            </h2>

            <p
              style={{
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {t('loginDriveNoticeDesc')}
            </p>

            {/* Visual Box Preview Kotak Centang yang akan dilihat di layar Google */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-2)',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                marginTop: 'var(--space-1)',
              }}
            >
              <CheckSquare
                size={18}
                style={{
                  color: 'var(--color-accent)',
                  flexShrink: 0,
                  marginTop: '1px',
                }}
              />
              <span
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--color-text)',
                  fontWeight: 600,
                  lineHeight: 1.45,
                }}
              >
                {t('loginCheckboxSample')}
              </span>
            </div>

            <p
              style={{
                fontSize: '0.73rem',
                color: 'var(--color-warning-text)',
                margin: 0,
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            >
              ⚠️ {t('loginCheckboxWarning')}
            </p>
          </div>

          {/* Pesan Error jika Ada */}
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
                fontSize: '0.82rem',
                color: 'var(--color-error)',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Tombol Utama Masuk Google */}
          <button
            type="button"
            onClick={handleSignIn}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-3)',
              minHeight: '48px',
              padding: `var(--space-3) var(--space-5)`,
              backgroundColor: loading ? 'var(--color-border)' : 'var(--color-text)',
              color: loading ? 'var(--color-text-muted)' : 'var(--color-bg)',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontFamily: 'inherit',
              fontSize: '0.94rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: `opacity var(--duration-base) var(--ease-default)`,
              width: '100%',
              boxShadow: 'var(--shadow-sm)',
            }}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                <span>{t('loginConnecting')}</span>
              </>
            ) : (
              <>
                <GoogleIcon />
                <span>{t('loginBtnGoogle')}</span>
              </>
            )}
          </button>

          {/* Info Ringkasan Izin Privasi */}
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-2)',
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          >
            <ShieldCheck
              size={16}
              style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
              {t('loginPermissionSummary')}
            </div>
          </div>

          {/* Terms & Privacy Links */}
          <p
            style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {t('loginTermsNotice')}{' '}
            <Link
              href="/ketentuan"
              style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}
            >
              {t('termsOfService')}
            </Link>{' '}
            &{' '}
            <Link
              href="/privasi"
              style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}
            >
              {t('privacyPolicy')}
            </Link>
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
