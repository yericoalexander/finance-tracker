'use client'

import {
  ArrowRight,
  CheckCircle2,
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
import { HomeScreenGuideCard } from './home-screen-guide-card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { useI18n } from '@/lib/i18n/context'

interface SetupGateProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  icloudShortcutUrl?: string
  onSignOut: () => Promise<void>
}

const ICLOUD_SHORTCUT_URL = 'https://www.icloud.com/shortcuts/4d6a9040bd104b02b91f2a198b0d8bef'

export function SetupGate({ user, onSignOut }: SetupGateProps) {
  const router = useRouter()
  const { t, locale } = useI18n()
  const firstName = user.name?.split(' ')[0] ?? (locale === 'en' ? 'User' : 'Kamu')
  const deviceLabel = locale === 'en' ? `${firstName}'s iPhone` : `iPhone ${firstName}`

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deviceToken, setDeviceToken] = useState<string | null>(null)

  async function handleOneClickSetup() {
    setLoading(true)
    setError(null)
    try {
      const res = await createDirectDeviceTokenAction(deviceLabel)
      if (!res.ok || !res.deviceToken) {
        setError(res.error ?? t('errCreateAccess'))
        setLoading(false)
        return
      }

      setDeviceToken(res.deviceToken)

      // Otomatis salin token pribadi ke clipboard pengguna
      try {
        await navigator.clipboard.writeText(res.deviceToken)
      } catch {
        // Fallback jika browser membatasi izin clipboard
      }

      // Langsung buka sheet native iOS "Tambahkan Pintasan"
      window.open(ICLOUD_SHORTCUT_URL, '_blank')
    } catch {
      setError(t('errNetworkConnect'))
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
      {/* Top Bar Switchers */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--space-2)' }}>
        <ThemeToggle />
        <LanguageToggle />
      </div>

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
          {t('setupGateTitle')}
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
          {t('setupGateSubtitle', { name: firstName })}
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
                {t('setupGateReadyTitle')}
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                {t('setupGateReadySub', { email: user.email ?? '' })}
              </p>
            </div>
          </div>

          {/* Tombol Utama: Hubungkan Otomatis 1-Klik */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Sparkles size={18} style={{ color: 'var(--color-accent)' }} />
              <strong style={{ fontSize: '0.86rem', color: 'var(--color-text)' }}>
                {t('setupGateStepTitle')}
              </strong>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.45 }}>
              {t('setupGateStepDesc')}
            </p>
            <button
              type="button"
              onClick={() => {
                const url = `shortcuts://run-shortcut?name=${encodeURIComponent('Finance Tracker')}&input=text&text=${encodeURIComponent(deviceToken)}`
                window.location.href = url
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
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Sparkles size={18} />
              <span>{t('setupGateBtnConnectAuto')}</span>
            </button>
          </div>

          {/* Opsi Bagi yang Belum Pasang Pintasan */}
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
            <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              {t('setupGateNotInstalledYet')}
            </p>
            <button
              type="button"
              onClick={() => window.open(ICLOUD_SHORTCUT_URL, '_blank')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                minHeight: '40px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <ExternalLink size={14} />
              <span>{t('setupGateBtnInstallIcloud')}</span>
            </button>
          </div>

          {/* Pengingat Penting: Atur Back Tap */}
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-accent)',
            }}
          >
            <Smartphone size={20} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--color-text)', display: 'block', marginBottom: '2px' }}>
                {t('backTapReminderTitle')}
              </strong>
              {t('backTapReminderDesc')}
            </div>
          </div>

          {/* Panduan Tambah ke Layar Utama iPhone */}
          <HomeScreenGuideCard defaultExpanded={true} />

          {/* Tombol Lanjut ke Dashboard */}
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
              backgroundColor: 'transparent',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
            }}
          >
            <span>{t('setupGateBtnFinishDashboard')}</span>
            <ArrowRight size={16} />
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
                {t('setupGateQuickGuideTitle')}
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
              <li>{t('setupGateGuideItem1')}</li>
              <li>{t('setupGateGuideItem2')}</li>
              <li>{t('setupGateGuideItem3')}</li>
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
            <span>{loading ? t('setupGateBtnInstalling') : t('setupGateBtnInstall1Click')}</span>
          </button>

          {/* Panduan Pasang di Layar Utama iPhone */}
          <HomeScreenGuideCard defaultExpanded={false} />

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
              {t('setupGateSkipWithoutIphone')}
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
              <span>{t('setupGateLogout')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
