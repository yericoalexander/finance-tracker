'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, Smartphone, X } from 'lucide-react'

import { HomeScreenGuideCard } from './home-screen-guide-card'
import { useI18n } from '@/lib/i18n/context'

export function HomeScreenBanner() {
  const { t } = useI18n()
  const [isDismissed, setIsDismissed] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // 1. Cek apakah sudah berjalan di mode PWA Standalone (dari Layar Utama)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator &&
        Boolean((window.navigator as unknown as { standalone: boolean }).standalone))

    if (isStandalone) {
      return
    }

    // 2. Cek apakah user sudah menutup banner sebelumnya
    const dismissed = localStorage.getItem('dismissed_home_screen_banner')
    if (!dismissed) {
      setIsDismissed(false)
    }
  }, [])

  function handleDismiss(e: React.MouseEvent) {
    e.stopPropagation()
    localStorage.setItem('dismissed_home_screen_banner', 'true')
    setIsDismissed(true)
  }

  if (isDismissed) return null

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsModalOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setIsModalOpen(true)
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
          padding: 'var(--space-3) var(--space-4)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          cursor: 'pointer',
          marginBottom: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-accent-subtle)',
              color: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Smartphone size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)' }}>
                {t('pwaGuideCardTitle')}
              </span>
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-success-subtle, #e9f6ef)',
                  color: 'var(--color-success, #18794e)',
                  textTransform: 'uppercase',
                }}
              >
                Tips
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
              {t('pwaGuideCardSub')}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {t('guideBadge')}
            <ChevronRight size={14} />
          </span>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label={t('closeSuggestion')}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-full)',
            }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Modal Petunjuk jika banner diklik */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '400px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <HomeScreenGuideCard defaultExpanded={true} />
            <div style={{ padding: '0 var(--space-4) var(--space-4) var(--space-4)' }}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  width: '100%',
                  minHeight: '44px',
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accent-text)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                {t('btnGotIt')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
