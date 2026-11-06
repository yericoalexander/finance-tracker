'use client'

import { useState, useEffect } from 'react'
import { Plus, ArrowLeftRight, Eye, EyeOff, Pencil, Trash2, MoreHorizontal, RotateCcw } from 'lucide-react'
import { formatRupiah } from '@/lib/ai/currency'
import { usePrivacy } from '@/lib/privacy/context'
import { useI18n } from '@/lib/i18n/context'
import { getWalletTheme, type Wallet } from './types'
import { CardBrandLogo } from './wallet-brand-logo'
import { WalletModal } from './wallet-modal'
import { WalletTransferModal } from './wallet-transfer-modal'
import { useWallets, type WalletFormValues } from './use-wallets'

interface WalletCardProps {
  wallet: Wallet
  index: number
  total: number
  isExpanded: boolean
  isSelected: boolean
  selectedIndex: number
  onClickCard: () => void
  onEdit: (wallet: Wallet) => void
  onDelete: (id: string) => void
  onQuickAdjust: (id: string, delta: number) => void
  isPrivate: boolean
}

function WalletCard({
  wallet,
  index,
  total,
  isExpanded,
  isSelected,
  selectedIndex,
  onClickCard,
  onEdit,
  onDelete,
  onQuickAdjust,
  isPrivate,
}: WalletCardProps) {
  const { t } = useI18n()
  const theme = getWalletTheme(wallet.themeId)
  const isBottomCard = index === total - 1
  const hasSelection = selectedIndex !== -1

  // Posisi tumpukan Apple Wallet presisi tinggi:
  // Base offset normal: 54px per kartu dalam tumpukan awal
  const baseOffset = 54
  const topPosition = index * baseOffset
  let translateY = 0
  let scale = 1
  let zIndex = index + 1
  let opacity = 1

  if (!isExpanded && hasSelection) {
    if (isSelected) {
      // KARTU TERPILIH OTOMATIS NAIK KE PALING ATAS (y = 0)
      // Karena base topPosition = index * 54, translasi -(index * 54) membawanya tepat ke y = 0
      translateY = -(index * baseOffset)
      scale = 1.02
      zIndex = 50
      opacity = 1
    } else {
      // KARTU LAINNYA TURUN KE DECK BAWAH (di bawah kartu terpilih, mulai y = 200px)
      // Hitung urutan kartu lain (0 s/d total - 2)
      const otherIndex = index < selectedIndex ? index : index - 1
      const targetY = 200 + otherIndex * 38
      translateY = targetY - topPosition
      scale = 0.985
      zIndex = 25 + otherIndex
      opacity = 0.88
    }
  }

  return (
    <div
      onClick={onClickCard}
      role="button"
      tabIndex={0}
      aria-expanded={isSelected}
      aria-label={
        isSelected
          ? `Tutup kartu ${wallet.name}`
          : `Pilih kartu ${wallet.name}, saldo ${formatRupiah(wallet.balanceIdr)}`
      }
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClickCard()
        }
      }}
      style={{
        position: isExpanded ? 'relative' : 'absolute',
        top: isExpanded ? 'auto' : `${topPosition}px`,
        left: 0,
        right: 0,
        zIndex,
        transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
        transformOrigin: 'top center',
        opacity,
        // Apple iOS Spring physics halus & instan (420ms)
        transition: isExpanded
          ? `transform 380ms cubic-bezier(0.2, 0.9, 0.2, 1) ${index * 35}ms, box-shadow 300ms ease, opacity 250ms ease`
          : 'transform 420ms cubic-bezier(0.2, 0.9, 0.2, 1), box-shadow 380ms cubic-bezier(0.2, 0.9, 0.2, 1), opacity 280ms ease',
        willChange: 'transform',
        borderRadius: '24px',
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      <div
        style={{
          background: theme.gradient,
          color: theme.textColor,
          borderRadius: '24px',
          padding: '18px 20px',
          minHeight: isExpanded || isSelected || isBottomCard ? '172px' : '96px',
          boxShadow: isSelected
            ? '0 26px 54px -10px rgba(0, 0, 0, 0.44), 0 0 0 1.5px rgba(255, 255, 255, 0.42)'
            : isExpanded
              ? '0 8px 24px rgba(0, 0, 0, 0.1)'
              : '0 4px 18px -2px rgba(0, 0, 0, 0.18)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'min-height 420ms cubic-bezier(0.2, 0.9, 0.2, 1), box-shadow 380ms ease',
        }}
      >
        {/* Shimmer kilau aktif saat kartu dipilih */}
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.2) 50%, transparent 80%)',
              pointerEvents: 'none',
              animation: 'fadeIn 300ms ease',
            }}
          />
        )}

        {/* Lingkaran watermark background khas kartu bank */}
        <div
          style={{
            position: 'absolute',
            right: '-15px',
            top: '-20px',
            width: '135px',
            height: '135px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.07)',
            pointerEvents: 'none',
          }}
        />

        {/* Baris Atas: Logo Bank (kiri) & Saldo Capsule + Quick Actions (kanan) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <CardBrandLogo
            iconType={theme.iconType}
            name={wallet.name}
            textColor={theme.textColor}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Pill Saldo Interaktif: Jika kartu belum aktif, ketuk untuk buka ke atas */}
            <div
              onClick={(e) => {
                if (!isSelected) {
                  // Biarkan event bubble ke pembungkus utama agar kartu naik ke atas
                  return
                }
                e.stopPropagation()
                onEdit(wallet)
              }}
              title={isSelected ? t('walletTapToEdit') : t('walletTapToSelect')}
              style={{
                backgroundColor: theme.pillBg,
                color: theme.pillText,
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.86rem',
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.24)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: isSelected ? '0 2px 10px rgba(0,0,0,0.25)' : 'none',
                transition: 'transform 200ms ease',
              }}
            >
              <span>{isPrivate ? 'Rp ••••••' : formatRupiah(wallet.balanceIdr)}</span>
            </div>

            {/* Aksi Ubah / Hapus saat diperluas atau dipilih */}
            {(isExpanded || isSelected) && (
              <div
                style={{ display: 'flex', gap: '4px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => onEdit(wallet)}
                  aria-label={`${t('walletEdit')} ${wallet.name}`}
                  title={t('walletEdit')}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    backgroundColor: theme.pillBg,
                    color: theme.pillText,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(wallet.id)}
                  aria-label={`${t('walletDelete')} ${wallet.name}`}
                  title={t('walletDelete')}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    backgroundColor: theme.pillBg,
                    color: theme.pillText,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bagian Bawah Kartu (Tampil saat kartu terpilih, diperluas, atau kartu paling depan) */}
        {(isExpanded || isSelected || isBottomCard) && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginTop: '28px',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {/* Quick Adjustment Chips saat kartu terpilih */}
            {isSelected && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexWrap: 'wrap',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {[
                  { label: t('walletAddCash100k'), val: 100000 },
                  { label: t('walletAddCash500k'), val: 500000 },
                  { label: t('walletAddCash1m'), val: 1000000 },
                ].map((chip) => (
                  <button
                    key={chip.val}
                    type="button"
                    onClick={() => onQuickAdjust(wallet.id, chip.val)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid rgba(255, 255, 255, 0.28)',
                      backgroundColor: theme.pillBg,
                      color: theme.pillText,
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      backdropFilter: 'blur(6px)',
                      transition: 'transform 150ms ease',
                    }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: '0.66rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    opacity: 0.72,
                    margin: 0,
                    fontWeight: 600,
                  }}
                >
                  {isSelected ? t('walletTapToEdit') : t('walletActiveCard')}
                </p>
                <p
                  style={{
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    margin: '2px 0 0 0',
                    letterSpacing: '0.05em',
                    opacity: 0.95,
                  }}
                >
                  •••• {wallet.id.slice(0, 4).toUpperCase()}
                </p>
              </div>

              {/* Logo Mastercard untuk gaya Apple Card */}
              {theme.iconType === 'apple' && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(235, 0, 27, 0.45)',
                      marginRight: '-10px',
                      backdropFilter: 'blur(2px)',
                    }}
                  />
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(247, 158, 0, 0.45)',
                      backdropFilter: 'blur(2px)',
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function WalletSection() {
  const { t } = useI18n()
  const {
    wallets,
    isLoaded,
    totalBalance,
    addWallet,
    updateWallet,
    quickAdjustBalance,
    deleteWallet,
    resetToDefault,
  } = useWallets()
  const { isPrivate, togglePrivacy } = usePrivacy('wallets')
  const isExpanded = false
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  const handleSaveNew = (values: WalletFormValues) => {
    addWallet(values)
  }

  const handleSaveEdit = (values: WalletFormValues) => {
    if (!editingWallet) return
    updateWallet(editingWallet.id, values)
    setEditingWallet(null)
  }

  const handleDelete = (id: string) => {
    deleteWallet(id)
    if (selectedCardId === id) setSelectedCardId(null)
  }

  // Tutup kartu terpilih saat menekan tombol Escape di keyboard
  useEffect(() => {
    if (!selectedCardId) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedCardId(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedCardId])

  const handleCardClick = (wallet: Wallet) => {
    if (isExpanded) {
      setEditingWallet(wallet)
      return
    }
    // Jika dalam posisi tumpuk Apple Wallet:
    // Klik kartu tertutup: kartu tersebut otomatis naik ke paling atas
    // Klik kartu yang sedang aktif di atas: kembali ke posisi semula
    if (selectedCardId === wallet.id) {
      setSelectedCardId(null)
    } else {
      setSelectedCardId(wallet.id)
    }
  }

  const selectedIndex = wallets.findIndex((w) => w.id === selectedCardId)
  const hasSelected = selectedIndex !== -1

  // Hitung tinggi kontainer kartu bertumpuk presisi:
  // Offset normal 54px + tinggi kartu depan 180px
  const baseOffset = 54
  const cardHeight = 180
  const bottomDeckTop = 200
  const otherOffset = 38

  const baseCollapsedHeight =
    wallets.length > 0 ? (wallets.length - 1) * baseOffset + cardHeight : 120

  const selectedCollapsedHeight =
    wallets.length > 1
      ? bottomDeckTop + (wallets.length - 2) * otherOffset + cardHeight
      : baseCollapsedHeight

  const collapsedHeight = hasSelected ? selectedCollapsedHeight : baseCollapsedHeight

  if (!isLoaded) {
    return (
      <div
        style={{
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          padding: 'var(--space-5)',
          minHeight: '140px',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      {/* 1. Card Atas: Total Wallet Balance */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: '24px',
          padding: '22px 24px',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative',
        }}
      >
        {/* Header Baris 1: Label + Icon Mata & Menu */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}
        >
          <span
            style={{
              fontSize: '0.88rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              letterSpacing: '-0.01em',
            }}
          >
            {t('walletBalance')}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              onClick={togglePrivacy}
              aria-label={isPrivate ? t('walletShowBalanceAria') : t('walletHideBalanceAria')}
              style={{
                width: '40px',
                height: '40px',
                minWidth: '40px',
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
              }}
            >
              {isPrivate ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>

            <button
              type="button"
              onClick={() => setShowMenu((v) => !v)}
              aria-label={t('walletMenuAria')}
              style={{
                width: '40px',
                height: '40px',
                minWidth: '40px',
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
              }}
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Menu Dropdown Mini */}
        {showMenu && (
          <div
            className="animate-scale-in"
            style={{
              position: 'absolute',
              top: '54px',
              right: '20px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              padding: '6px',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              minWidth: '180px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                resetToDefault()
                setShowMenu(false)
                setSelectedCardId(null)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--color-text)',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <RotateCcw size={14} />
              {t('walletReloadAll')}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(true)
                setShowMenu(false)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--color-text)',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Plus size={14} />
              {t('walletAddNew')}
            </button>
          </div>
        )}

        {/* Saldo Total */}
        <p
          style={{
            fontSize: '2.3rem',
            fontWeight: 800,
            color: 'var(--color-text)',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: isPrivate ? '0.04em' : '-0.03em',
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          {isPrivate ? 'Rp ••••••' : formatRupiah(totalBalance)}
        </p>

        <p
          style={{
            fontSize: '0.78rem',
            color: 'var(--color-text-muted)',
            margin: '6px 0 0 0',
          }}
        >
          {t('walletCardsCount', { count: wallets.length })}
        </p>
      </div>

      {/* 2. Sub-Header: "Wallet" & Tombol Swap + Tambah */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 4px',
        }}
      >
        <span
          style={{
            fontSize: '0.94rem',
            fontWeight: 700,
            color: 'var(--color-text)',
          }}
        >
          {t('walletTitle')}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {wallets.length >= 2 && (
            <button
              type="button"
              onClick={() => setIsTransferOpen(true)}
              aria-label="Pindah Saldo Antar Dompet"
              title="Pindah Saldo Antar Dompet"
              style={{
                width: '40px',
                height: '40px',
                minWidth: '40px',
                minHeight: '40px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 200ms ease',
              }}
            >
              <ArrowLeftRight size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            aria-label={t('walletAddNew')}
            title={t('walletAddNew')}
            style={{
              width: '40px',
              height: '40px',
              minWidth: '40px',
              minHeight: '40px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 150ms ease',
            }}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* 3. Tumpukan Kartu Apple Wallet Interaktif */}
      {wallets.length === 0 ? (
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          style={{
            width: '100%',
            minHeight: '140px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            borderRadius: '24px',
            border: '2px dashed var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            fontSize: '0.88rem',
            fontWeight: 600,
            transition: 'all 150ms ease',
          }}
        >
          <Plus size={22} strokeWidth={2} />
          {t('walletEmptyTitle')}
        </button>
      ) : (
        <>
          {/* Backdrop tak terlihat untuk menutup kartu saat klik di mana pun di luar kartu */}
          {hasSelected && !isExpanded && (
            <div
              onClick={() => setSelectedCardId(null)}
              aria-hidden="true"
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 20,
                backgroundColor: 'transparent',
                cursor: 'default',
              }}
            />
          )}

          <div
            style={{
              position: 'relative',
              height: isExpanded ? 'auto' : `${collapsedHeight}px`,
              display: isExpanded ? 'flex' : 'block',
              flexDirection: 'column',
              gap: isExpanded ? '14px' : undefined,
              transition: 'height 420ms cubic-bezier(0.2, 0.9, 0.2, 1)',
              marginBottom: 'var(--space-2)',
              zIndex: hasSelected && !isExpanded ? 25 : undefined,
            }}
          >
            {wallets.map((wallet, index) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                index={index}
                total={wallets.length}
                isExpanded={isExpanded}
                isSelected={selectedCardId === wallet.id}
                selectedIndex={selectedIndex}
                onClickCard={() => handleCardClick(wallet)}
                onEdit={(w) => setEditingWallet(w)}
                onDelete={handleDelete}
                onQuickAdjust={(id, delta) => quickAdjustBalance(id, delta)}
                isPrivate={isPrivate}
              />
            ))}
          </div>
        </>
      )}

      {/* Modal Pindah Saldo Antar Dompet */}
      <WalletTransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        wallets={wallets}
        onSuccess={(sourceId, destId, amountIdr) => {
          const src = wallets.find((w) => w.id === sourceId)
          const dst = wallets.find((w) => w.id === destId)
          if (src) updateWallet(src.id, { balanceIdr: Math.max(0, src.balanceIdr - amountIdr) })
          if (dst) updateWallet(dst.id, { balanceIdr: dst.balanceIdr + amountIdr })
        }}
      />

      {/* Modal Tambah Dompet */}
      <WalletModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleSaveNew}
        mode="add"
      />

      {/* Modal Ubah Dompet */}
      {editingWallet && (
        <WalletModal
          isOpen
          onClose={() => setEditingWallet(null)}
          onSave={handleSaveEdit}
          initialValues={{
            name: editingWallet.name,
            balanceIdr: editingWallet.balanceIdr,
            themeId: editingWallet.themeId,
          }}
          mode="edit"
        />
      )}
    </div>
  )
}
