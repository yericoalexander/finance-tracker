'use client'

import { Sparkles } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

export function ShortcutGuideCard() {
  const { t } = useI18n()

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
        <Sparkles size={20} style={{ color: 'var(--color-accent)' }} />
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            margin: 0,
            color: 'var(--color-text)',
          }}
        >
          {t('guideCardTitle')}
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {/* Step 1: Pasang Pintasan */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            padding: 'var(--space-3)',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p
              style={{
                margin: 0,
                fontWeight: 600,
                fontSize: '0.86rem',
                color: 'var(--color-text)',
              }}
            >
              {t('guideStep1Title')}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.4,
              }}
            >
              {t('guideStep1Desc')}
            </p>
          </div>
        </div>

        {/* Step 2: Hubungkan Otomatis */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            padding: 'var(--space-3)',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p
              style={{
                margin: 0,
                fontWeight: 600,
                fontSize: '0.86rem',
                color: 'var(--color-text)',
              }}
            >
              {t('guideStep2Title')}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.4,
              }}
            >
              {t('guideStep2Desc')}
            </p>
          </div>
        </div>

        {/* Step 3: Selalu Izinkan */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            padding: 'var(--space-3)',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p
              style={{
                margin: 0,
                fontWeight: 600,
                fontSize: '0.86rem',
                color: 'var(--color-text)',
              }}
            >
              {t('guideStep3Title')}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.4,
              }}
            >
              {t('guideStep3Desc')}
            </p>
          </div>
        </div>

        {/* Step 4: Aktifkan Back Tap */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            padding: 'var(--space-3)',
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
            4
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p
              style={{
                margin: 0,
                fontWeight: 600,
                fontSize: '0.86rem',
                color: 'var(--color-text)',
              }}
            >
              {t('guideStep4Title')}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.4,
              }}
            >
              {t('guideStep4Desc')}
            </p>
          </div>
        </div>
      </div>

      {/* Catatan Sederhana Cara Pakai */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-3)',
          backgroundColor: 'var(--color-surface-raised)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          fontSize: '0.8rem',
          color: 'var(--color-text-muted)',
          lineHeight: 1.4,
        }}
      >
        <span>💡</span>
        <span>{t('guideDoneTip')}</span>
      </div>
    </div>
  )
}
