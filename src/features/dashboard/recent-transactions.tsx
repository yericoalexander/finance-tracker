'use client'

import { useState, useMemo } from 'react'
import { Calendar, Receipt, RotateCcw, Search, X } from 'lucide-react'

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

type DateFilterMode = 'all' | 'today' | 'custom'
type DateCustomMode = 'single' | 'range'

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

function formatCompactRange(startStr: string, endStr: string): string {
  try {
    const [y1, m1, d1] = startStr.split('-').map(Number)
    const [y2, m2, d2] = endStr.split('-').map(Number)
    if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) {
      return `${formatDateLabel(startStr)} – ${formatDateLabel(endStr)}`
    }
    if (y1 === y2 && m1 === m2) {
      const monthName = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(new Date(y1, m1 - 1, 1))
      return `${d1}–${d2} ${monthName} ${y1}`
    }
    if (y1 === y2) {
      const m1Name = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(new Date(y1, m1 - 1, 1))
      const m2Name = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(new Date(y2, m2 - 1, 1))
      return `${d1} ${m1Name} – ${d2} ${m2Name}`
    }
    return `${formatDateLabel(startStr)} – ${formatDateLabel(endStr)}`
  } catch {
    return `${formatDateLabel(startStr)} – ${formatDateLabel(endStr)}`
  }
}

function getTodayJakartaString(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date())
  } catch {
    return new Date().toISOString().slice(0, 10)
  }
}

export function RecentTransactions({
  transactions,
  selectedCategory,
  onSelectCategory,
  onNavigateToAdd,
}: RecentTransactionsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<DateFilterMode>('all')
  const [customMode, setCustomMode] = useState<DateCustomMode>('single')
  const [customDate, setCustomDate] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [showDatePicker, setShowDatePicker] = useState(false)

  const todayStr = useMemo(() => getTodayJakartaString(), [])

  // Tanggal unik dari riwayat transaksi (terbaru ke terlama)
  const availableDates = useMemo(() => {
    const dates = new Set<string>()
    for (const tx of transactions) {
      const d = tx.txDate || (tx.createdAt ? new Date(tx.createdAt).toISOString().slice(0, 10) : '')
      if (d) dates.add(d)
    }
    return Array.from(dates).sort().reverse()
  }, [transactions])

  // 1. Filter periode / tanggal tertentu / rentang tanggal
  const dateFilteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const dateVal = tx.txDate || (tx.createdAt ? new Date(tx.createdAt).toISOString().slice(0, 10) : '')
      if (dateFilter === 'today') {
        return dateVal === todayStr
      }
      if (dateFilter === 'custom') {
        if (customMode === 'single') {
          return customDate ? dateVal === customDate : true
        }
        if (customMode === 'range') {
          if (!startDate && !endDate) return true
          const start = startDate && endDate ? (startDate <= endDate ? startDate : endDate) : startDate
          const end = startDate && endDate ? (startDate <= endDate ? endDate : startDate) : endDate
          if (start && end) {
            return dateVal >= start && dateVal <= end
          }
          if (start) {
            return dateVal >= start
          }
          if (end) {
            return dateVal <= end
          }
        }
      }
      return true
    })
  }, [transactions, dateFilter, customMode, customDate, startDate, endDate, todayStr])

  // 2. Kategori yang tersedia pada periode terpilih
  const categoriesInPeriod = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>()
    for (const tx of dateFilteredTransactions) {
      const cat = tx.category || 'Lainnya'
      const existing = map.get(cat) || { count: 0, total: 0 }
      map.set(cat, {
        count: existing.count + 1,
        total: existing.total + (tx.amountIdr ?? 0),
      })
    }
    return Array.from(map.entries()).map(([category, stats]) => ({
      category,
      count: stats.count,
      total: stats.total,
    }))
  }, [dateFilteredTransactions])

  // 3. Filter akhir berdasarkan kategori dan query pencarian
  const filtered = useMemo(() => {
    return dateFilteredTransactions.filter((tx) => {
      const matchesCategory =
        !selectedCategory ||
        (tx.category && tx.category.toLowerCase() === selectedCategory.toLowerCase())

      const query = searchQuery.trim().toLowerCase()
      const matchesQuery =
        !query ||
        (tx.merchant && tx.merchant.toLowerCase().includes(query)) ||
        (tx.txDate && tx.txDate.includes(query)) ||
        (tx.category && tx.category.toLowerCase().includes(query))

      return matchesCategory && matchesQuery
    })
  }, [dateFilteredTransactions, selectedCategory, searchQuery])

  const totalFiltered = useMemo(() => {
    return filtered.reduce((acc, tx) => acc + (tx.amountIdr ?? 0), 0)
  }, [filtered])

  const hasActiveFilters = Boolean(
    searchQuery.trim() !== '' ||
    selectedCategory !== null ||
    dateFilter !== 'all' ||
    customDate !== '' ||
    startDate !== '' ||
    endDate !== ''
  )

  const handleResetFilters = () => {
    setSearchQuery('')
    setDateFilter('all')
    setCustomDate('')
    setStartDate('')
    setEndDate('')
    onSelectCategory(null)
    setShowDatePicker(false)
  }

  const handleSelectCustomDate = (date: string) => {
    setCustomDate(date)
    setCustomMode('single')
    setDateFilter('custom')
  }

  const handleClearDateFilter = () => {
    setCustomDate('')
    setStartDate('')
    setEndDate('')
    setDateFilter('all')
    setShowDatePicker(false)
  }

  const handleSwitchCustomMode = (mode: DateCustomMode) => {
    setCustomMode(mode)
    setDateFilter('custom')
    if (mode === 'range' && !startDate && customDate) {
      setStartDate(customDate)
    } else if (mode === 'single' && !customDate && startDate) {
      setCustomDate(startDate)
    }
  }

  const dateButtonLabel = useMemo(() => {
    if (dateFilter !== 'custom') return 'Pilih Tanggal'
    if (customMode === 'single') {
      return customDate ? formatDateLabel(customDate) : 'Pilih Tanggal'
    }
    if (startDate && endDate) {
      const start = startDate <= endDate ? startDate : endDate
      const end = startDate <= endDate ? endDate : startDate
      return formatCompactRange(start, end)
    }
    if (startDate) return `≥ ${formatDateLabel(startDate)}`
    if (endDate) return `≤ ${formatDateLabel(endDate)}`
    return 'Pilih Rentang'
  }, [dateFilter, customMode, customDate, startDate, endDate])

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
      {/* Header & Reset Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
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
            }}
          >
            Riwayat Transaksi
          </h2>
          <p
            style={{
              margin: '2px 0 0 0',
              fontSize: '0.74rem',
              color: 'var(--color-text-muted)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {hasActiveFilters
              ? `${filtered.length} dari ${transactions.length} transaksi`
              : `${filtered.length} transaksi`}
          </p>
        </div>

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={handleResetFilters}
            aria-label="Atur ulang semua filter"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              minHeight: '34px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-raised)',
              color: 'var(--color-accent)',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all var(--duration-fast)',
            }}
          >
            <RotateCcw size={12} />
            Reset Filter
          </button>
        ) : null}
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
          placeholder="Cari toko, tanggal, atau kategori..."
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
            fontFamily: 'inherit',
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

      {/* Button Filter Tanggal & Periode (Web App Style - Full Width Grid) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '8px',
          width: '100%',
        }}
      >
        {(
          [
            { id: 'all' as const, label: 'Semua Waktu' },
            { id: 'today' as const, label: 'Hari Ini' },
          ] as const
        ).map((item) => {
          const isSelected = dateFilter === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setDateFilter(item.id)
                setShowDatePicker(false)
              }}
              style={{
                width: '100%',
                minHeight: '40px',
                padding: '0 8px',
                borderRadius: 'var(--radius-md)',
                border: isSelected ? '1.5px solid var(--color-accent)' : '1px solid var(--color-border)',
                backgroundColor: isSelected ? 'var(--color-surface)' : 'var(--color-surface-raised)',
                color: isSelected ? 'var(--color-text)' : 'var(--color-text-muted)',
                fontSize: '0.78rem',
                fontWeight: isSelected ? 600 : 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                transition: 'all var(--duration-fast) var(--ease-default)',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {item.label}
            </button>
          )
        })}

        {/* Tombol Filter Tanggal / Rentang Tertentu */}
        <button
          type="button"
          onClick={() => {
            if (dateFilter !== 'custom') {
              setDateFilter('custom')
              setShowDatePicker(true)
            } else {
              setShowDatePicker((prev) => !prev)
            }
          }}
          style={{
            width: '100%',
            minHeight: '40px',
            padding: '0 8px',
            borderRadius: 'var(--radius-md)',
            border: dateFilter === 'custom' ? '1.5px solid var(--color-accent)' : '1px solid var(--color-border)',
            backgroundColor: dateFilter === 'custom' ? 'var(--color-surface)' : 'var(--color-surface-raised)',
            color: dateFilter === 'custom' ? 'var(--color-text)' : 'var(--color-text-muted)',
            fontSize: '0.78rem',
            fontWeight: dateFilter === 'custom' ? 600 : 500,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: '6px',
            transition: 'all var(--duration-fast) var(--ease-default)',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            boxShadow: dateFilter === 'custom' ? 'var(--shadow-sm)' : 'none',
            overflow: 'hidden',
          }}
        >
          <Calendar size={13} style={{ flexShrink: 0 }} />
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {dateButtonLabel}
          </span>
        </button>
      </div>

      {/* Panel Pemilih Tanggal Tertentu & Rentang Tanggal */}
      {(showDatePicker || dateFilter === 'custom') && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-surface-raised)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Header Panel */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text)' }}>
              Filter Tanggal Transaksi:
            </span>
            {customDate || startDate || endDate ? (
              <button
                type="button"
                onClick={handleClearDateFilter}
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--color-accent)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Hapus filter tanggal
              </button>
            ) : null}
          </div>

          {/* Mode Tab Switcher: Satu Tanggal vs Rentang Tanggal */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
              backgroundColor: 'var(--color-bg)',
              padding: '3px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          >
            <button
              type="button"
              onClick={() => handleSwitchCustomMode('single')}
              style={{
                flex: 1,
                minHeight: '32px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: customMode === 'single' ? 'var(--color-surface-raised)' : 'transparent',
                color: customMode === 'single' ? 'var(--color-text)' : 'var(--color-text-muted)',
                fontWeight: customMode === 'single' ? 600 : 500,
                fontSize: '0.75rem',
                cursor: 'pointer',
                boxShadow: customMode === 'single' ? 'var(--shadow-sm)' : 'none',
                transition: 'all var(--duration-fast)',
              }}
            >
              Satu Tanggal
            </button>
            <button
              type="button"
              onClick={() => handleSwitchCustomMode('range')}
              style={{
                flex: 1,
                minHeight: '32px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: customMode === 'range' ? 'var(--color-surface-raised)' : 'transparent',
                color: customMode === 'range' ? 'var(--color-text)' : 'var(--color-text-muted)',
                fontWeight: customMode === 'range' ? 600 : 500,
                fontSize: '0.75rem',
                cursor: 'pointer',
                boxShadow: customMode === 'range' ? 'var(--shadow-sm)' : 'none',
                transition: 'all var(--duration-fast)',
              }}
            >
              Rentang Tanggal
            </button>
          </div>

          {/* Konten Mode: Satu Tanggal */}
          {customMode === 'single' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {availableDates.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: '6px',
                    overflowX: 'auto',
                    paddingBottom: '2px',
                    scrollbarWidth: 'none',
                  }}
                >
                  {availableDates.map((d) => {
                    const isDateSelected = dateFilter === 'custom' && customDate === d
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleSelectCustomDate(d)}
                        style={{
                          whiteSpace: 'nowrap',
                          minHeight: '30px',
                          padding: '2px 10px',
                          borderRadius: 'var(--radius-full)',
                          border: isDateSelected ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                          backgroundColor: isDateSelected ? 'var(--color-accent)' : 'var(--color-surface)',
                          color: isDateSelected ? 'var(--color-accent-text)' : 'var(--color-text)',
                          fontSize: '0.72rem',
                          fontWeight: isDateSelected ? 600 : 500,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        {formatDateLabel(d)}
                      </button>
                    )
                  })}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="date"
                  aria-label="Pilih tanggal transaksi"
                  value={customDate}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleSelectCustomDate(e.target.value)
                    }
                  }}
                  style={{
                    minHeight: '38px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                    fontSize: '0.78rem',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  atau cari tanggal bebas di kalender
                </span>
              </div>
            </div>
          )}

          {/* Konten Mode: Rentang Tanggal */}
          {customMode === 'range' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {/* Quick Range Shortcut bila ada riwayat tanggal */}
              {availableDates.length >= 2 && availableDates[0] && availableDates[availableDates.length - 1] ? (
                (() => {
                  const earliest = availableDates[availableDates.length - 1] as string
                  const latest = availableDates[0] as string
                  return (
                    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setStartDate(earliest)
                          setEndDate(latest)
                          setDateFilter('custom')
                        }}
                        style={{
                          whiteSpace: 'nowrap',
                          minHeight: '30px',
                          padding: '2px 10px',
                          borderRadius: 'var(--radius-full)',
                          border: '1px dashed var(--color-accent)',
                          backgroundColor: 'var(--color-accent-subtle)',
                          color: 'var(--color-accent)',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        Rentang Semua Transaksi ({formatDateLabel(earliest)} – {formatDateLabel(latest)})
                      </button>
                    </div>
                  )
                })()
              ) : null}

              {/* Input Rentang: Dari & Sampai Tanggal */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label
                    htmlFor="start-date-input"
                    style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600 }}
                  >
                    Dari Tanggal:
                  </label>
                  <input
                    id="start-date-input"
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value)
                      setDateFilter('custom')
                    }}
                    style={{
                      minHeight: '38px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      fontSize: '0.8rem',
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label
                    htmlFor="end-date-input"
                    style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600 }}
                  >
                    Sampai Tanggal:
                  </label>
                  <input
                    id="end-date-input"
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value)
                      setDateFilter('custom')
                    }}
                    style={{
                      minHeight: '38px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      fontSize: '0.8rem',
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Keterangan Status Rentang */}
              {startDate && endDate ? (
                <div
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--color-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 500,
                  }}
                >
                  ✓ Menampilkan {formatDateLabel(startDate <= endDate ? startDate : endDate)} s/d {formatDateLabel(startDate <= endDate ? endDate : startDate)}
                </div>
              ) : (
                <div style={{ fontSize: '0.71rem', color: 'var(--color-text-muted)' }}>
                  {startDate
                    ? `Menampilkan transaksi mulai dari ${formatDateLabel(startDate)}`
                    : endDate
                    ? `Menampilkan transaksi sampai ${formatDateLabel(endDate)}`
                    : 'Pilih tanggal awal dan akhir untuk menyaring transaksi.'}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Chips Filter Kategori (Dinamis sesuai periode terpilih) */}
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
            fontFamily: 'inherit',
          }}
        >
          Semua ({dateFilteredTransactions.length})
        </button>

        {categoriesInPeriod.map((cat) => {
          const isSelected = selectedCategory === cat.category
          return (
            <button
              key={cat.category}
              type="button"
              onClick={() => onSelectCategory(isSelected ? null : cat.category)}
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
                fontFamily: 'inherit',
              }}
            >
              {cat.category} ({cat.count})
            </button>
          )
        })}
      </div>

      {/* Baris Total Terfilter & Badge Status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-2) var(--space-3)',
          backgroundColor: 'var(--color-surface-raised)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            {filtered.length} Transaksi Terpilih
          </span>

          {dateFilter === 'today' && (
            <span
              style={{
                fontSize: '0.7rem',
                padding: '1px 6px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-accent-subtle)',
                color: 'var(--color-accent)',
                fontWeight: 600,
              }}
            >
              Hari Ini
            </span>
          )}

          {dateFilter === 'custom' && (
            customMode === 'single' && customDate ? (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-accent-subtle)',
                  color: 'var(--color-accent)',
                  fontWeight: 600,
                }}
              >
                {formatDateLabel(customDate)}
              </span>
            ) : customMode === 'range' && (startDate || endDate) ? (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-accent-subtle)',
                  color: 'var(--color-accent)',
                  fontWeight: 600,
                }}
              >
                {startDate && endDate
                  ? `${formatDateLabel(startDate <= endDate ? startDate : endDate)} – ${formatDateLabel(startDate <= endDate ? endDate : startDate)}`
                  : startDate
                  ? `≥ ${formatDateLabel(startDate)}`
                  : `≤ ${formatDateLabel(endDate)}`}
              </span>
            ) : null
          )}

          {selectedCategory && (
            <span
              style={{
                fontSize: '0.7rem',
                padding: '1px 6px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-accent-subtle)',
                color: 'var(--color-accent)',
                fontWeight: 600,
              }}
            >
              {selectedCategory}
            </span>
          )}
        </div>

        <span
          style={{
            fontSize: '0.88rem',
            fontWeight: 700,
            color: 'var(--color-text)',
            fontVariantNumeric: 'tabular-nums',
            whiteSpace: 'nowrap',
          }}
        >
          {formatRupiah(totalFiltered)}
        </span>
      </div>

      {/* Daftar Transaksi (HANYA menampilkan transaksi yang cocok dengan filter) */}
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
            {hasActiveFilters
              ? 'Tidak ada transaksi yang cocok dengan filter yang dipilih.'
              : 'Belum ada transaksi tersinkronisasi.'}
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={handleResetFilters}
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
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'inherit',
              }}
            >
              <RotateCcw size={14} />
              Reset Filter
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
                fontFamily: 'inherit',
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
          {filtered.map((tx) => {
            const isVeryRecent =
              tx.createdAt && Date.now() - new Date(tx.createdAt).getTime() < 120000
            return (
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                    {isVeryRecent && (
                      <span
                        style={{
                          fontSize: '0.66rem',
                          padding: '1px 5px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-success-subtle)',
                          color: 'var(--color-success)',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        Baru
                      </span>
                    )}
                  </div>
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
                    {formatDateLabel(tx.txDate || new Date(tx.createdAt).toISOString().slice(0, 10))}
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
          )
        })}
        </ul>
      )}
    </section>
  )
}
