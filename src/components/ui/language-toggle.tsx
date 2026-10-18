'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n/context'

export function LanguageToggle() {
  const { locale, setLocale, toggleLocale } = useI18n()
  const [isPressed, setIsPressed] = useState(false)

  return (
    <div
      role="group"
      aria-label={
        locale === 'id'
          ? 'Pilih bahasa (saat ini Bahasa Indonesia)'
          : 'Select language (currently English)'
      }
      title={
        locale === 'id'
          ? 'Klik untuk ganti ke English (Nominal tetap Rp)'
          : 'Click to switch to Bahasa Indonesia (Amounts remain Rp)'
      }
      onClick={toggleLocale}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerLeave={() => setIsPressed(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: '44px',
        height: '44px',
        padding: '3px',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-full)',
        cursor: 'pointer',
        userSelect: 'none',
        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
        transition:
          'transform var(--duration-fast) var(--ease-default), border-color var(--duration-fast) var(--ease-default)',
        boxShadow: 'var(--shadow-xs)',
        gap: '2px',
      }}
    >
      {/* Indonesian Segment */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          if (locale !== 'id') setLocale('id')
          else toggleLocale()
        }}
        aria-pressed={locale === 'id'}
        aria-label="Bahasa Indonesia"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '34px',
          height: '36px',
          padding: '0 8px',
          borderRadius: 'var(--radius-full)',
          border: 'none',
          backgroundColor: locale === 'id' ? 'var(--color-accent)' : 'transparent',
          color: locale === 'id' ? 'var(--color-accent-text)' : 'var(--color-text-muted)',
          fontSize: '0.74rem',
          fontWeight: locale === 'id' ? 800 : 600,
          letterSpacing: '0.04em',
          cursor: 'pointer',
          transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: locale === 'id' ? '0 1px 3px rgba(0, 0, 0, 0.16)' : 'none',
        }}
      >
        ID
      </button>

      {/* English Segment */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          if (locale !== 'en') setLocale('en')
          else toggleLocale()
        }}
        aria-pressed={locale === 'en'}
        aria-label="English"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '34px',
          height: '36px',
          padding: '0 8px',
          borderRadius: 'var(--radius-full)',
          border: 'none',
          backgroundColor: locale === 'en' ? 'var(--color-accent)' : 'transparent',
          color: locale === 'en' ? 'var(--color-accent-text)' : 'var(--color-text-muted)',
          fontSize: '0.74rem',
          fontWeight: locale === 'en' ? 800 : 600,
          letterSpacing: '0.04em',
          cursor: 'pointer',
          transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: locale === 'en' ? '0 1px 3px rgba(0, 0, 0, 0.16)' : 'none',
        }}
      >
        EN
      </button>
    </div>
  )
}
