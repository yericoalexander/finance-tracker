'use client'

import { FileSpreadsheet } from 'lucide-react'

import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'

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

export function SummaryCards({ mtdTotal, txCount, sheetId }: SummaryCardsProps) {
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
    <section aria-label="Ringkasan keuangan">
      {/* 2-column card grid mirip referensi */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-3)',
        }}
      >
        {/* Kartu Pengeluaran */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-4)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-expense-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowDownLeft size={14} color="var(--color-expense)" />
            </div>
          </div>
          <div>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              ↓ Pengeluaran
            </p>
            <p
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--color-text)',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.03em',
                lineHeight: 1.2,
              }}
            >
              {formatRupiah(displayedAmount)}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {currentMonthName}
            </p>
          </div>
        </div>

        {/* Kartu Pemasukan — placeholder (data belum tersedia, tampilkan Rp0) */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-4)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-income-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowUpRight size={14} color="var(--color-income)" />
            </div>
          </div>
          <div>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              ↑ Pemasukan
            </p>
            <p
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--color-text)',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.03em',
                lineHeight: 1.2,
              }}
            >
              {formatRupiah(0)}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {currentMonthName}
            </p>
          </div>
        </div>
      </div>

      {/* Baris konteks: jumlah transaksi + toggle total/harian */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          padding: 'var(--space-3) var(--space-4)',
        }}
      >
        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
          {txCount} transaksi tercatat
        </span>

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
                padding: '3px 10px',
                minHeight: '28px',
                fontSize: '0.72rem',
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
              {mode === 'total' ? 'Total' : '/ Hari'}
            </button>
          ))}
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
              Spreadsheet
            </p>
            <p
              style={{
                fontSize: '0.76rem',
                color: 'var(--color-text-muted)',
                margin: 0,
                marginTop: '2px',
              }}
            >
              Google Sheets pribadi
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
    </section>
  )
}
