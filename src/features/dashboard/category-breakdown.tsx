'use client'

import { formatRupiah } from '@/lib/ai/currency'
import type { CategorySummary } from './actions'

interface CategoryBreakdownProps {
  categories: CategorySummary[]
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
}

export function CategoryBreakdown({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryBreakdownProps) {
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
          Kategori Bulan Ini
        </h2>

        {selectedCategory ? (
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            style={{
              padding: '2px 8px',
              minHeight: '30px',
              fontSize: '0.74rem',
              fontWeight: 600,
              backgroundColor: 'transparent',
              color: 'var(--color-accent)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Tampilkan Semua
          </button>
        ) : null}
      </div>

      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
        Ketuk kategori di bawah untuk menyaring riwayat transaksi.
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
                border: isSelected ? '1px solid var(--color-accent)' : '1px solid var(--color-border-subtle)',
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
                  {cat.category}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span
                    style={{
                      color: 'var(--color-text)',
                      fontWeight: 700,
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
