'use client'

import { useState, useEffect, useRef } from 'react'
import { RefreshCw, X, LayoutDashboard, Receipt, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { CategoryBreakdown } from './category-breakdown'
import { ManualEntryCard } from './manual-entry-card'
import { RecentTransactions } from './recent-transactions'
import { SummaryCards } from './summary-cards'
import { MonthNavigator } from './month-navigator'
import { getMonthSummaryAction, type DashboardData } from './actions'
import { DeviceSetupBanner } from '@/features/devices/device-setup-banner'
import { ShortcutOnboardingModal } from '@/features/devices/shortcut-onboarding-modal'
import { registerAndSubscribePush } from '@/lib/push/client'
import { useI18n } from '@/lib/i18n/context'

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
  const { t, formatMonthName } = useI18n()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [newTxAlert, setNewTxAlert] = useState<{ id: string; merchant: string } | null>(null)

  // Catat transaksi yang sudah ada sejak awal agar refresh tidak pernah memicu notifikasi untuk data lama
  const seenTxIds = useRef<Set<string>>(new Set(data.recentTransactions.map((tx) => tx.id)))
  const dismissedTxIds = useRef<Set<string>>(new Set())

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

  // Sinkronisasi otomatis langganan Web Push perangkat ke server jika izin notifikasi aktif
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      void registerAndSubscribePush().catch(() => null)
    }
  }, [])

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
  const monthNameText = formatMonthName(activeMonthDate)

  const monthLabel = isCurrentMonth ? t('thisMonth') : monthNameText

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
  // 1. Data awal dari server sudah 100% segar (tidak ada refresh ganda saat buka aplikasi)
  // 2. Langsung refresh saat kembali ke aplikasi dari Back Tap / Shortcut (visibilitychange)
  // 3. Polling tenang setiap 12 detik saat aplikasi dibiarkan terbuka
  // 4. Nol konsumsi daya saat layar mati / tab di background
  useEffect(() => {
    // Inisialisasi dengan timestamp saat ini agar tidak memicu refresh ganda saat baru dimount
    let lastRefresh = Date.now()

    const triggerRefresh = () => {
      const now = Date.now()
      if (now - lastRefresh < 1500) return
      lastRefresh = now
      router.refresh()
      if (selectedMonth !== currentMonthPrefix) {
        void refreshMonthSummary(selectedMonth)
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now()
        // Langsung refresh instan saat tab dibuka kembali setelah Back Tap
        if (now - lastRefresh >= 1500) {
          triggerRefresh()
        }
        // Follow-up bertahap untuk menangkap transaksi yang baru selesai diproses server
        const t1 = setTimeout(triggerRefresh, 1500)
        const t2 = setTimeout(triggerRefresh, 3500)
        return () => {
          clearTimeout(t1)
          clearTimeout(t2)
        }
      }
    }

    let cancelFollowUp: (() => void) | undefined

    const onVisibilityChange = () => {
      cancelFollowUp?.()
      cancelFollowUp = handleVisibilityChange()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)

    // Polling aktif 6 detik saat tab terbuka dan terlihat di layar
    const intervalTimer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        triggerRefresh()
      }
    }, 6000)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      clearInterval(intervalTimer)
      cancelFollowUp?.()
    }
  }, [router, selectedMonth, currentMonthPrefix])

  // Deteksi hanya transaksi baru yang belum pernah dimunculkan notifikasinya
  useEffect(() => {
    const latestTx = data.recentTransactions[0]
    if (
      latestTx &&
      !seenTxIds.current.has(latestTx.id) &&
      !dismissedTxIds.current.has(latestTx.id)
    ) {
      // Tandai langsung di seenTxIds agar tidak pernah terpicu ulang oleh polling / re-render
      seenTxIds.current.add(latestTx.id)
      setNewTxAlert({
        id: latestTx.id,
        merchant: latestTx.merchant ?? 'Transaksi',
      })
    }
  }, [data.recentTransactions])

  // Timer auto-dismiss 4 detik
  useEffect(() => {
    if (!newTxAlert) return
    const timer = setTimeout(() => {
      setNewTxAlert(null)
    }, 4000)
    return () => clearTimeout(timer)
  }, [newTxAlert])

  const handleDismissAlert = () => {
    if (newTxAlert) {
      dismissedTxIds.current.add(newTxAlert.id)
      seenTxIds.current.add(newTxAlert.id)
    }
    setNewTxAlert(null)
  }

  const handleViewAlertTransaction = () => {
    handleDismissAlert()
    setActiveTab('transactions')
  }

  const handleCategoryJump = (category: string) => {
    setSelectedCategory(category)
    setActiveTab('transactions')
  }

  const tabs = [
    {
      id: 'overview' as TabType,
      label: t('navOverview'),
      icon: <LayoutDashboard size={15} strokeWidth={2.2} />,
    },
    {
      id: 'transactions' as TabType,
      label: t('navTransactions'),
      icon: <Receipt size={15} strokeWidth={2.2} />,
    },
    {
      id: 'add' as TabType,
      label: t('navAdd'),
      icon: <Plus size={16} strokeWidth={2.6} />,
    },
  ]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: 'calc(98px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* Modal Onboarding Otomatis jika Belum Ada iPhone Terhubung */}
      <ShortcutOnboardingModal hasActiveDevice={Boolean(data.activeDevice)} userName={userName} />

      {/* Sticky Top Header (FINANCE. + Profile/Avatar + Notifikasi Alert) */}
      <div
        ref={headerContainerRef}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 35,
          backgroundColor: 'var(--color-bg)',
          paddingTop: 'calc(var(--space-4) + env(safe-area-inset-top, 0px))',
          paddingBottom: 'var(--space-2)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
      >
        <div key="dashboard-header-slot">{header}</div>

        {/* Notifikasi Transaksi Baru Masuk (Muncul 1x, langsung hilang saat diklik) */}
        {newTxAlert ? (
          <div
            role="status"
            aria-live="polite"
            className="animate-slide-up"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-2)',
              padding: '6px 12px 6px 14px',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-text)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}
            >
              {t('newTxAlert', { merchant: newTxAlert.merchant })}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <button
                type="button"
                onClick={handleViewAlertTransaction}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--color-accent-text)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '4px 6px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {t('viewTx')}
              </button>
              <button
                type="button"
                onClick={handleDismissAlert}
                aria-label={t('closeNotification')}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--color-accent-text)',
                  cursor: 'pointer',
                  padding: '0 4px',
                  minWidth: '44px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.8,
                }}
              >
                <X size={15} />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {banner ? <div style={{ margin: 'var(--space-2) 0 var(--space-4) 0' }}>{banner}</div> : null}

      {/* Tab: Ringkasan */}
      {activeTab === 'overview' && (
        <div
          key="overview"
          className="animate-fade-in"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            paddingTop: 'var(--space-1)',
          }}
        >
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
            <span
              style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}
            >
              {t('syncedToSheets')}
            </span>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              aria-label={t('refresh')}
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
              {isRefreshing ? t('refreshing') : t('refresh')}
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
            reminderSetting={data.reminderSetting}
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

      {/* Floating Bottom Navigation Bar — Ergonomis di jangkauan jempol iPhone */}
      <nav
        aria-label="Pilihan tampilan dashboard"
        style={{
          position: 'fixed',
          bottom: 'calc(28px + env(safe-area-inset-bottom, 0px))',
          left: 0,
          right: 0,
          margin: '0 auto',
          width: 'calc(100% - 32px)',
          maxWidth: '390px',
          zIndex: 40,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            backgroundColor: 'var(--color-surface)',
            padding: '5px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
            gap: '4px',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
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
                  minHeight: '44px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
                  color: isActive ? 'var(--color-accent-text)' : 'var(--color-text-muted)',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 600,
                  cursor: 'pointer',
                  transition: 'all var(--duration-fast) var(--ease-default)',
                  fontFamily: 'inherit',
                  letterSpacing: isActive ? '-0.01em' : '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '0 8px',
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
