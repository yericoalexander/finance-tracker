'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, PlusSquare, Sparkles, Smartphone } from 'lucide-react'

interface HomeScreenGuideCardProps {
  defaultExpanded?: boolean
}

export function HomeScreenGuideCard({ defaultExpanded = true }: HomeScreenGuideCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

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
          minHeight: '48px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0 }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-accent-subtle)',
              color: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Smartphone size={20} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'nowrap' }}>
              <strong
                style={{
                  fontSize: '0.92rem',
                  color: 'var(--color-text)',
                  whiteSpace: 'nowrap',
                }}
              >
                Pasang di Layar Utama
              </strong>
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-success-subtle, #e9f6ef)',
                  color: 'var(--color-success, #18794e)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                Layar Penuh
              </span>
            </div>
            <p
              style={{
                margin: '2px 0 0 0',
                fontSize: '0.78rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.3,
              }}
            >
              Buka cepat tanpa bilah alamat Safari
            </p>
          </div>
        </div>

        <div style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Konten Langkah-langkah */}
      {isExpanded && (
        <div
          style={{
            padding: '0 var(--space-5) var(--space-5) var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          {/* Timeline 3 Langkah Terstruktur */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            {/* Langkah 1 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
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
              <div style={{ fontSize: '0.8125rem', lineHeight: 1.55 }}>
                <span style={{ color: 'var(--color-text)' }}>
                  Ketuk ikon{' '}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '1px 7px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      verticalAlign: 'middle',
                    }}
                  >
                    <IosShareIcon size={13} />
                    <span>Bagikan</span>
                  </span>{' '}
                  di bilah bawah Safari.
                </span>
              </div>
            </div>

            {/* Langkah 2 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
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
              <div style={{ fontSize: '0.8125rem', lineHeight: 1.55 }}>
                <span style={{ color: 'var(--color-text)' }}>
                  Gulir ke bawah, pilih{' '}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '1px 7px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      verticalAlign: 'middle',
                    }}
                  >
                    <PlusSquare size={13} />
                    <span>Tambah ke Layar Utama</span>
                  </span>
                  .
                </span>
              </div>
            </div>

            {/* Langkah 3 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
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
              <div style={{ fontSize: '0.8125rem', lineHeight: 1.55 }}>
                <span style={{ color: 'var(--color-text)' }}>
                  Ketuk{' '}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '1px 8px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-accent)',
                      color: 'var(--color-accent-text)',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      verticalAlign: 'middle',
                    }}
                  >
                    Tambah
                  </span>{' '}
                  di pojok kanan atas.
                </span>
              </div>
            </div>
          </div>

          {/* Keuntungan Ringkas di Bagian Bawah */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: '0.76rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.45,
            }}
          >
            <Sparkles size={14} color="var(--color-accent)" style={{ flexShrink: 0 }} />
            <span>
              Aplikasi akan terbuka layar penuh (*standalone*) tanpa bilah Safari &amp; tanpa tab yang menumpuk.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Ikon otentik tombol Share di iOS Safari (kotak dengan panah mengarah ke atas)
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
