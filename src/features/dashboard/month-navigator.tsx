'use client'

import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

interface MonthNavigatorProps {
  selectedMonth: string // Format 'YYYY-MM'
  currentMonthPrefix: string // Format 'YYYY-MM'
  availableMonths: string[]
  onChangeMonth: (month: string) => void
  isLoading?: boolean
}

function getPrevMonthStr(monthStr: string): string {
  const [year, month] = monthStr.split('-').map(Number)
  if (!year || !month) return monthStr
  const prevDate = new Date(year, month - 2, 1)
  const y = prevDate.getFullYear()
  const m = String(prevDate.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function getNextMonthStr(monthStr: string): string {
  const [year, month] = monthStr.split('-').map(Number)
  if (!year || !month) return monthStr
  const nextDate = new Date(year, month, 1)
  const y = nextDate.getFullYear()
  const m = String(nextDate.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function MonthNavigator({
  selectedMonth,
  currentMonthPrefix,
  availableMonths,
  onChangeMonth,
  isLoading = false,
}: MonthNavigatorProps) {
  const { t, formatMonthName } = useI18n()

  const getMonthLabel = (mStr: string) => {
    try {
      const [year, month] = mStr.split('-').map(Number)
      if (!year || !month) return mStr
      const d = new Date(year, month - 1, 1)
      return formatMonthName(d)
    } catch {
      return mStr
    }
  }

  const isCurrentMonth = selectedMonth === currentMonthPrefix
  const canGoNext = selectedMonth < currentMonthPrefix

  const handlePrev = () => {
    onChangeMonth(getPrevMonthStr(selectedMonth))
  }

  const handleNext = () => {
    if (canGoNext) {
      onChangeMonth(getNextMonthStr(selectedMonth))
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
        padding: '3px 6px',
        marginBottom: 'var(--space-3)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Tombol Bulan Lalu (‹) */}
      <button
        type="button"
        onClick={handlePrev}
        disabled={isLoading}
        aria-label={t('prevMonth')}
        style={{
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'transparent',
          border: 'none',
          color: 'var(--color-text)',
          cursor: isLoading ? 'wait' : 'pointer',
          opacity: isLoading ? 0.5 : 1,
          fontFamily: 'inherit',
          transition: 'all var(--duration-fast)',
        }}
      >
        <ChevronLeft size={20} />
      </button>

      {/* Tampilan Bulan & Dropdown Tersembunyi */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 6px',
        }}
      >
        <span
          style={{
            fontSize: '0.88rem',
            fontWeight: 700,
            color: 'var(--color-text)',
            letterSpacing: '-0.01em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Calendar size={15} color="var(--color-text-muted)" />
          {getMonthLabel(selectedMonth)}
        </span>

        {isCurrentMonth ? (
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            {t('thisMonth')}
          </span>
        ) : null}

        {/* Aksesibilitas & Lompat Bulan Cepat: native select transparan */}
        <select
          value={selectedMonth}
          onChange={(e) => onChangeMonth(e.target.value)}
          aria-label={t('selectMonth')}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            width: '100%',
            height: '100%',
            cursor: 'pointer',
          }}
        >
          {availableMonths.map((m) => (
            <option key={m} value={m}>
              {getMonthLabel(m)} {m === currentMonthPrefix ? `(${t('thisMonth')})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Tombol Bulan Berikutnya (›) */}
      <button
        type="button"
        onClick={handleNext}
        disabled={!canGoNext || isLoading}
        aria-label={t('nextMonth')}
        style={{
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'transparent',
          border: 'none',
          color: 'var(--color-text)',
          cursor: canGoNext && !isLoading ? 'pointer' : 'default',
          opacity: canGoNext && !isLoading ? 1 : 0.25,
          fontFamily: 'inherit',
          transition: 'all var(--duration-fast)',
        }}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
