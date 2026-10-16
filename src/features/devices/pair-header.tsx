'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { useI18n } from '@/lib/i18n/context'

export function PairHeader() {
  const { t } = useI18n()

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0, flex: 1 }}>
        <Link
          href="/dashboard"
          prefetch={true}
          aria-label={t('backToDashboard')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '44px',
            minWidth: '44px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            backgroundColor: 'var(--color-surface)',
            textDecoration: 'none',
            flexShrink: 0,
            transition: 'background-color 150ms ease',
          }}
        >
          <ArrowLeft size={18} />
        </Link>

        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              margin: 0,
              color: 'var(--color-text)',
              letterSpacing: '-0.015em',
              lineHeight: 1.25,
            }}
          >
            {t('pairTitle')}
          </h1>
          <p
            style={{
              fontSize: '0.74rem',
              color: 'var(--color-text-muted)',
              margin: '2px 0 0',
              lineHeight: 1.35,
            }}
          >
            {t('pairSubtitle')}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
        <ThemeToggle />
        <LanguageToggle />
      </div>
    </header>
  )
}
