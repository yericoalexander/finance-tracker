'use client'

import { useState, useEffect, useRef } from 'react'
import { RefreshCw, Receipt } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { CategoryBreakdown } from './category-breakdown'
import { ManualEntryCard } from './manual-entry-card'
import { RecentTransactions } from './recent-transactions'
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
  const [newTxAlert, setNewTxAlert] = useState<string | null>(null)
  const prevFirstTxId = useRef<string | null>(data.recentTransactions[0]?.id ?? null)

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 600)
  }

  // Auto-refresh saat window focus atau tab aktif kembali, serta polling berkala
  useEffect(() => {
    const handleRevalidate = () => {
      if (document.visibilityState === 'visible') {
        router.refresh()
      }
    }
    const handleFocus = () => router.refresh()

    document.addEventListener('visibilitychange', handleRevalidate)
    window.addEventListener('focus', handleFocus)

    // Polling setiap 12 detik saat tab terbuka agar hemat bandwidth & tidak membebani ponsel
    const intervalTimer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        router.refresh()
      }
    }, 12000)

    return () => {
      document.removeEventListener('visibilitychange', handleRevalidate)
      window.removeEventListener('focus', handleFocus)
      clearInterval(intervalTimer)
    }
  }, [router])

  // Deteksi transaksi baru yang baru saja masuk
  useEffect(() => {
    const currentFirstId = data.recentTransactions[0]?.id ?? null
    if (prevFirstTxId.current && currentFirstId && prevFirstTxId.current !== currentFirstId) {
      const newTx = data.recentTransactions[0]
      if (newTx) {
        setNewTxAlert(`${newTx.merchant ?? 'Transaksi'} baru saja masuk!`)
        const timer = setTimeout(() => setNewTxAlert(null), 4000)
        return () => clearTimeout(timer)
      }
    }
    prevFirstTxId.current = currentFirstId
  }, [data.recentTransactions])

  const handleCategoryJump = (category: string) => {
    setSelectedCategory(category)
    setActiveTab('transactions')
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'Ringkasan' },
    { id: 'transactions' as TabType, label: 'Transaksi' },
    { id: 'add' as TabType, label: '+ Catat' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Notifikasi Transaksi Baru Masuk */}
      {newTxAlert ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-2) var(--space-4)',
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-accent-text)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}
        >
          <span>✨ {newTxAlert}</span>
          <button
            type="button"
            onClick={() => {
              setActiveTab('transactions')
              setNewTxAlert(null)
            }}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--color-accent-text)',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            Lihat Transaksi
          </button>
        </div>
      ) : null}
      {/* Segmented Tab Control — clean, mirip referensi */}
      <nav
        aria-label="Pilihan tampilan dashboard"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          backgroundColor: 'var(--color-surface)',
          padding: '4px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          gap: '4px',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                minHeight: '40px',
                borderRadius: 'calc(var(--radius-xl) - 4px)',
                border: 'none',
                backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
                color: isActive ? 'var(--color-accent-text)' : 'var(--color-text-muted)',
                fontSize: '0.82rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all var(--duration-fast) var(--ease-default)',
                fontFamily: 'inherit',
                letterSpacing: isActive ? '-0.01em' : '0',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </nav>

      {/* Tab: Ringkasan */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Sync status & refresh */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              Tersinkron ke Sheets
            </span>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              aria-label="Segarkan data"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                minHeight: '32px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
                fontSize: '0.73rem',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'opacity var(--duration-fast)',
                opacity: isRefreshing ? 0.5 : 1,
              }}
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Memuat...' : 'Segarkan'}
            </button>
          </div>

          <SummaryCards
            mtdTotal={data.mtdTotal}
            txCount={data.txCount}
            sheetId={sheetId}
            activeDevice={data.activeDevice}
          />

          {/* Card Transaksi — Identik dengan referensi Image 1 */}
          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            aria-label="Lihat semua transaksi"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              minHeight: '64px',
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              fontFamily: 'inherit',
              transition: 'opacity var(--duration-fast), transform var(--duration-fast)',
            }}
          >
            {/* Ikon kiri */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid var(--color-border)',
              }}
            >
              <Receipt size={18} color="var(--color-text-muted)" />
            </div>

            {/* Teks tengah */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                Transaksi
              </p>
              <p
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--color-text-muted)',
                  margin: '2px 0 0 0',
                }}
              >
                Lihat semua catatan keuangan
              </p>
            </div>

            {/* Panah kanan — bulat */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '0.9rem',
                color: 'var(--color-text)',
              }}
            >
              →
            </div>
          </button>

          <CategoryBreakdown
            categories={data.categoryBreakdown}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onViewCategoryInTransactions={handleCategoryJump}
          />
        </div>
      )}

      {/* Tab: Transaksi */}
      {activeTab === 'transactions' && (
        <RecentTransactions
          transactions={data.recentTransactions}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onNavigateToAdd={() => setActiveTab('add')}
        />
      )}

      {/* Tab: Catat */}
      {activeTab === 'add' && (
        <ManualEntryCard onSuccess={() => setActiveTab('transactions')} />
      )}
    </div>
  )
}
