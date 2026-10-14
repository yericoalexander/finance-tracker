'use client'

import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Calendar,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
  Utensils,
  Car,
  ShoppingBag,
  Zap,
  Film,
  HeartPulse,
  Tag,
  Check,
} from 'lucide-react'

import { CATEGORIES } from '@/lib/ai/types'
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
  stickyOffset?: number
}

type QuickDateOption = 'all' | 'today' | 'yesterday' | '7days' | 'month' | 'range'

function formatDateLabel(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number)
    if (!year || !month || !day) return dateStr
    const d = new Date(year, month - 1, day)
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d)
  } catch {
    return dateStr
  }
}

function getJakartaDateOffset(offsetDays = 0): string {
  try {
    const d = new Date()
    d.setDate(d.getDate() + offsetDays)
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d)
  } catch {
    const d = new Date()
    d.setDate(d.getDate() + offsetDays)
    return d.toISOString().slice(0, 10)
  }
}

function getCategoryIcon(cat: string | null) {
  switch (cat) {
    case 'Makanan & Minuman':
      return <Utensils size={18} color="var(--color-accent)" />
    case 'Transportasi':
      return <Car size={18} color="var(--color-accent)" />
    case 'Belanja':
      return <ShoppingBag size={18} color="var(--color-accent)" />
    case 'Tagihan & Utilitas':
      return <Zap size={18} color="var(--color-accent)" />
    case 'Hiburan':
      return <Film size={18} color="var(--color-accent)" />
    case 'Kesehatan':
      return <HeartPulse size={18} color="var(--color-accent)" />
    default:
      return <Tag size={18} color="var(--color-accent)" />
  }
}

export function RecentTransactions({
  transactions,
  selectedCategory,
  onSelectCategory,
  onNavigateToAdd,
  stickyOffset,
}: RecentTransactionsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [quickDate, setQuickDate] = useState<QuickDateOption>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (filterModalOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [filterModalOpen])

  // Draft filter states inside modal
  const [draftQuickDate, setDraftQuickDate] = useState<QuickDateOption>('all')
  const [draftCategory, setDraftCategory] = useState<string | null>(null)
  const [draftStartDate, setDraftStartDate] = useState<string>('')
  const [draftEndDate, setDraftEndDate] = useState<string>('')

  const todayStr = useMemo(() => getJakartaDateOffset(0), [])
  const yesterdayStr = useMemo(() => getJakartaDateOffset(-1), [])
  const sevenDaysAgoStr = useMemo(() => getJakartaDateOffset(-7), [])
  const currentMonthPrefix = useMemo(() => todayStr.slice(0, 7), [todayStr])

  // Sync draft states when opening modal
  const handleOpenFilterModal = () => {
    setDraftQuickDate(quickDate)
    setDraftCategory(selectedCategory)
    setDraftStartDate(startDate || sevenDaysAgoStr)
    setDraftEndDate(endDate || todayStr)
    setFilterModalOpen(true)
  }

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && filterModalOpen) {
        setFilterModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [filterModalOpen])

  // Count active filters for badge
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (quickDate !== 'all') count += 1
    if (selectedCategory !== null) count += 1
    if (searchQuery.trim() !== '') count += 1
    return count
  }, [quickDate, selectedCategory, searchQuery])

  const hasActiveFilters = activeFilterCount > 0

  // Apply filters
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Kategori
      if (selectedCategory !== null && tx.category !== selectedCategory) {
        return false
      }

      // 2. Waktu / Tanggal
      const txDate = tx.txDate || (tx.createdAt ? new Date(tx.createdAt).toISOString().slice(0, 10) : '')

      if (quickDate === 'today') {
        if (txDate !== todayStr) return false
      } else if (quickDate === 'yesterday') {
        if (txDate !== yesterdayStr) return false
      } else if (quickDate === '7days') {
        if (txDate < sevenDaysAgoStr || txDate > todayStr) return false
      } else if (quickDate === 'month') {
        if (!txDate.startsWith(currentMonthPrefix)) return false
      } else if (quickDate === 'range') {
        if (startDate && endDate) {
          const s = startDate <= endDate ? startDate : endDate
          const e = startDate <= endDate ? endDate : startDate
          if (txDate < s || txDate > e) return false
        } else if (startDate) {
          if (txDate < startDate) return false
        } else if (endDate) {
          if (txDate > endDate) return false
        }
      }

      // 3. Pencarian Live
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const merchantMatch = (tx.merchant ?? '').toLowerCase().includes(query)
        const categoryMatch = (tx.category ?? '').toLowerCase().includes(query)
        const dateMatch = (tx.txDate ?? '').includes(query)
        if (!merchantMatch && !categoryMatch && !dateMatch) {
          return false
        }
      }

      return true
    })
  }, [
    transactions,
    selectedCategory,
    quickDate,
    startDate,
    endDate,
    searchQuery,
    todayStr,
    yesterdayStr,
    sevenDaysAgoStr,
    currentMonthPrefix,
  ])

  // Rincian kategori dinamis dari hasil filter
  const dynamicCategoryBreakdown = useMemo(() => {
    const totals: Record<string, number> = {}
    let overallSum = 0
    for (const tx of filtered) {
      const cat = tx.category ?? 'Lainnya'
      const amt = tx.amountIdr ?? 0
      totals[cat] = (totals[cat] ?? 0) + amt
      overallSum += amt
    }

    return Object.entries(totals)
      .map(([cat, total]) => ({
        category: cat,
        total,
        percentage: overallSum > 0 ? Math.round((total / overallSum) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)
  }, [filtered])

  const totalFilteredAmount = useMemo(() => {
    return filtered.reduce((sum, tx) => sum + (tx.amountIdr ?? 0), 0)
  }, [filtered])

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('')
    setQuickDate('all')
    setStartDate('')
    setEndDate('')
    onSelectCategory(null)
  }

  // Commit filters from modal
  const handleApplyFilterModal = () => {
    setQuickDate(draftQuickDate)
    onSelectCategory(draftCategory)
    if (draftQuickDate === 'range' && draftStartDate && draftEndDate && draftStartDate > draftEndDate) {
      setStartDate(draftEndDate)
      setEndDate(draftStartDate)
    } else {
      setStartDate(draftStartDate)
      setEndDate(draftEndDate)
    }
    setFilterModalOpen(false)
  }

  const handleResetFilterModal = () => {
    setDraftQuickDate('all')
    setDraftCategory(null)
    setDraftStartDate('')
    setDraftEndDate('')
  }

  const quickDateLabels: Record<QuickDateOption, string> = {
    all: 'Semua Waktu',
    today: 'Hari Ini',
    yesterday: 'Kemarin',
    '7days': '7 Hari Terakhir',
    month: 'Bulan Ini',
    range: 'Rentang Tanggal',
  }

  // Cek transaksi baru (< 2 menit lalu)
  const isRecentNew = (createdAt: Date) => {
    try {
      const diffMs = Date.now() - new Date(createdAt).getTime()
      return diffMs >= 0 && diffMs < 120000
    } catch {
      return false
    }
  }

  return (
    <section
      aria-label="Semua transaksi"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      {/* Sticky Transaksi Sub-Header — Sesuai Gambar ke-2 */}
      <div
        style={{
          position: 'sticky',
          top: stickyOffset ? `${stickyOffset}px` : 'calc(136px + env(safe-area-inset-top, 0px))',
          zIndex: 25,
          backgroundColor: 'var(--color-bg)',
          paddingTop: 'var(--space-2)',
          paddingBottom: 'var(--space-3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        {/* Header Bagian: Semua transaksi & Jumlah tercatat — Identik dengan referensi */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
          }}
        >
        <div>
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--color-text)',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Semua transaksi
          </h2>
          <p
            style={{
              margin: '2px 0 0 0',
              fontSize: '0.78rem',
              color: 'var(--color-text-muted)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {transactions.length === 0
              ? '0 transaksi tercatat'
              : hasActiveFilters
                ? `${filtered.length} dari ${transactions.length} transaksi`
                : `${transactions.length} transaksi tercatat`}
          </p>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-muted)',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <RotateCcw size={11} />
            Reset
          </button>
        )}
      </div>

      {/* Baris Pencarian & Tombol Filter (Persis seperti referensi Image 1 & 3) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
        }}
      >
        {/* Input Pencarian dengan ikon search */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <Search
            size={16}
            color="var(--color-text-placeholder)"
            style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }}
          />
          <input
            type="text"
            placeholder="Cari transaksi"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              minHeight: '44px',
              paddingLeft: '38px',
              paddingRight: searchQuery ? '36px' : '14px',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-raised)',
              color: 'var(--color-text)',
              fontSize: '0.84rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color var(--duration-fast)',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Hapus pencarian"
              style={{
                position: 'absolute',
                right: '10px',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'var(--color-border)',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Tombol Filter — Pill Button dengan SlidersHorizontal (Persis Image 3) */}
        <button
          type="button"
          onClick={handleOpenFilterModal}
          aria-label="Buka filter transaksi"
          style={{
            minHeight: '44px',
            padding: '0 16px',
            borderRadius: 'var(--radius-full)',
            border: hasActiveFilters ? '1.5px solid var(--color-accent)' : '1px solid var(--color-border)',
            backgroundColor: hasActiveFilters ? 'var(--color-accent)' : 'var(--color-surface-raised)',
            color: hasActiveFilters ? 'var(--color-accent-text)' : 'var(--color-text)',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'inherit',
            flexShrink: 0,
            transition: 'all var(--duration-fast)',
            boxShadow: hasActiveFilters ? 'var(--shadow-sm)' : 'none',
          }}
        >
          <SlidersHorizontal size={15} />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: hasActiveFilters ? 'var(--color-accent-text)' : 'var(--color-accent)',
                color: hasActiveFilters ? 'var(--color-accent)' : 'var(--color-accent-text)',
                fontSize: '0.68rem',
                fontWeight: 800,
              }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Active Filter Tags Bar (Jika ada filter aktif) */}
      {hasActiveFilters && (
        <div
          className="animate-fade-in"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            alignItems: 'center',
          }}
        >
          {quickDate !== 'all' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--color-text)',
              }}
            >
              <Calendar size={11} color="var(--color-text-muted)" />
              {quickDate === 'range' && startDate && endDate
                ? `${formatDateLabel(startDate)} – ${formatDateLabel(endDate)}`
                : quickDateLabels[quickDate]}
              <button
                type="button"
                onClick={() => setQuickDate('all')}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                }}
              >
                <X size={12} />
              </button>
            </span>
          )}

          {selectedCategory !== null && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--color-text)',
              }}
            >
              <Tag size={11} color="var(--color-text-muted)" />
              {selectedCategory}
              <button
                type="button"
                onClick={() => onSelectCategory(null)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                }}
              >
                <X size={12} />
              </button>
            </span>
          )}

          {searchQuery && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--color-text)',
              }}
            >
              &ldquo;{searchQuery}&rdquo;
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                }}
              >
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}
      </div>

      {/* Rincian Kategori Dinamis dari Hasil Filter */}
      {hasActiveFilters && filtered.length > 0 && dynamicCategoryBreakdown.length > 0 && (
        <div
          className="animate-slide-up"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-4)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
              Rincian Kategori Hasil Filter
            </p>
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 800,
                color: 'var(--color-expense)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatRupiah(totalFilteredAmount)}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {dynamicCategoryBreakdown.map((cat) => {
              const isSelected = selectedCategory === cat.category
              return (
                <button
                  key={cat.category}
                  type="button"
                  onClick={() => onSelectCategory(isSelected ? null : cat.category)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '1.5px solid var(--color-accent)' : '1px solid transparent',
                    backgroundColor: isSelected ? 'var(--color-surface-raised)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text)' }}>
                      {cat.category}
                    </span>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: 'var(--color-text)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatRupiah(cat.total)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: '4px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-border-subtle)',
                      overflow: 'hidden',
                      width: '100%',
                    }}
                  >
                    <div
                      style={{
                        width: `${cat.percentage}%`,
                        height: '100%',
                        backgroundColor: 'var(--color-accent)',
                      }}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Daftar Transaksi atau Status Kosong (Persis referensi Image 1) */}
      {filtered.length === 0 ? (
        <div
          style={{
            padding: 'var(--space-6)',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border-subtle)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-text-muted)',
              fontWeight: 500,
              margin: 0,
            }}
          >
            {hasActiveFilters
              ? 'Tidak ada transaksi yang cocok dengan filter.'
              : 'Belum ada transaksi yang tercatat.'}
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                marginTop: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accent-text)',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Hapus Filter
            </button>
          ) : (
            onNavigateToAdd && (
              <button
                type="button"
                onClick={onNavigateToAdd}
                style={{
                  marginTop: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accent-text)',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                + Tambah Transaksi Pertama
              </button>
            )
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {filtered.map((tx) => {
            const isNew = isRecentNew(tx.createdAt)
            const dateStr = tx.txDate || (tx.createdAt ? new Date(tx.createdAt).toISOString().slice(0, 10) : '')

            return (
              <div
                key={tx.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-xl)',
                  border: isNew ? '1.5px solid var(--color-success)' : '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'background-color var(--duration-fast)',
                }}
              >
                {/* Ikon Kategori */}
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--color-surface-raised)',
                    border: '1px solid var(--color-border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getCategoryIcon(tx.category)}
                </div>

                {/* Nama Toko & Kategori */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <p
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        color: 'var(--color-text)',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tx.merchant ?? 'Pengeluaran'}
                    </p>
                    {isNew && (
                      <span
                        style={{
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          backgroundColor: 'var(--color-success)',
                          color: '#ffffff',
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        Baru
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--color-text-muted)',
                      margin: '2px 0 0 0',
                    }}
                  >
                    {tx.category ?? 'Lainnya'} · {formatDateLabel(dateStr)}
                  </p>
                </div>

                {/* Nominal */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      color: 'var(--color-expense)',
                      fontVariantNumeric: 'tabular-nums',
                      letterSpacing: '-0.02em',
                      margin: 0,
                    }}
                  >
                    -{formatRupiah(tx.amountIdr ?? 0)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal / Bottom Drawer Filter (Portaled ke document.body agar fix ke layar) */}
      {mounted && filterModalOpen && createPortal(
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setFilterModalOpen(false)}
        >
          <div
            className="animate-drawer-up"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderTopLeftRadius: 'var(--radius-xl)',
              borderTopRightRadius: 'var(--radius-xl)',
              borderTop: '1px solid var(--color-border)',
              padding: 'var(--space-4) var(--space-5)',
              paddingBottom: 'calc(var(--space-5) + env(safe-area-inset-bottom, 0px))',
              width: '100%',
              maxWidth: '430px',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grabber handle bar for iOS bottom sheet */}
            <div
              style={{
                width: '36px',
                height: '4px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-border)',
                margin: '0 auto',
                flexShrink: 0,
              }}
            />

            {/* Header Modal */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 'var(--space-2)',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={18} color="var(--color-accent)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                  Filter Transaksi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFilterModalOpen(false)}
                aria-label="Tutup filter"
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-md)',
                  margin: '-8px -8px -8px 0',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Bagian 1: Periode Waktu */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)' }}>
                Periode Waktu
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '6px',
                }}
              >
                {(
                  [
                    { id: 'all', label: 'Semua Waktu' },
                    { id: 'today', label: 'Hari Ini' },
                    { id: 'yesterday', label: 'Kemarin' },
                    { id: '7days', label: '7 Hari' },
                    { id: 'month', label: 'Bulan Ini' },
                    { id: 'range', label: 'Rentang' },
                  ] as const
                ).map((opt) => {
                  const isSelected = draftQuickDate === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setDraftQuickDate(opt.id)
                        if (opt.id === 'range') {
                          if (!draftStartDate) setDraftStartDate(sevenDaysAgoStr)
                          if (!draftEndDate) setDraftEndDate(todayStr)
                        }
                      }}
                      style={{
                        minHeight: '44px',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '1.5px solid var(--color-accent)' : '1px solid var(--color-border)',
                        backgroundColor: isSelected ? 'var(--color-accent)' : 'var(--color-surface-raised)',
                        color: isSelected ? 'var(--color-accent-text)' : 'var(--color-text)',
                        fontSize: '0.8rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all var(--duration-fast)',
                        fontFamily: 'inherit',
                        touchAction: 'manipulation',
                      }}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>

              {/* Input Rentang Tanggal jika opsi 'range' dipilih */}
              {draftQuickDate === 'range' && (
                <div
                  className="animate-slide-up"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-3)',
                    marginTop: '8px',
                    padding: 'var(--space-3) var(--space-4)',
                    backgroundColor: 'var(--color-surface-raised)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="var(--color-accent)" />
                      Rentang Tanggal
                    </span>
                    {draftStartDate && draftEndDate && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: draftStartDate > draftEndDate ? 'var(--color-expense)' : 'var(--color-text-muted)',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {draftStartDate > draftEndDate
                          ? '⚠️ Mulai > Akhir'
                          : `${formatDateLabel(draftStartDate)} – ${formatDateLabel(draftEndDate)}`}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto 1fr',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {/* Dari */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                        Dari Tanggal
                      </label>
                      <input
                        type="date"
                        value={draftStartDate}
                        onChange={(e) => setDraftStartDate(e.target.value)}
                        style={{
                          width: '100%',
                          minHeight: '44px',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-lg)',
                          border: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-surface)',
                          color: 'var(--color-text)',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          fontFamily: 'inherit',
                          outline: 'none',
                          boxShadow: 'var(--shadow-sm)',
                          textAlign: 'center',
                          WebkitAppearance: 'none',
                        }}
                      />
                    </div>

                    {/* Arrow Divider */}
                    <div
                      style={{
                        marginTop: '16px',
                        color: 'var(--color-text-muted)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                      }}
                    >
                      →
                    </div>

                    {/* Sampai */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                        Sampai Tanggal
                      </label>
                      <input
                        type="date"
                        value={draftEndDate}
                        onChange={(e) => setDraftEndDate(e.target.value)}
                        style={{
                          width: '100%',
                          minHeight: '44px',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-lg)',
                          border: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-surface)',
                          color: 'var(--color-text)',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          fontFamily: 'inherit',
                          outline: 'none',
                          boxShadow: 'var(--shadow-sm)',
                          textAlign: 'center',
                          WebkitAppearance: 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bagian 2: Kategori */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)' }}>
                Kategori
              </label>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setDraftCategory(null)}
                  style={{
                    minHeight: '40px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: draftCategory === null ? '1.5px solid var(--color-accent)' : '1px solid var(--color-border)',
                    backgroundColor: draftCategory === null ? 'var(--color-accent)' : 'var(--color-surface-raised)',
                    color: draftCategory === null ? 'var(--color-accent-text)' : 'var(--color-text)',
                    fontSize: '0.78rem',
                    fontWeight: draftCategory === null ? 700 : 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all var(--duration-fast)',
                    touchAction: 'manipulation',
                  }}
                >
                  Semua Kategori
                </button>
                {CATEGORIES.map((cat) => {
                  const isSelected = draftCategory === cat
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setDraftCategory(cat)}
                      style={{
                        minHeight: '40px',
                        padding: '8px 14px',
                        borderRadius: 'var(--radius-full)',
                        border: isSelected ? '1.5px solid var(--color-accent)' : '1px solid var(--color-border)',
                        backgroundColor: isSelected ? 'var(--color-accent)' : 'var(--color-surface-raised)',
                        color: isSelected ? 'var(--color-accent-text)' : 'var(--color-text)',
                        fontSize: '0.78rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'all var(--duration-fast)',
                        touchAction: 'manipulation',
                      }}
                    >
                      {cat}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Footer Aksi Modal */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginTop: 'var(--space-2)',
                paddingTop: 'var(--space-3)',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <button
                type="button"
                onClick={handleResetFilterModal}
                style={{
                  flex: 1,
                  minHeight: '44px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface-raised)',
                  color: 'var(--color-text)',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleApplyFilterModal}
                style={{
                  flex: 2,
                  minHeight: '44px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accent-text)',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Check size={16} />
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  )
}
