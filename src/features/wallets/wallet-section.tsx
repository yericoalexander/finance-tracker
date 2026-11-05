'use client'

import { useState } from 'react'
import { Plus, ArrowLeftRight, Eye, EyeOff, Pencil, Trash2, MoreHorizontal, RotateCcw, Sparkles } from 'lucide-react'
import { formatRupiah } from '@/lib/ai/currency'
import { usePrivacy } from '@/lib/privacy/context'
import { getWalletTheme, type Wallet } from './types'
import { WalletModal } from './wallet-modal'
import { useWallets, type WalletFormValues } from './use-wallets'

// Logo mikro bank & kartu presisi tinggi
function CardBrandLogo({ iconType, name, textColor }: { iconType: string; name: string; textColor: string }) {
  if (iconType === 'bca') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 10h16v10H4z" fill="#003d79" />
            <path d="M12 3l9 6H3l9-6z" fill="#003d79" />
            <path d="M7 10v7M12 10v7M17 10v7" stroke="#ffffff" strokeWidth="1.5" />
          </svg>
        </div>
        <span style={{ fontSize: '0.94rem', fontWeight: 800, letterSpacing: '0.04em', color: textColor }}>
          {name || 'BCA'}
        </span>
      </div>
    )
  }

  if (iconType === 'ocbc') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#c4121a',
            fontWeight: 900,
            fontSize: '15px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            flexShrink: 0,
          }}
        >
          ✺
        </div>
        <span style={{ fontSize: '0.94rem', fontWeight: 800, letterSpacing: '0.02em', color: textColor }}>
          {name || 'OCBC'}
        </span>
      </div>
    )
  }

  if (iconType === 'bri') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            backgroundColor: '#00529c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '12px',
            letterSpacing: '-0.5px',
            flexShrink: 0,
          }}
        >
          BB
        </div>
        <span style={{ fontSize: '0.94rem', fontWeight: 800, letterSpacing: '0.04em', color: textColor }}>
          {name || 'BRI'}
        </span>
      </div>
    )
  }

  if (iconType === 'krom') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '7px',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#5b21b6',
            fontWeight: 900,
            fontSize: '16px',
            fontFamily: 'system-ui',
            flexShrink: 0,
          }}
        >
          k
        </div>
        <span style={{ fontSize: '0.96rem', fontWeight: 800, letterSpacing: '-0.02em', color: textColor }}>
          {name || 'krom'}
        </span>
      </div>
    )
  }

  if (iconType === 'n26') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span
          style={{
            fontSize: '1.1rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: textColor,
            borderBottom: '2px solid currentColor',
            lineHeight: 1,
            paddingBottom: '2px',
          }}
        >
          N̄
        </span>
        <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: textColor }}>
          26
        </span>
      </div>
    )
  }

  if (iconType === 'apple') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <svg width="22" height="22" viewBox="0 0 170 170" fill={textColor}>
          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.85-12.01-14.42-6.53-9.98-11.75-21.28-15.66-33.89-3.91-12.61-5.87-24.35-5.87-35.22 0-14.35 3.48-26.31 10.45-35.89 6.96-9.57 15.65-14.42 26.06-14.55 4.35 0 9.28 1.16 14.79 3.47 5.51 2.32 9.07 3.53 10.68 3.63 2.12-.21 5.92-1.48 11.41-3.8 5.48-2.32 10.25-3.32 14.3-3 10.55.63 19.33 4.58 26.34 11.83-8.28 5.01-12.35 11.96-12.21 20.85.14 7.6 3.04 14.12 8.71 19.55 5.67 5.43 12.39 8.5 20.16 9.22-2.12 6.53-4.57 12.82-7.35 18.88zm-33.82-120.73c0 5.86-2.13 11.51-6.39 16.94-5.05 6.2-11.28 9.94-18.68 11.22-.21-1.27-.32-2.33-.32-3.17 0-5.71 2.33-11.41 6.99-17.1 4.65-5.69 10.6-9.15 17.84-10.37.21 1.05.56 1.88.56 2.48z" />
        </svg>
        <span style={{ fontSize: '0.94rem', fontWeight: 700, letterSpacing: '-0.02em', color: textColor }}>
          {name || 'Card'}
        </span>
      </div>
    )
  }

  return (
    <span style={{ fontSize: '0.94rem', fontWeight: 800, letterSpacing: '0.02em', color: textColor }}>
      {name}
    </span>
  )
}

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
  const theme = getWalletTheme(wallet.themeId)
  const isBottomCard = index === total - 1
  const hasSelection = selectedIndex !== -1

  // Posisi tumpukan Apple Wallet presisi tinggi:
  // Offset normal tumpukan: 54px per kartu
  const topPosition = index * 54
  let translateY = 0
  let scale = 1
  let zIndex = index + 1
  let opacity = 1

  if (!isExpanded && hasSelection) {
    if (index === selectedIndex) {
      // Kartu terpilih: meluncur naik sedikit, membesar lembut, depth shadow tinggi
      translateY = -12
      scale = 1.025
      zIndex = 50
      opacity = 1
    } else if (index < selectedIndex) {
      // Kartu di atas kartu terpilih: sedikit terangkat ke atas merenggangkan fokus
      translateY = -Math.min(18, (selectedIndex - index) * 6)
      scale = 0.985
      opacity = 0.74
      zIndex = index + 1
    } else {
      // Kartu di bawah kartu terpilih: SLIDE DOWN 142px untuk membuka badan kartu terpilih 100%!
      translateY = 142
      scale = 0.985
      opacity = 0.86
      zIndex = index + 1
    }
  }

  return (
    <div
      onClick={onClickCard}
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
            {/* Pill Saldo Interaktif */}
            <div
              onClick={(e) => {
                e.stopPropagation()
                onEdit(wallet)
              }}
              title="Ketuk untuk ubah saldo"
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
                  aria-label={`Ubah ${wallet.name}`}
                  title="Ubah kartu"
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
                  aria-label={`Hapus ${wallet.name}`}
                  title="Hapus kartu"
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
                  { label: '+100rb', val: 100000 },
                  { label: '+500rb', val: 500000 },
                  { label: '+1jt', val: 1000000 },
                ].map((chip) => (
                  <button
                    key={chip.label}
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
                  {isSelected ? 'Kartu Terpilih' : 'Kartu Aktif'}
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
  const { isPrivate, togglePrivacy } = usePrivacy()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
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

  const handleCardClick = (wallet: Wallet) => {
    if (isExpanded) {
      setEditingWallet(wallet)
      return
    }
    // Jika dalam posisi tumpuk Apple Wallet:
    // Klik kartu tertutup: buka tumpukan dan sorot kartu ini
    // Klik kartu yang sedang terbuka: tutup kembali ke tumpukan rapi
    if (selectedCardId === wallet.id) {
      setSelectedCardId(null)
    } else {
      setSelectedCardId(wallet.id)
    }
  }

  const selectedIndex = wallets.findIndex((w) => w.id === selectedCardId)
  const hasSelected = selectedIndex !== -1

  // Hitung tinggi container kartu bertumpuk presisi:
  // Base offset 54px + tinggi kartu depan 185px
  // Saat ada kartu terpilih, tinggi bertambah 142px untuk ruang kartu bawah yang meluncur
  const baseCollapsedHeight =
    wallets.length > 0 ? (wallets.length - 1) * 54 + 185 : 120
  const collapsedHeight = hasSelected ? baseCollapsedHeight + 142 : baseCollapsedHeight

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
            Wallet balance
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              onClick={togglePrivacy}
              aria-label={isPrivate ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
              style={{
                width: '36px',
                height: '36px',
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
              aria-label="Menu dompet"
              style={{
                width: '36px',
                height: '36px',
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
              Muat Ulang Semua Bank
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
              Tambah Kartu Baru
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
          {wallets.length} kartu aktif tersimpan
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
          Wallet
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {wallets.length > 1 && (
            <button
              type="button"
              onClick={() => {
                setIsExpanded((v) => !v)
                setSelectedCardId(null)
              }}
              aria-label={isExpanded ? 'Tumpuk kartu' : 'Buka semua kartu'}
              title={isExpanded ? 'Tumpuk kartu' : 'Buka semua kartu'}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                backgroundColor: isExpanded ? 'var(--color-accent)' : 'var(--color-surface)',
                color: isExpanded ? 'var(--color-accent-text)' : 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 200ms ease',
              }}
            >
              <ArrowLeftRight size={15} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            aria-label="Tambah dompet baru"
            title="Tambah dompet baru"
            style={{
              width: '36px',
              height: '36px',
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
            <Plus size={16} />
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
          Tambah kartu dompet pertamamu
        </button>
      ) : (
        <div
          style={{
            position: 'relative',
            height: isExpanded ? 'auto' : `${collapsedHeight}px`,
            display: isExpanded ? 'flex' : 'block',
            flexDirection: 'column',
            gap: isExpanded ? '14px' : undefined,
            transition: 'height 420ms cubic-bezier(0.2, 0.9, 0.2, 1)',
            marginBottom: 'var(--space-2)',
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
      )}

      {/* Tip / Quick Action Bar saat kartu sedikit atau hanya 1 */}
      {wallets.length <= 2 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            gap: '10px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="var(--color-accent)" />
            <span
              style={{
                fontSize: '0.78rem',
                color: 'var(--color-text-muted)',
                fontWeight: 500,
              }}
            >
              Ingin mencoba tumpukan 6 kartu lengkap?
            </span>
          </div>
          <button
            type="button"
            onClick={resetToDefault}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-accent)',
              border: 'none',
              color: 'var(--color-accent-text)',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'opacity 150ms ease',
            }}
          >
            Muat 6 Kartu Demo
          </button>
        </div>
      )}

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
