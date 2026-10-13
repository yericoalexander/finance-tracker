'use client'

import { useState } from 'react'
import { Smartphone, RefreshCw, BarChart3, Receipt, PlusCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { CategoryBreakdown } from './category-breakdown'
import { ManualEntryCard } from './manual-entry-card'
import { RecentTransactions } from './recent-transactions'
import { ReviewQueue } from './review-queue'
import { SummaryCards } from './summary-cards'
import type { DashboardData } from './actions'

type TabType = 'overview' | 'transactions' | 'add'

interface DashboardViewProps {
  data: DashboardData
  sheetId?: string | null
}

export function DashboardView({ data, sheetId }: DashboardViewProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 600)
  }

  const handleCategoryJumpToTransactions = (category: string) => {
    setSelectedCategory(category)
    setActiveTab('transactions')
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
      }}
    >
      {/* Tab Navigasi Segmented Control */}
      <nav
        aria-label="Pilihan tampilan dashboard"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          backgroundColor: 'var(--color-surface)',
          padding: '4px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          gap: '4px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            minHeight: '44px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: activeTab === 'overview' ? 'var(--color-accent)' : 'transparent',
            color: activeTab === 'overview' ? 'var(--color-accent-text)' : 'var(--color-text-muted)',
            fontSize: '0.84rem',
            fontWeight: activeTab === 'overview' ? 600 : 500,
            cursor: 'pointer',
            transition: 'all var(--duration-fast) var(--ease-default)',
            position: 'relative',
          }}
        >
          <BarChart3 size={16} />
          <span>Ringkasan</span>
          {data.reviewQueue.length > 0 ? (
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-warning)',
              }}
            />
          ) : null}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('transactions')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            minHeight: '44px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: activeTab === 'transactions' ? 'var(--color-accent)' : 'transparent',
            color: activeTab === 'transactions' ? 'var(--color-accent-text)' : 'var(--color-text-muted)',
            fontSize: '0.84rem',
            fontWeight: activeTab === 'transactions' ? 600 : 500,
            cursor: 'pointer',
            transition: 'all var(--duration-fast) var(--ease-default)',
          }}
        >
          <Receipt size={16} />
          <span>Transaksi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('add')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            minHeight: '44px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: activeTab === 'add' ? 'var(--color-accent)' : 'transparent',
            color: activeTab === 'add' ? 'var(--color-accent-text)' : 'var(--color-text-muted)',
            fontSize: '0.84rem',
            fontWeight: activeTab === 'add' ? 600 : 500,
            cursor: 'pointer',
            transition: 'all var(--duration-fast) var(--ease-default)',
          }}
        >
          <PlusCircle size={16} />
          <span>Catat</span>
        </button>
      </nav>

      {/* Konten Tab 1: Ringkasan Interaktif */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Baris Status Sinkronisasi & Refresh */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Data tersinkron otomatis ke Sheets
            </span>
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

          {/* Kartu Ringkasan MTD & Toggle Rata-rata Harian */}
          <SummaryCards
            mtdTotal={data.mtdTotal}
            txCount={data.txCount}
            sheetId={sheetId}
            activeDevice={data.activeDevice}
          />

          {/* Antrean Perlu Dicek (Hanya tampil jika ada screenshot ambigu) */}
          <ReviewQueue items={data.reviewQueue} />

          {/* Distribusi Pengeluaran per Kategori */}
          <CategoryBreakdown
            categories={data.categoryBreakdown}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onViewCategoryInTransactions={handleCategoryJumpToTransactions}
          />

          {/* Tautan Pengaturan Perangkat iPhone */}
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
      )}

      {/* Konten Tab 2: Riwayat Transaksi & Filter Interaktif */}
      {activeTab === 'transactions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <RecentTransactions
            transactions={data.recentTransactions}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onNavigateToAdd={() => setActiveTab('add')}
          />
        </div>
      )}

      {/* Konten Tab 3: Tambah / Catat Transaksi Manual */}
      {activeTab === 'add' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <ManualEntryCard onSuccess={() => setActiveTab('transactions')} />
        </div>
      )}
    </div>
  )
}
