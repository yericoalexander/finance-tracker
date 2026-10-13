import { formatRupiah } from '@/lib/ai/currency'
import type { CategorySummary } from './actions'

interface CategoryBreakdownProps {
  categories: CategorySummary[]
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  if (categories.length === 0) return null

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
        gap: 'var(--space-4)',
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
        Pengeluaran per Kategori
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {categories.map((cat) => (
          <div key={cat.category} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem',
              }}
            >
              <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{cat.category}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span
                  style={{
                    color: 'var(--color-text)',
                    fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatRupiah(cat.total)}
                </span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                  ({cat.percentage}%)
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                height: '6px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface-raised)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, Math.max(2, cat.percentage))}%`,
                  backgroundColor: 'var(--color-accent)',
                  borderRadius: 'var(--radius-full)',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
