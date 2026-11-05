'use client'

import {
  ArrowRight,
  BellRing,
  Camera,
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
import { SetupGateModeCard, type SetupMode } from './setup-gate-mode-card'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { ThemeToggle } from '@/components/ui/theme-toggle'
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
const SHORTCUT_NAME = 'Finance Tracker'

export function SetupGate({ user, onSignOut }: SetupGateProps) {
  const router = useRouter()
  const { t, locale } = useI18n()
  const firstName = user.name?.split(' ')[0] ?? (locale === 'en' ? 'User' : 'Kamu')

  const [selectedMode, setSelectedMode] = useState<SetupMode>('notification')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deviceToken, setDeviceToken] = useState<string | null>(null)

  async function handleOneClickSetup() {
    setLoading(true)
    setError(null)
    try {
      const modeLabel =
        selectedMode === 'notification'
          ? `iPhone Notifikasi (${firstName})`
          : `iPhone Back Tap (${firstName})`

      const res = await createDirectDeviceTokenAction(modeLabel)
      if (!res.ok || !res.deviceToken) {
        setError(res.error ?? t('errCreateAccess'))
        setLoading(false)
        return
      }

      const activeToken = res.deviceToken
      setDeviceToken(activeToken)

      // Otomatis salin token akun ke clipboard pengguna
      try {
        await navigator.clipboard.writeText(activeToken)
      } catch {
        // Clipboard fallback jika browser membatasi izin
      }

      // 1. Langsung buka sheet resmi Apple "Tambahkan Pintasan"
      window.open(ICLOUD_SHORTCUT_URL, '_blank')

      // 2. Hubungkan token langsung ke pintasan via URL Scheme
      setTimeout(() => {
        const autoUrl = `shortcuts://run-shortcut?name=${encodeURIComponent(SHORTCUT_NAME)}&input=text&text=${encodeURIComponent(activeToken)}`
        window.location.href = autoUrl
      }, 1200)
    } catch {
      setError(t('errNetworkConnect'))
    } finally {
      setLoading(false)
    }
  }

  function handleReconnectShortcut() {
    if (!deviceToken) return
    const autoUrl = `shortcuts://run-shortcut?name=${encodeURIComponent(SHORTCUT_NAME)}&input=text&text=${encodeURIComponent(deviceToken)}`
    window.location.href = autoUrl
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

      {/* Header Selamat Datang */}
      <div
        style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}
      >
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
            maxWidth: '340px',
            margin: 0,
            lineHeight: 1.45,
          }}
        >
          {t('setupGateSubtitle', { name: firstName })}
        </p>
      </div>

      {/* Konten Utama */}
      {deviceToken ? (
        /* ================= TAMPILAN SESUDAH INSTALASI (COMPLETED) ================= */
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
              <h2
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  margin: 0,
                  color: 'var(--color-text)',
                }}
              >
                {t('setupGateReadyTitle')}
              </h2>
              <p
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--color-text-muted)',
                  margin: '2px 0 0 0',
                }}
              >
                {t('setupGateReadySub', { email: user.email ?? '' })}
              </p>
            </div>
          </div>

          {/* Tombol Hubungkan Ulang (Jika URL Scheme Terlewat) */}
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
              <Sparkles size={16} style={{ color: 'var(--color-accent)' }} />
              <strong style={{ fontSize: '0.82rem', color: 'var(--color-text)' }}>
                {t('setupGateStepTitle')}
              </strong>
            </div>
            <p
              style={{
                fontSize: '0.76rem',
                color: 'var(--color-text-muted)',
                margin: 0,
                lineHeight: 1.45,
              }}
            >
              {t('setupGateStepDesc')}
            </p>
            <button
              type="button"
              onClick={handleReconnectShortcut}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
                minHeight: '44px',
                width: '100%',
                marginTop: 'var(--space-1)',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accent-text)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              <Sparkles size={16} />
              <span>{t('setupGateBtnConnectAuto')}</span>
            </button>
          </div>

          {/* Panduan Spesifik Berdasarkan Mode yang Dipilih */}
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
              {selectedMode === 'notification' ? (
                <BellRing size={16} style={{ color: 'var(--color-accent)' }} />
              ) : (
                <Smartphone size={16} style={{ color: 'var(--color-accent)' }} />
              )}
              <strong style={{ fontSize: '0.84rem', color: 'var(--color-text)' }}>
                {selectedMode === 'notification'
                  ? t('setupGateActiveNotifTitle')
                  : t('setupGateActiveBacktapTitle')}
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
                gap: '4px',
              }}
            >
              {selectedMode === 'notification' ? (
                <>
                  <li>{t('setupGateActiveNotifStep1')}</li>
                  <li>{t('setupGateActiveNotifStep2')}</li>
                  <li>{t('setupGateActiveNotifStep3')}</li>
                </>
              ) : (
                <>
                  <li>{t('setupGateActiveBacktapStep1')}</li>
                  <li>{t('setupGateActiveBacktapStep2')}</li>
                  <li>{t('setupGateActiveBacktapStep3')}</li>
                </>
              )}
            </ol>
          </div>

          {/* Banner Tips: Dukungan Ganda */}
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontSize: '0.76rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.45,
            }}
          >
            {t('setupGateDualSupportTip')}
          </div>

          {/* Opsi Unduh Ulang iCloud jika diperlukan */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-2) var(--space-3)',
              backgroundColor: 'transparent',
              fontSize: '0.76rem',
              color: 'var(--color-text-muted)',
            }}
          >
            <span>{t('setupGateNotInstalledYet')}</span>
            <button
              type="button"
              onClick={() => window.open(ICLOUD_SHORTCUT_URL, '_blank')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                color: 'var(--color-accent)',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <span>{t('setupGateBtnInstallIcloud')}</span>
              <ExternalLink size={13} />
            </button>
          </div>

          {/* Panduan Layar Utama */}
          <HomeScreenGuideCard defaultExpanded={false} />

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
            <span>{t('setupGateBtnFinishDashboard')}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        /* ================= TAMPILAN PILIH METODE (SEBELUM INSTALASI) ================= */
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
          {/* Label Prompt Pemilihan */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Sparkles size={16} style={{ color: 'var(--color-accent)' }} />
            <strong style={{ fontSize: '0.86rem', color: 'var(--color-text)' }}>
              {t('setupGateSelectModePrompt')}
            </strong>
          </div>

          {/* 2 Opsi Pemilihan Metode */}
          <div
            role="radiogroup"
            aria-label={t('setupGateSelectModePrompt')}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
          >
            {/* Opsi 1: Otomatis Notifikasi Bank */}
            <SetupGateModeCard
              mode="notification"
              selected={selectedMode === 'notification'}
              onSelect={setSelectedMode}
              icon={<BellRing size={18} />}
              title={t('setupGateModeNotifTitle')}
              badge={t('setupGateModeNotifBadge')}
              description={t('setupGateModeNotifDesc')}
            />

            {/* Opsi 2: Back Tap Foto Struk */}
            <SetupGateModeCard
              mode="backtap"
              selected={selectedMode === 'backtap'}
              onSelect={setSelectedMode}
              icon={<Camera size={18} />}
              title={t('setupGateModeBacktapTitle')}
              badge={t('setupGateModeBacktapBadge')}
              description={t('setupGateModeBacktapDesc')}
            />
          </div>

          {/* Petunjuk Singkat Sesuai Pilihan */}
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
              <ShieldCheck size={16} style={{ color: 'var(--color-accent)' }} />
              <strong style={{ fontSize: '0.82rem', color: 'var(--color-text)' }}>
                {selectedMode === 'notification'
                  ? t('setupGateNotifQuickGuideTitle')
                  : t('setupGateBacktapQuickGuideTitle')}
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
              {selectedMode === 'notification' ? (
                <>
                  <li>{t('setupGateNotifGuideItem1')}</li>
                  <li>{t('setupGateNotifGuideItem2')}</li>
                  <li>{t('setupGateNotifGuideItem3')}</li>
                </>
              ) : (
                <>
                  <li>{t('setupGateBacktapGuideItem1')}</li>
                  <li>{t('setupGateBacktapGuideItem2')}</li>
                  <li>{t('setupGateBacktapGuideItem3')}</li>
                </>
              )}
            </ol>
          </div>

          {error && (
            <p style={{ color: 'var(--color-error)', fontSize: '0.78rem', margin: 0 }}>{error}</p>
          )}

          {/* Tombol Utama 1-Klik Spesifik Mode */}
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
              transition: 'all 180ms ease',
            }}
          >
            {loading ? (
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            ) : selectedMode === 'notification' ? (
              <BellRing size={18} />
            ) : (
              <Camera size={18} />
            )}
            <span>
              {loading
                ? t('setupGateBtnInstalling')
                : selectedMode === 'notification'
                  ? t('setupGateNotifBtnInstall')
                  : t('setupGateBacktapBtnInstall')}
            </span>
          </button>

          {/* Panduan Pasang di Layar Utama iPhone */}
          <HomeScreenGuideCard defaultExpanded={false} />

          {/* Opsi Lewati & Logout */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 'var(--space-1)',
            }}
          >
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
