'use client'

import { formatRupiah } from '@/lib/ai/currency'
import { useI18n } from '@/lib/i18n/context'
import { usePrivacy } from '@/lib/privacy/context'
import type { CategorySummary } from './actions'

interface CategoryBreakdownProps {
  categories: CategorySummary[]
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
  onViewCategoryInTransactions?: (category: string) => void
  monthLabel?: string
}

export function CategoryBreakdown({
  categories,
  selectedCategory,
  onSelectCategory,
  onViewCategoryInTransactions,
  monthLabel,
}: CategoryBreakdownProps) {
  const { t, translateCategory } = useI18n()
  const { isPrivate } = usePrivacy()
  const displayTitle = monthLabel
    ? t('categoriesTitle', { month: monthLabel })
    : t('categoriesThisMonth')

  if (categories.length === 0) {
    return (
      <section
        aria-label="Pengeluaran per kategori"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            color: 'var(--color-text)',
            margin: 0,
          }}
        >
          {displayTitle}
        </h2>
        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--color-text-muted)',
            marginTop: 'var(--space-2)',
            margin: 'var(--space-2) 0 0 0',
          }}
        >
          {t('noExpensesPeriod')}
        </p>
      </section>
    )
  }

  return (
    <section
      aria-label="Pengeluaran per kategori"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--color-text)',
            margin: 0,
          }}
        >
          {displayTitle}
        </h2>

        {selectedCategory ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {onViewCategoryInTransactions ? (
              <button
                type="button"
                onClick={() => onViewCategoryInTransactions(selectedCategory)}
                style={{
                  padding: '3px 8px',
                  minHeight: '30px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--color-accent-subtle)',
                  color: 'var(--color-accent)',
                  border: '1px solid var(--color-accent)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                }}
              >
                {t('viewInTransactions')}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              style={{
                padding: '2px 6px',
                minHeight: '30px',
                fontSize: '0.74rem',
                fontWeight: 600,
                backgroundColor: 'transparent',
                color: 'var(--color-text-muted)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {t('resetFilter')}
            </button>
          </div>
        ) : null}
      </div>

      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
        {t('filterHint')}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.category

          return (
            <button
              key={cat.category}
              type="button"
              onClick={() => onSelectCategory(isSelected ? null : cat.category)}
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: isSelected ? 'var(--color-surface-raised)' : 'transparent',
                border: isSelected
                  ? '1px solid var(--color-accent)'
                  : '1px solid var(--color-border-subtle)',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all var(--duration-fast) var(--ease-default)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.84rem',
                }}
              >
                <span
                  style={{
                    color: isSelected ? 'var(--color-accent)' : 'var(--color-text)',
                    fontWeight: isSelected ? 700 : 500,
                  }}
                >
                  {translateCategory(cat.category)}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span
                    style={{
                      color: 'var(--color-text)',
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {isPrivate ? 'Rp ••••••' : formatRupiah(cat.total)}
                  </span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                    ({cat.percentage}%)
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  height: '5px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-surface-raised)',
                  overflow: 'hidden',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.max(3, cat.percentage))}%`,
                    backgroundColor: isSelected ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width var(--duration-base) var(--ease-default)',
                  }}
                />
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
