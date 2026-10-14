'use client'

import { useState, useEffect, useRef } from 'react'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { CategoryBreakdown } from './category-breakdown'
import { ManualEntryCard } from './manual-entry-card'
import { RecentTransactions } from './recent-transactions'
import { SummaryCards } from './summary-cards'
import { MonthNavigator } from './month-navigator'
import { getMonthSummaryAction, type DashboardData } from './actions'
import { DeviceSetupBanner } from '@/features/devices/device-setup-banner'
import { ShortcutOnboardingModal } from '@/features/devices/shortcut-onboarding-modal'

type TabType = 'overview' | 'transactions' | 'add'

interface DashboardViewProps {
  data: DashboardData
  sheetId?: string | null
  header?: React.ReactNode
  banner?: React.ReactNode
  userName?: string
}

export function DashboardView({ data, sheetId, header, banner, userName }: DashboardViewProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [newTxAlert, setNewTxAlert] = useState<string | null>(null)
  const prevFirstTxId = useRef<string | null>(data.recentTransactions[0]?.id ?? null)
  const headerContainerRef = useRef<HTMLDivElement>(null)
  const [stickyOffset, setStickyOffset] = useState<number>(136)

  const currentMonthPrefix = new Date().toISOString().slice(0, 7)
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthPrefix)
  const [isMonthLoading, setIsMonthLoading] = useState(false)

  // Cache data per bulan untuk perpindahan instan (0ms jika sudah ada)
  const [monthCache, setMonthCache] = useState<
    Record<
      string,
      {
        total: number
        txCount: number
        categoryBreakdown: typeof data.categoryBreakdown
      }
    >
  >({
    [currentMonthPrefix]: {
      total: data.mtdTotal,
      txCount: data.txCount,
      categoryBreakdown: data.categoryBreakdown,
    },
  })

  // Sinkronisasi data bulan berjalan saat props diperbarui
  useEffect(() => {
    setMonthCache((prev) => ({
      ...prev,
      [currentMonthPrefix]: {
        total: data.mtdTotal,
        txCount: data.txCount,
        categoryBreakdown: data.categoryBreakdown,
      },
    }))
  }, [data.mtdTotal, data.txCount, data.categoryBreakdown, currentMonthPrefix])

  const refreshMonthSummary = async (month: string) => {
    if (month === currentMonthPrefix) return
    try {
      const res = await getMonthSummaryAction(month)
      if (res.ok && res.data) {
        setMonthCache((prev) => ({
          ...prev,
          [month]: {
            total: res.data!.total,
            txCount: res.data!.txCount,
            categoryBreakdown: res.data!.categoryBreakdown,
          },
        }))
      }
    } catch (err) {
      console.warn('[Dashboard] Gagal memuat data bulan:', err)
    }
  }

  // Sinkronisasi data bulan terpilih saat ada transaksi baru yang masuk
  useEffect(() => {
    if (selectedMonth !== currentMonthPrefix) {
      void refreshMonthSummary(selectedMonth)
    }
  }, [data.recentTransactions, selectedMonth, currentMonthPrefix])

  const handleMonthChange = async (newMonth: string) => {
    setSelectedMonth(newMonth)
    if (monthCache[newMonth]) {
      void refreshMonthSummary(newMonth)
      return
    }

    setIsMonthLoading(true)
    try {
      const res = await getMonthSummaryAction(newMonth)
      if (res.ok && res.data) {
        setMonthCache((prev) => ({
          ...prev,
          [newMonth]: {
            total: res.data!.total,
            txCount: res.data!.txCount,
            categoryBreakdown: res.data!.categoryBreakdown,
          },
        }))
      }
    } catch (err) {
      console.warn('[Dashboard] Gagal memuat data bulan:', err)
    } finally {
      setIsMonthLoading(false)
    }
  }

  const currentSummary = monthCache[selectedMonth] ?? {
    total: 0,
    txCount: 0,
    categoryBreakdown: [],
  }

  const isCurrentMonth = selectedMonth === currentMonthPrefix
  const [activeYearNum, activeMonthNum] = selectedMonth.split('-').map(Number)
  const activeMonthDate = new Date(activeYearNum || 2026, (activeMonthNum || 10) - 1, 1)
  const monthNameText = new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(activeMonthDate)

  const monthLabel = isCurrentMonth ? 'Bulan Ini' : monthNameText

  // Ukur tinggi pasti sticky header agar sub-header di tab transaksi menempel tepat di bawahnya tanpa gap
  useEffect(() => {
    const el = headerContainerRef.current
    if (!el) return

    const updateHeight = () => {
      if (headerContainerRef.current) {
        setStickyOffset(headerContainerRef.current.offsetHeight)
      }
    }

    updateHeight()
    const ro = new ResizeObserver(updateHeight)
    ro.observe(el)

    return () => ro.disconnect()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    router.refresh()
    if (selectedMonth !== currentMonthPrefix) {
      await refreshMonthSummary(selectedMonth)
    }
    setTimeout(() => setIsRefreshing(false), 500)
  }

  // Auto-refresh pintar & realtime:
  // 1. Langsung refresh saat kembali ke aplikasi (window focus / visibilitychange)
  // 2. Fast burst di +1.5s dan +3.5s untuk menangkap transaksi yang baru selesai diekstrak AI
  // 3. Polling aktif setiap 4 detik saat tab terbuka dan terlihat
  // 4. Nol konsumsi daya saat layar mati / tab di background
  useEffect(() => {
    let lastRefresh = 0

    const triggerRefresh = () => {
      const now = Date.now()
      if (now - lastRefresh < 2000) return
      lastRefresh = now
      router.refresh()
      if (selectedMonth !== currentMonthPrefix) {
        void refreshMonthSummary(selectedMonth)
      }
    }

    const handleFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        triggerRefresh()
        const t1 = setTimeout(triggerRefresh, 1500)
        const t2 = setTimeout(triggerRefresh, 3500)
        return () => {
          clearTimeout(t1)
          clearTimeout(t2)
        }
      }
    }

    let cancelBurst: (() => void) | undefined

    const onVisibilityChange = () => {
      cancelBurst?.()
      cancelBurst = handleFocusOrVisible()
    }

    const onFocus = () => {
      cancelBurst?.()
      cancelBurst = handleFocusOrVisible()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('focus', onFocus)

    // Polling aktif 4 detik hanya saat layar aktif
    const intervalTimer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        triggerRefresh()
      }
    }, 4000)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('focus', onFocus)
      clearInterval(intervalTimer)
      cancelBurst?.()
    }
  }, [router, selectedMonth, currentMonthPrefix])

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
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Modal Onboarding Otomatis jika Belum Ada iPhone Terhubung */}
      <ShortcutOnboardingModal hasActiveDevice={Boolean(data.activeDevice)} userName={userName} />

      {/* Sticky Top Header (FINANCE. + Toggle/Avatar + Segmented Tabs) */}
      <div
        ref={headerContainerRef}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 35,
          backgroundColor: 'var(--color-bg)',
          paddingTop: 'calc(var(--space-4) + env(safe-area-inset-top, 0px))',
          paddingBottom: 'var(--space-3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        {header}

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
      </div>

      {banner ? <div style={{ margin: 'var(--space-2) 0 var(--space-4) 0' }}>{banner}</div> : null}

      {/* Tab: Ringkasan */}
      {activeTab === 'overview' && (
        <div key="overview" className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', paddingTop: 'var(--space-1)' }}>
          {/* Banner Pemasangan Shortcut iPhone jika Belum Terhubung */}
          <DeviceSetupBanner hasActiveDevice={Boolean(data.activeDevice)} />

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

          <MonthNavigator
            selectedMonth={selectedMonth}
            currentMonthPrefix={currentMonthPrefix}
            availableMonths={data.availableMonths ?? [currentMonthPrefix]}
            onChangeMonth={handleMonthChange}
            isLoading={isMonthLoading}
          />

          <SummaryCards
            mtdTotal={currentSummary.total}
            txCount={currentSummary.txCount}
            sheetId={sheetId}
            activeDevice={data.activeDevice}
            selectedMonth={selectedMonth}
            currentMonthPrefix={currentMonthPrefix}
          />

          <CategoryBreakdown
            categories={currentSummary.categoryBreakdown}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onViewCategoryInTransactions={handleCategoryJump}
            monthLabel={monthLabel}
          />
        </div>
      )}

      {/* Tab: Transaksi */}
      {activeTab === 'transactions' && (
        <div key="transactions" className="animate-fade-in">
          <RecentTransactions
            transactions={data.recentTransactions}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onNavigateToAdd={() => setActiveTab('add')}
            stickyOffset={stickyOffset}
          />
        </div>
      )}

      {/* Tab: Catat */}
      {activeTab === 'add' && (
        <div key="add" className="animate-fade-in" style={{ paddingTop: 'var(--space-2)' }}>
          <ManualEntryCard onSuccess={() => setActiveTab('transactions')} />
        </div>
      )}
    </div>
  )
}
