'use client'

import type { ReactNode } from 'react'
import { Check } from 'lucide-react'

export type SetupMode = 'notification' | 'backtap'

interface SetupGateModeCardProps {
  mode: SetupMode
  selected: boolean
  onSelect: (mode: SetupMode) => void
  icon: ReactNode
  title: string
  badge: string
  description: string
}

export function SetupGateModeCard({
  mode,
  selected,
  onSelect,
  icon,
  title,
  badge,
  description,
}: SetupGateModeCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(mode)}
      role="radio"
      aria-checked={selected}
      style={{
        width: '100%',
        minHeight: '76px',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        textAlign: 'left',
        backgroundColor: selected ? 'var(--color-surface-raised)' : 'var(--color-surface)',
        border: selected ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        cursor: 'pointer',
        boxShadow: selected ? 'var(--shadow-sm)' : 'none',
        transition: 'all 180ms cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
      }}
    >
      {/* Top Row: Icon, Title, Badge & Radio Check */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: selected ? 'var(--color-accent)' : 'var(--color-surface-raised)',
              color: selected ? 'var(--color-accent-text)' : 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background-color 180ms ease, color 180ms ease',
            }}
          >
            {icon}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  letterSpacing: '-0.01em',
                }}
              >
                {title}
              </span>
            </div>
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.68rem',
                fontWeight: 600,
                color: selected ? 'var(--color-accent)' : 'var(--color-text-muted)',
                marginTop: '1px',
              }}
            >
              {badge}
            </span>
          </div>
        </div>

        {/* Radio Indicator */}
        <div
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            border: selected ? 'none' : '2px solid var(--color-border)',
            backgroundColor: selected ? 'var(--color-accent)' : 'transparent',
            color: 'var(--color-accent-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 180ms ease',
          }}
        >
          {selected && <Check size={14} strokeWidth={3} />}
        </div>
      </div>

      {/* Description */}
      <p
        style={{
          margin: 0,
          fontSize: '0.78rem',
          color: 'var(--color-text-muted)',
          lineHeight: 1.45,
          paddingLeft: '40px',
        }}
      >
        {description}
      </p>
    </button>
  )
}

