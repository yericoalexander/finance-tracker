'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, PlusSquare, Smartphone, Sparkles } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

interface HomeScreenGuideCardProps {
  defaultExpanded?: boolean
}

export function HomeScreenGuideCard({ defaultExpanded = true }: HomeScreenGuideCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const { t } = useI18n()

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}
    >
      {/* Header Card yang dapat diklik */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: 'var(--space-4) var(--space-5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          color: 'var(--color-text)',
          minHeight: '56px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0, flex: 1 }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border-subtle)',
              color: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Smartphone size={20} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--color-text)',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              {t('pwaGuideCardTitle')}
            </h3>
            <p
              style={{
                margin: '2px 0 0 0',
                fontSize: '0.78rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.3,
              }}
            >
              {t('pwaGuideCardSub')}
            </p>
          </div>
        </div>

        <div
          style={{
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 'var(--space-2)',
            flexShrink: 0,
          }}
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {/* Konten Langkah-langkah */}
      {isExpanded && (
        <div
          style={{
            padding: 'var(--space-1) var(--space-5) var(--space-5) var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          {/* Garis pemisah halus */}
          <div style={{ height: '1px', backgroundColor: 'var(--color-border-subtle)' }} />

          {/* 3 Langkah Terbuka & Nyaman Dibaca */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Langkah 1 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accent-text)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px',
                }}
              >
                1
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--color-text)' }}>
                    {t('pwaStep1Title')}
                  </strong>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface-raised)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                    }}
                  >
                    <IosShareIcon size={12} />
                    <span>Share</span>
                  </span>
                </div>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                  {t('pwaStep1Desc')}
                </p>
              </div>
            </div>

            {/* Langkah 2 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accent-text)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px',
                }}
              >
                2
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--color-text)' }}>
                    {t('pwaStep2Title')}
                  </strong>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface-raised)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                    }}
                  >
                    <PlusSquare size={12} />
                    <span>Add to Home Screen</span>
                  </span>
                </div>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                  {t('pwaStep2Desc')}
                </p>
              </div>
            </div>

            {/* Langkah 3 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accent-text)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px',
                }}
              >
                3
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--color-text)' }}>
                    {t('pwaStep3Title')}
                  </strong>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-accent)',
                      color: 'var(--color-accent-text)',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                    }}
                  >
                    {t('pwaStep3Badge')}
                  </span>
                </div>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                  {t('pwaStep3Desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Manfaat Ringkas */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border-subtle)',
              fontSize: '0.78rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.45,
            }}
          >
            <Sparkles size={15} color="var(--color-accent)" style={{ flexShrink: 0 }} />
            <span>{t('pwaCallout')}</span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Ikon tombol Share di iOS Safari (kotak dengan panah mengarah ke atas)
 */
function IosShareIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )
}
