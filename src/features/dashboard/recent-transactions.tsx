'use client'

import { useState } from 'react'
import { Receipt, Search, X } from 'lucide-react'

import { formatRupiah } from '@/lib/ai/currency'

interface TransactionItem {
  id: string
  merchant: string | null
  amountIdr: number | null
  category: string | null
  txDate: string | null
  createdAt: Date
}

interface RecentTransactionsProps {
  transactions: TransactionItem[]
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
  onNavigateToAdd?: () => void
}

export function RecentTransactions({
  transactions,
  selectedCategory,
  onSelectCategory,
  onNavigateToAdd,
}: RecentTransactionsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<'all' | 'month' | 'week'>('all')

  const now = new Date()
  const currentMonthPrefix = now.toISOString().slice(0, 7)
  const sevenDaysAgoStr = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  // Filter transaksi berdasarkan kategori, tanggal, dan pencarian live
  const filtered = transactions.filter((tx) => {
    const matchesCategory =
      !selectedCategory || (tx.category && tx.category.toLowerCase() === selectedCategory.toLowerCase())

    const dateVal = tx.txDate || (tx.createdAt ? new Date(tx.createdAt).toISOString().slice(0, 10) : '')
    let matchesDate = true
    if (dateFilter === 'month') {
      matchesDate = dateVal.startsWith(currentMonthPrefix)
    } else if (dateFilter === 'week') {
      matchesDate = dateVal >= sevenDaysAgoStr
    }

    const query = searchQuery.trim().toLowerCase()
    const matchesQuery =
      !query ||
      (tx.merchant && tx.merchant.toLowerCase().includes(query)) ||
      (tx.txDate && tx.txDate.includes(query)) ||
      (tx.category && tx.category.toLowerCase().includes(query))

    return matchesCategory && matchesDate && matchesQuery
  })

  const totalFiltered = filtered.reduce((acc, tx) => acc + (tx.amountIdr ?? 0), 0)

  // Ambil daftar kategori unik yang ada di transaksi
  const existingCategories = Array.from(
    new Set(transactions.map((tx) => tx.category).filter(Boolean)),
  ) as string[]

  return (
    <section
      aria-label="Riwayat transaksi terbaru"
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
      {/* Header & Counter */}
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
          Riwayat Transaksi
        </h2>
        <span
          style={{
            fontSize: '0.78rem',
            color: 'var(--color-text-muted)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {filtered.length} transaksi
        </span>
      </div>

      {/* Input Pencarian Live */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Search
          size={16}
          color="var(--color-text-muted)"
          style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }}
        />
        <input
          type="text"
          placeholder="Cari toko atau tanggal..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            minHeight: '44px',
            paddingLeft: '38px',
            paddingRight: searchQuery ? '38px' : '14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
            fontSize: '0.85rem',
          }}
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label="Hapus pencarian"
            style={{
              position: 'absolute',
              right: '8px',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'var(--color-surface-raised)',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      {/* Filter Periode Cepat */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {(
          [
            { id: 'all', label: 'Semua Waktu' },
            { id: 'month', label: 'Bulan Ini' },
            { id: 'week', label: '7 Hari Terakhir' },
          ] as const
        ).map((item) => {
          const isSelected = dateFilter === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setDateFilter(item.id)}
              style={{
                flex: 1,
                minHeight: '36px',
                padding: '4px 8px',
                borderRadius: 'var(--radius-md)',
                border: isSelected ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                backgroundColor: isSelected ? 'var(--color-accent-subtle)' : 'var(--color-surface-raised)',
                color: isSelected ? 'var(--color-accent)' : 'var(--color-text-muted)',
                fontSize: '0.74rem',
                fontWeight: isSelected ? 600 : 500,
                cursor: 'pointer',
                transition: 'all var(--duration-fast) var(--ease-default)',
              }}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      {/* Chips Filter Kategori */}
      {existingCategories.length > 0 ? (
        <div
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '2px',
            scrollbarWidth: 'none',
          }}
        >
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            style={{
              whiteSpace: 'nowrap',
              minHeight: '32px',
              padding: '0 12px',
              borderRadius: 'var(--radius-full)',
              border: !selectedCategory ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
              backgroundColor: !selectedCategory ? 'var(--color-accent)' : 'var(--color-surface-raised)',
              color: !selectedCategory ? 'var(--color-accent-text)' : 'var(--color-text)',
              fontSize: '0.74rem',
              fontWeight: !selectedCategory ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            Semua
          </button>
          {existingCategories.map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(isSelected ? null : cat)}
                style={{
                  whiteSpace: 'nowrap',
                  minHeight: '32px',
                  padding: '0 12px',
                  borderRadius: 'var(--radius-full)',
                  border: isSelected ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                  backgroundColor: isSelected ? 'var(--color-accent)' : 'var(--color-surface-raised)',
                  color: isSelected ? 'var(--color-accent-text)' : 'var(--color-text)',
                  fontSize: '0.74rem',
                  fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>
      ) : null}

      {/* Baris Total Terfilter */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-2) var(--space-3)',
          backgroundColor: 'var(--color-surface-raised)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
        }}
      >
        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
          {filtered.length} Transaksi Terpilih
        </span>
        <span
          style={{
            fontSize: '0.88rem',
            fontWeight: 700,
            color: 'var(--color-text)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatRupiah(totalFiltered)}
        </span>
      </div>

      {/* Daftar Transaksi */}
      {filtered.length === 0 ? (
        <div
          style={{
            padding: 'var(--space-6) 0',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-2)',
            color: 'var(--color-text-muted)',
          }}
        >
          <Receipt size={30} strokeWidth={1.5} />
          <p style={{ margin: 0, fontSize: '0.84rem' }}>
            {searchQuery || selectedCategory || dateFilter !== 'all'
              ? 'Tidak ada transaksi yang cocok dengan filter.'
              : 'Belum ada transaksi tersinkronisasi.'}
          </p>
          {(searchQuery || selectedCategory || dateFilter !== 'all') ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                onSelectCategory(null)
                setDateFilter('all')
              }}
              style={{
                marginTop: 'var(--space-1)',
                backgroundColor: 'transparent',
                color: 'var(--color-accent)',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reset filter
            </button>
          ) : onNavigateToAdd ? (
            <button
              type="button"
              onClick={onNavigateToAdd}
              style={{
                marginTop: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-4)',
                minHeight: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accent-text)',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Catat Transaksi Pertama
            </button>
          ) : null}
        </div>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          {filtered.map((tx) => (
            <li
              key={tx.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-3) 0',
                borderBottom: '1px solid var(--color-border-subtle)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
                <span
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {tx.merchant || 'Transaksi'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface-raised)',
                      color: 'var(--color-text-muted)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {tx.category || 'Lainnya'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {tx.txDate || new Date(tx.createdAt).toISOString().slice(0, 10)}
                  </span>
                </div>
              </div>

              <div
                style={{
                  fontSize: '0.94rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  fontVariantNumeric: 'tabular-nums',
                  whiteSpace: 'nowrap',
                  marginLeft: 'var(--space-3)',
                }}
              >
                {formatRupiah(tx.amountIdr ?? 0)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
