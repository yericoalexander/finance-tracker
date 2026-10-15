'use client'

import { ArrowRight, Smartphone, Sparkles } from 'lucide-react'
import Link from 'next/link'

import { useI18n } from '@/lib/i18n/context'

interface DeviceSetupBannerProps {
  hasActiveDevice: boolean
}

export function DeviceSetupBanner({ hasActiveDevice }: DeviceSetupBannerProps) {
  const { t } = useI18n()

  if (hasActiveDevice) return null

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-3) var(--space-4)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        gap: 'var(--space-3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0 }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-accent)',
            flexShrink: 0,
          }}
        >
          <Smartphone size={18} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <p
              style={{
                fontSize: '0.84rem',
                fontWeight: 700,
                color: 'var(--color-text)',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {t('deviceBannerTitle')}
            </p>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-expense-bg)',
                color: 'var(--color-expense)',
              }}
            >
              {t('deviceBannerTag')}
            </span>
          </div>
          <p
            style={{
              fontSize: '0.74rem',
              color: 'var(--color-text-muted)',
              margin: '2px 0 0 0',
              lineHeight: 1.3,
            }}
          >
            {t('deviceBannerDescPrefix')} <strong>{t('deviceBannerDescStrong')}</strong>.
          </p>
        </div>
      </div>

      <Link
        href="/pair"
        aria-label={t('deviceBannerAria')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          minHeight: '38px',
          padding: '0 var(--space-3)',
          backgroundColor: 'var(--color-accent)',
          color: 'var(--color-accent-text)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.78rem',
          fontWeight: 700,
          textDecoration: 'none',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        <Sparkles size={13} />
        <span>{t('deviceBannerAction')}</span>
        <ArrowRight size={13} />
      </Link>
    </div>
  )
}
