'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, PlusSquare, Smartphone, Sparkles } from 'lucide-react'

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
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          color: 'var(--color-text)',
          minHeight: '48px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
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
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <strong style={{ fontSize: '0.92rem', color: 'var(--color-text)' }}>
                Pasang di Layar Utama iPhone
              </strong>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-success-subtle, #e9f6ef)',
                  color: 'var(--color-success, #18794e)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Paling Nyaman
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Buka seperti aplikasi asli tanpa bilah browser Safari
            </p>
          </div>
        </div>

        <div style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
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
            gap: 'var(--space-3)',
          }}
        >
          {/* Keuntungan Ringkas */}
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border-subtle)',
              fontSize: '0.78rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
          >
            <Sparkles size={16} color="var(--color-accent)" style={{ flexShrink: 0 }} />
            <span>
              Aplikasi akan berjalan <strong>layar penuh (fullscreen standalone)</strong> tanpa bilah alamat Safari dan tidak membuka tab baru berulang kali.
            </span>
          </div>

          {/* 3 Langkah Mudah */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {/* Langkah 1 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-3)',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-surface-raised)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px',
                  color: 'var(--color-accent)',
                }}
              >
                <IosShareIcon size={15} />
              </div>
              <div style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--color-text)' }}>1. Ketuk ikon Bagikan (Share)</strong>
                <p style={{ margin: '2px 0 0 0', color: 'var(--color-text-muted)' }}>
                  Di Safari, ketuk tombol kotak berpanah ke atas pada bilah navigasi bagian bawah layar.
                </p>
              </div>
            </div>

            {/* Langkah 2 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-3)',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-surface-raised)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px',
                  color: 'var(--color-accent)',
                }}
              >
                <PlusSquare size={15} />
              </div>
              <div style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--color-text)' }}>2. Pilih &quot;Tambah ke Layar Utama&quot;</strong>
                <p style={{ margin: '2px 0 0 0', color: 'var(--color-text-muted)' }}>
                  Gulir ke bawah menu berbagi lalu pilih menu <em>&ldquo;Add to Home Screen&rdquo;</em>.
                </p>
              </div>
            </div>

            {/* Langkah 3 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-3)',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-surface-raised)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accent-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                3
              </div>
              <div style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--color-text)' }}>3. Ketuk &quot;Tambah&quot; di Pojok Kanan Atas</strong>
                <p style={{ margin: '2px 0 0 0', color: 'var(--color-text-muted)' }}>
                  Ikon aplikasi <strong>Finance</strong> akan langsung muncul di Layar Utama iPhone Anda dan siap dibuka kapan saja!
                </p>
              </div>
            </div>
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
