'use client'

import { useState } from 'react'
import { Smartphone, ExternalLink, Calendar, TrendingDown } from 'lucide-react'

import { formatRupiah } from '@/lib/ai/currency'

interface SummaryCardsProps {
  mtdTotal: number
  txCount: number
  sheetId?: string | null
  activeDevice?: {
    label: string
    lastSeenAt: Date | null
  } | null
}

export function SummaryCards({
  mtdTotal,
  txCount,
  sheetId,
  activeDevice,
}: SummaryCardsProps) {
  const [viewMode, setViewMode] = useState<'total' | 'daily'>('total')

  const now = new Date()
  const dayOfMonth = now.getDate()
  const currentMonthName = new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(now)

  const dailyAverage = dayOfMonth > 0 ? Math.round(mtdTotal / dayOfMonth) : mtdTotal
  const displayedAmount = viewMode === 'total' ? mtdTotal : dailyAverage

  return (
    <section
      aria-label="Ringkasan pengeluaran"
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
      {/* Baris Atas: Indikator Perangkat & Bulan */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Calendar size={15} color="var(--color-text-muted)" />
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {currentMonthName}
          </span>
        </div>

        {activeDevice ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
              fontSize: '0.74rem',
              color: 'var(--color-text)',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-success)',
                display: 'inline-block',
              }}
            />
            <Smartphone size={12} color="var(--color-text-muted)" />
            <span>{activeDevice.label}</span>
          </div>
        ) : null}
      </div>

      {/* Angka Utama & Switch Mode */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
          }}
        >
          <div
            style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              color: 'var(--color-text)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            {formatRupiah(displayedAmount)}
          </div>

          {/* Interactive Toggle Pill: Total vs Rata-rata */}
          <div
            style={{
              display: 'inline-flex',
              padding: '3px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('total')}
              style={{
                padding: '4px 10px',
                minHeight: '32px',
                fontSize: '0.74rem',
                fontWeight: viewMode === 'total' ? 600 : 500,
                color: viewMode === 'total' ? 'var(--color-text)' : 'var(--color-text-muted)',
                backgroundColor: viewMode === 'total' ? 'var(--color-surface)' : 'transparent',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                boxShadow: viewMode === 'total' ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                transition: 'all var(--duration-fast) var(--ease-default)',
              }}
            >
              Total
            </button>
            <button
              type="button"
              onClick={() => setViewMode('daily')}
              style={{
                padding: '4px 10px',
                minHeight: '32px',
                fontSize: '0.74rem',
                fontWeight: viewMode === 'daily' ? 600 : 500,
                color: viewMode === 'daily' ? 'var(--color-text)' : 'var(--color-text-muted)',
                backgroundColor: viewMode === 'daily' ? 'var(--color-surface)' : 'transparent',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                boxShadow: viewMode === 'daily' ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                transition: 'all var(--duration-fast) var(--ease-default)',
              }}
            >
              / Hari
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <TrendingDown size={14} color="var(--color-text-muted)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            {viewMode === 'total'
              ? `${txCount} transaksi tercatat bulan ini`
              : `Rata-rata ${dayOfMonth} hari di bulan ini`}
          </span>
        </div>
      </div>

      {/* Akses Cepat Google Sheets */}
      {sheetId ? (
        <a
          href={`https://docs.google.com/spreadsheets/d/${sheetId}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-2)',
            minHeight: '44px',
            padding: 'var(--space-2) var(--space-4)',
            backgroundColor: 'var(--color-surface-raised)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            fontSize: '0.84rem',
            fontWeight: 500,
            transition: 'background-color var(--duration-fast) var(--ease-default)',
          }}
        >
          <ExternalLink size={15} />
          Buka Google Sheets
        </a>
      ) : null}
    </section>
  )
}
