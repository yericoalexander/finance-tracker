'use client'

import { useState, useEffect, useRef } from 'react'
import { RefreshCw, X, LayoutDashboard, ReceiptText, Plus, Wallet } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { CategoryBreakdown } from './category-breakdown'
import { ManualEntryCard } from './manual-entry-card'
import { RecentTransactions } from './recent-transactions'
import { SummaryCards } from './summary-cards'
import { MonthNavigator } from './month-navigator'
import { getMonthSummaryAction, type DashboardData } from './actions'
import { DeviceSetupBanner } from '@/features/devices/device-setup-banner'
import { ShortcutOnboardingModal } from '@/features/devices/shortcut-onboarding-modal'
import { WalletSection } from '@/features/wallets/wallet-section'
import { registerAndSubscribePush } from '@/lib/push/client'
import { useI18n } from '@/lib/i18n/context'

type TabType = 'overview' | 'wallets' | 'transactions' | 'add'

interface DashboardViewProps {
  data: DashboardData
  sheetId?: string | null
  header?: React.ReactNode
  banner?: React.ReactNode
  userName?: string
  initialTab?: TabType
}

export function DashboardView({
  data,
  sheetId,
  header,
  banner,
  userName,
  initialTab = 'overview',
}: DashboardViewProps) {
  const router = useRouter()
  const { t, formatMonthName } = useI18n()
  const [activeTab, setActiveTabState] = useState<TabType>(initialTab)

  const handleTabChange = (tab: TabType) => {
    setActiveTabState(tab)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      if (tab === 'overview') {
        url.searchParams.delete('tab')
      } else {
        url.searchParams.set('tab', tab)
      }
      window.history.replaceState(null, '', url.toString())
    }
  }
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
        income: number
        txCount: number
        categoryBreakdown: typeof data.categoryBreakdown
      }
    >
  >({
    [currentMonthPrefix]: {
      total: data.mtdTotal,
      income: data.mtdIncome ?? 0,
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
        income: data.mtdIncome ?? 0,
        txCount: data.txCount,
        categoryBreakdown: data.categoryBreakdown,
      },
    }))
  }, [data.mtdTotal, data.mtdIncome, data.txCount, data.categoryBreakdown, currentMonthPrefix])

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
            income: res.data!.income ?? 0,
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
            income: res.data!.income ?? 0,
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
    income: 0,
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
    handleTabChange('transactions')
  }

  const handleCategoryJump = (category: string) => {
    setSelectedCategory(category)
    handleTabChange('transactions')
  }

  const tabs = [
    {
      id: 'overview' as TabType,
      label: t('navOverview'),
      renderIcon: (isActive: boolean) => (
        <LayoutDashboard size={20} strokeWidth={isActive ? 2.4 : 1.8} />
      ),
    },
    {
      id: 'wallets' as TabType,
      label: t('navWallets'),
      renderIcon: (isActive: boolean) => (
        <Wallet size={20} strokeWidth={isActive ? 2.4 : 1.8} />
      ),
    },
    {
      id: 'transactions' as TabType,
      label: t('navTransactions'),
      renderIcon: (isActive: boolean) => (
        <ReceiptText size={20} strokeWidth={isActive ? 2.4 : 1.8} />
      ),
    },
    {
      id: 'add' as TabType,
      label: t('navAdd'),
      renderIcon: (isActive: boolean) => (
        <Plus size={20} strokeWidth={isActive ? 2.8 : 2.0} />
      ),
    },
  ]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
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
            mtdIncome={currentSummary.income}
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

      {/* Tab: Dompet (Wallet Balance & Card Stack) */}
      {activeTab === 'wallets' && (
        <div key="wallets" className="animate-fade-in" style={{ paddingTop: 'var(--space-1)' }}>
          <WalletSection />
        </div>
      )}

      {/* Tab: Transaksi */}
      {activeTab === 'transactions' && (
        <div key="transactions" className="animate-fade-in">
          <RecentTransactions
            transactions={data.recentTransactions}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onNavigateToAdd={() => handleTabChange('add')}
            stickyOffset={stickyOffset}
          />
        </div>
      )}

      {/* Tab: Catat */}
      {activeTab === 'add' && (
        <div key="add" className="animate-fade-in" style={{ paddingTop: 'var(--space-2)' }}>
          <ManualEntryCard onSuccess={() => handleTabChange('transactions')} />
        </div>
      )}

      {/* Bottom Navigation Bar — Tetap stay di paling bawah, bersih & konsisten di iPhone */}
      <nav
        aria-label={t('navDashboardTabsAria')}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          margin: '0 auto',
          width: '100%',
          maxWidth: '430px',
          zIndex: 50,
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          boxShadow: '0 -2px 12px rgba(0, 0, 0, 0.04)',
          paddingTop: '6px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)',
          paddingLeft: '10px',
          paddingRight: '10px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '6px',
            alignItems: 'center',
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  minHeight: '48px',
                  padding: '4px 2px',
                  backgroundColor: isActive ? 'var(--color-surface-raised)' : 'transparent',
                  border: isActive ? '1px solid var(--color-border)' : '1px solid transparent',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
                  boxShadow: isActive ? '0 1px 3px rgba(0, 0, 0, 0.04)' : 'none',
                  transition: 'all var(--duration-fast) var(--ease-default)',
                  fontFamily: 'inherit',
                  userSelect: 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '22px',
                  }}
                >
                  {tab.renderIcon(isActive)}
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: isActive ? 750 : 500,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.1,
                    color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
                    transition: 'color var(--duration-fast) var(--ease-default)',
                  }}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
