'use client'

import { Eye, EyeOff } from 'lucide-react'
import { usePrivacy } from '@/lib/privacy/context'
import { useI18n } from '@/lib/i18n/context'

interface PrivacyToggleProps {
  size?: 'sm' | 'md'
  variant?: 'ghost' | 'surface'
  className?: string
}

export function PrivacyToggle({ size = 'md', variant = 'surface' }: PrivacyToggleProps) {
  const { isPrivate, togglePrivacy } = usePrivacy()
  const { t } = useI18n()

  const isSurface = variant === 'surface'
  const isSm = size === 'sm'

  return (
    <button
      type="button"
      onClick={togglePrivacy}
      aria-label={isPrivate ? t('showAmounts') : t('hideAmounts')}
      title={isPrivate ? t('showAmounts') : t('hideAmounts')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '44px',
        minWidth: '44px',
        width: '44px',
        height: '44px',
        padding: 0,
        backgroundColor: isSurface ? 'var(--color-surface)' : 'transparent',
        border: isSurface ? '1px solid var(--color-border)' : 'none',
        borderRadius: 'var(--radius-full)',
        color: isPrivate ? 'var(--color-accent)' : 'var(--color-text-muted)',
        cursor: 'pointer',
        transition: 'all var(--duration-fast) var(--ease-default)',
        boxShadow: isSurface ? 'var(--shadow-sm)' : 'none',
      }}
    >
      {isPrivate ? <EyeOff size={isSm ? 18 : 20} /> : <Eye size={isSm ? 18 : 20} />}
    </button>
  )
}

