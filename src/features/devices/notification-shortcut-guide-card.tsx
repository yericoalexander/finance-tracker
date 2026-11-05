'use client'

import { useState } from 'react'
import {
  BellRing,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  Zap,
} from 'lucide-react'
import { createDirectDeviceTokenAction } from './actions'
import { useI18n } from '@/lib/i18n/context'

interface NotificationShortcutGuideCardProps {
  deviceToken?: string | null
}

const ICLOUD_SHORTCUT_URL = 'https://www.icloud.com/shortcuts/4d6a9040bd104b02b91f2a198b0d8bef'
const SHORTCUT_NAME = 'Finance Tracker'

export function NotificationShortcutGuideCard({
  deviceToken: initialDeviceToken,
}: NotificationShortcutGuideCardProps) {
  const { t } = useI18n()
  const [deviceToken, setDeviceToken] = useState<string | null>(initialDeviceToken ?? null)
  const [isExpanded, setIsExpanded] = useState(true)
  const [loading, setLoading] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  // 1-Klik Pasang & Konfigurasi Otomatis ke iPhone
  async function handleOneClickAutoSetup() {
    setLoading(true)
    try {
      let activeToken = deviceToken
      if (!activeToken) {
        const res = await createDirectDeviceTokenAction('iPhone Auto-Notif')
        if (res.ok && res.deviceToken) {
          activeToken = res.deviceToken
          setDeviceToken(res.deviceToken)
        }
      }

      if (activeToken) {
        try {
          await navigator.clipboard.writeText(activeToken)
        } catch {
          // Clipboard fallback
        }
      }

      // 1. Buka sheet resmi Apple "Tambahkan Pintasan"
      window.open(ICLOUD_SHORTCUT_URL, '_blank')

      // 2. Hubungkan token langsung ke shortcut via URL scheme
      if (activeToken) {
        setTimeout(() => {
          const autoUrl = `shortcuts://run-shortcut?name=${encodeURIComponent(SHORTCUT_NAME)}&input=text&text=${encodeURIComponent(activeToken)}`
          window.location.href = autoUrl
        }, 1200)
      }

      setIsInstalled(true)
    } finally {
      setLoading(false)
    }
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
        border: '2px solid var(--color-accent)',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
      }}
    >
      {/* Top Badge: Rekomendasi Utama (Highlighted Clean & Elegant) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-accent-text)',
          }}
        >
          {t('notifGuideBadge')}
        </span>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label={isExpanded ? t('notifCloseGuideAria') : t('notifOpenGuideAria')}
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Zap size={18} />
        </div>
        <div>
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              margin: 0,
              color: 'var(--color-text)',
              letterSpacing: '-0.01em',
            }}
          >
            {t('notifGuideTitle')}
          </h2>
          <p
            style={{
              fontSize: '0.78rem',
              color: 'var(--color-text-muted)',
              margin: '2px 0 0 0',
            }}
          >
            {t('notifGuideSub')}
          </p>
        </div>
      </div>

      {/* Ringkasan Nilai Fitur */}
      <div
        style={{
          padding: 'var(--space-3) var(--space-4)',
          backgroundColor: 'var(--color-surface-raised)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          fontSize: '0.78rem',
          color: 'var(--color-text-muted)',
          lineHeight: 1.5,
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start',
        }}
      >
        <BellRing size={16} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
        <span>{t('notifGuideSummary')}</span>
      </div>

      {/* Tombol Utama: Pasang Pintasan 1-Klik Elegan */}
      <button
        type="button"
        onClick={handleOneClickAutoSetup}
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
          fontFamily: 'inherit',
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
        ) : isInstalled ? (
          <Check size={18} />
        ) : (
          <Zap size={18} />
        )}
        <span>
          {loading
            ? t('notifGuideBtnInstalling')
            : isInstalled
              ? t('notifGuideBtnInstalled')
              : t('notifGuideBtnInstall')}
        </span>
      </button>

      {/* Konten Langkah Setup (100% Otomatis - Tanpa Ketik URL / Headers) */}
      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {/* Langkah 1 */}
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
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accent-text)',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              1
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-text)' }}>
                {t('notifStep1Title')}
              </span>
              <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                {t('notifStep1Desc')}
              </span>
            </div>
          </div>

          {/* Langkah 2 */}
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
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accent-text)',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              2
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-text)' }}>
                {t('notifStep2Title')}
              </span>
              <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                {t('notifStep2Desc')}
              </span>
            </div>
          </div>

          {/* Langkah 3 */}
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
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accent-text)',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              3
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-text)' }}>
                {t('notifStep3Title')}
              </span>
              <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                {t('notifStep3Desc')}
              </span>
            </div>
          </div>

          {/* Tips Selesai */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontSize: '0.76rem',
              color: 'var(--color-text)',
              lineHeight: 1.45,
            }}
          >
            <Sparkles size={16} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
            <span>{t('notifTipsDesc')}</span>
          </div>
        </div>
      )}
    </div>
  )
}
