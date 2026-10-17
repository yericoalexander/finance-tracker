'use client'

import { useState, useEffect } from 'react'
import { FileSpreadsheet, ArrowDownLeft, Bell } from 'lucide-react'

import { formatRupiah } from '@/lib/ai/currency'
import { useI18n } from '@/lib/i18n/context'
import type { ReminderSetting } from '@/lib/db/schema'
import { BudgetModal } from './budget-modal'

interface SummaryCardsProps {
  mtdTotal: number
  txCount: number
  sheetId?: string | null
  activeDevice?: {
    label: string
    lastSeenAt: Date | null
  } | null
  selectedMonth?: string
  currentMonthPrefix?: string
  reminderSetting?: ReminderSetting | null
}

export function SummaryCards({
  mtdTotal,
  txCount,
  sheetId,
  selectedMonth,
  currentMonthPrefix,
  reminderSetting,
}: SummaryCardsProps) {
  const { t, formatMonthName } = useI18n()
  const [viewMode, setViewMode] = useState<'total' | 'daily'>('total')
  const [activeReminder, setActiveReminder] = useState<ReminderSetting | null | undefined>(reminderSetting)
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false)

  useEffect(() => {
    setActiveReminder(reminderSetting)
  }, [reminderSetting])

  const now = new Date()
  const todayMonthPrefix = currentMonthPrefix ?? now.toISOString().slice(0, 7)
  const activeMonth = selectedMonth ?? todayMonthPrefix
  const isCurrentMonth = activeMonth === todayMonthPrefix

  const [activeYear, activeMonthNum] = activeMonth.split('-').map(Number)
  const displayDate = new Date(activeYear || now.getFullYear(), (activeMonthNum || (now.getMonth() + 1)) - 1, 1)

  const activeMonthName = formatMonthName(displayDate)

  // Jumlah hari untuk pembagi rata-rata harian:
  // Jika bulan berjalan, gunakan tanggal hari ini; jika bulan lampau, gunakan total hari di bulan tersebut
  const daysInActiveMonth = new Date(activeYear || now.getFullYear(), activeMonthNum || (now.getMonth() + 1), 0).getDate()
  const dayDivisor = isCurrentMonth ? Math.max(1, now.getDate()) : daysInActiveMonth

  const dailyAverage = dayDivisor > 0 ? Math.round(mtdTotal / dayDivisor) : mtdTotal
  const displayedAmount = viewMode === 'total' ? mtdTotal : dailyAverage

  return (
    <section aria-label="Ringkasan keuangan">
      {/* Hero Card: Pengeluaran Utama */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-5)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-3)',
        }}
      >
        {/* Baris Atas: Label & Badge + Aksi Pengingat & Toggle Total/Harian */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-expense-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ArrowDownLeft size={16} color="var(--color-expense)" />
            </div>
            <div>
              <p
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  whiteSpace: 'nowrap',
                  margin: 0,
                }}
              >
                {viewMode === 'total'
                  ? isCurrentMonth
                    ? t('expensesThisMonth')
                    : t('expensesPeriod', { month: activeMonthName })
                  : t('averageExpenses')}
              </p>
            </div>
          </div>

          {/* Toggle Total / Harian */}
          <div
            style={{
              display: 'inline-flex',
              padding: '2px',
              borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border)',
                gap: '2px',
              }}
            >
              {(['total', 'daily'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  style={{
                    padding: '4px 12px',
                    minHeight: '28px',
                    fontSize: '0.75rem',
                    fontWeight: viewMode === mode ? 700 : 500,
                    color: viewMode === mode ? 'var(--color-text)' : 'var(--color-text-muted)',
                    backgroundColor: viewMode === mode ? 'var(--color-surface)' : 'transparent',
                    borderRadius: 'calc(var(--radius-md) - 2px)',
                    border: 'none',
                    boxShadow: viewMode === mode ? 'var(--shadow-sm)' : 'none',
                    cursor: 'pointer',
                    transition: 'all var(--duration-fast) var(--ease-default)',
                    fontFamily: 'inherit',
                  }}
                >
                  {mode === 'total' ? t('total') : t('daily')}
                </button>
              ))}
            </div>
          </div>

        {/* Nilai Utama */}
        <div>
          <div
            style={{
              fontSize: '2.1rem',
              fontWeight: 800,
              color: 'var(--color-text)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
            }}
          >
            {formatRupiah(displayedAmount)}
          </div>
          <p
            suppressHydrationWarning
            style={{
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)',
              marginTop: '6px',
              margin: '6px 0 0 0',
            }}
          >
            {viewMode === 'total'
              ? t('dailyAverageText', {
                  month: activeMonthName,
                  avg: formatRupiah(dailyAverage),
                })
              : t('basedOnDays', {
                  days: dayDivisor,
                  month: activeMonthName,
                })}
          </p>
        </div>

        {/* Indikator Batas Pengeluaran Bulanan (Interaktif, Rapi & Tidak Bertumpuk) */}
        {isCurrentMonth && (
          activeReminder?.isEnabled && activeReminder?.monthlyLimitIdr ? (
            <button
              type="button"
              onClick={() => setIsBudgetModalOpen(true)}
              title={t('budgetModalTitle')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '12px 14px',
                backgroundColor: 'var(--color-surface-raised)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border-subtle)',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 150ms ease',
              }}
            >
              {/* Baris 1: Status Sisa / Lebih & Angkanya (1 baris lega) */}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Bell size={12} color="var(--color-accent)" />
                  {mtdTotal >= activeReminder.monthlyLimitIdr
                    ? t('budgetOverLimitLabel')
                    : t('budgetRemainingLabel')}
                </span>
                <span
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                    color: mtdTotal >= activeReminder.monthlyLimitIdr ? 'var(--color-error)' : 'var(--color-text)',
                  }}
                >
                  {mtdTotal >= activeReminder.monthlyLimitIdr
                    ? `+${formatRupiah(mtdTotal - activeReminder.monthlyLimitIdr)}`
                    : formatRupiah(activeReminder.monthlyLimitIdr - mtdTotal)}
                </span>
              </div>

              {/* Baris 2: Progress track */}
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, Math.round((mtdTotal / activeReminder.monthlyLimitIdr) * 100))}%`,
                    height: '100%',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: (() => {
                      if (mtdTotal >= activeReminder.monthlyLimitIdr) {
                        return 'var(--color-error)'
                      }
                      const threshold = activeReminder.warningThresholdPercent ?? (activeReminder.earlyWarningEnabled ? 90 : 100)
                      if (threshold > 0 && threshold < 100 && mtdTotal >= activeReminder.monthlyLimitIdr * (threshold / 100)) {
                        return '#f59e0b'
                      }
                      return 'var(--color-accent)'
                    })(),
                    transition: 'width 300ms ease',
                  }}
                />
              </div>

              {/* Baris 3: Konteks Persentase & Tombol Ubah (1 baris rapi) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--color-text-muted)', width: '100%' }}>
                <span>
                  {t('budgetPercentOfLimit', {
                    percent: Math.min(999, Math.round((mtdTotal / activeReminder.monthlyLimitIdr) * 100)),
                    limit: formatRupiah(activeReminder.monthlyLimitIdr),
                  })}
                </span>
                <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                  {t('budgetEditLink')}
                </span>
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsBudgetModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: 'var(--color-surface-raised)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--color-border)',
                color: 'var(--color-text-muted)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                width: '100%',
                fontFamily: 'inherit',
                transition: 'all 150ms ease',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bell size={13} color="var(--color-accent)" />
                <span>{t('budgetReminderBtn')}</span>
              </span>
              <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>+ Atur Target</span>
            </button>
          )
        )}

        {/* Divider & Ringkasan Transaksi */}
        <div
          style={{
            borderTop: '1px solid var(--color-border-subtle)',
            paddingTop: 'var(--space-3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            color: 'var(--color-text-muted)',
          }}
        >
          <span>{t('txRecorded', { count: txCount })}</span>
          <span style={{ fontWeight: 500, color: 'var(--color-text-subtle)' }}>
            {isCurrentMonth ? t('thisMonth') : activeMonthName}
          </span>
        </div>
      </div>

      {/* Akses Spreadsheet — card style seperti referensi */}
      {sheetId ? (
        <a
          href={`https://docs.google.com/spreadsheets/d/${sheetId}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            minHeight: '64px',
            padding: 'var(--space-3) var(--space-3)',
            backgroundColor: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            textDecoration: 'none',
            marginTop: 'var(--space-3)',
            transition: 'opacity var(--duration-fast)',
          }}
        >
          {/* Ikon kiri — Google Sheets green */}
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: '1px solid var(--color-border)',
            }}
          >
            <FileSpreadsheet size={22} color="#34a853" />
          </div>

          {/* Teks tengah */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--color-text)',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {t('spreadsheetTitle')}
            </p>
            <p
              style={{
                fontSize: '0.76rem',
                color: 'var(--color-text-muted)',
                margin: 0,
                marginTop: '2px',
              }}
            >
              {t('spreadsheetSub')}
            </p>
          </div>

          {/* Panah kanan — bulat */}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '1rem',
              color: 'var(--color-text)',
            }}
          >
            →
          </div>
        </a>
      ) : null}

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentSetting={activeReminder}
        currentTotal={mtdTotal}
        onSaved={(saved) => setActiveReminder(saved)}
      />
    </section>
  )
}
