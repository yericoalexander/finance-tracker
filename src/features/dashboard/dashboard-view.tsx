'use client'

import { useState } from 'react'
import { Smartphone, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { CategoryBreakdown } from './category-breakdown'
import { RecentTransactions } from './recent-transactions'
import { ReviewQueue } from './review-queue'
import { SummaryCards } from './summary-cards'
import type { DashboardData } from './actions'

interface DashboardViewProps {
  data: DashboardData
  sheetId?: string | null
}

export function DashboardView({ data, sheetId }: DashboardViewProps) {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 600)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}
    >
      {/* Tombol Refresh / Segarkan */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span
            style={{
              fontSize: '0.78rem',
              color: 'var(--color-text-muted)',
            }}
          >
            Data tersinkron otomatis
          </span>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          aria-label="Segarkan data"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            minHeight: '36px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'transparent',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)',
            fontSize: '0.76rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
          <span>{isRefreshing ? 'Memuat...' : 'Segarkan'}</span>
        </button>
      </div>

      {/* Ringkasan MTD & Toggle / Hari */}
      <SummaryCards
        mtdTotal={data.mtdTotal}
        txCount={data.txCount}
        sheetId={sheetId}
        activeDevice={data.activeDevice}
      />

      {/* Antrean Perlu Dicek (Optimistic Review Queue) */}
      <ReviewQueue items={data.reviewQueue} />

      {/* Breakdown Kategori (Klik kategori untuk menyaring) */}
      <CategoryBreakdown
        categories={data.categoryBreakdown}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Riwayat Transaksi (Pencarian Live & Filter Chips) */}
      <RecentTransactions
        transactions={data.recentTransactions}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Tautan Cepat Pengaturan Perangkat */}
      <div style={{ paddingTop: 'var(--space-2)' }}>
        <a
          href="/pair"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-2)',
            minHeight: '44px',
            padding: 'var(--space-3) var(--space-5)',
            backgroundColor: 'transparent',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: 500,
          }}
        >
          <Smartphone size={16} />
          Kelola Perangkat iPhone
        </a>
      </div>
    </div>
  )
}
