'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Check, Loader2 } from 'lucide-react'
import { formatRupiah } from '@/lib/ai/currency'
import { useI18n } from '@/lib/i18n/context'
import { WALLET_THEMES, getWalletTheme } from './types'
import { CardBrandLogo, BankBrandBadge } from './wallet-brand-logo'
import { WalletFormSchema, type WalletFormValues } from './use-wallets'

const BANK_CONVENTIONAL_THEME_IDS = [
  'bca',
  'mandiri',
  'bri',
  'bni',
  'cimb',
  'ocbc',
  'danamon',
  'permata',
  'btn',
  'maybank',
  'panin',
  'bsi',
]

const BANK_DIGITAL_THEME_IDS = [
  'krom',
  'jenius',
  'jago',
  'seabank',
  'blu',
  'allo',
  'superbank',
  'linebank',
  'raya',
  'gopay',
  'ovo',
  'dana',
  'n26',
  'apple',
]

const LUXURY_METAL_THEME_IDS = [
  'centurion',
  'gold',
  'rosegold',
  'emerald',
  'sapphire',
  'green',
]

const LUXURY_TONE_SWATCHES = [
  { label: 'Deep Cobalt', hex: '#0a2e68' },
  { label: 'Royal Velvet', hex: '#3b1261' },
  { label: 'Forest Emerald', hex: '#044331' },
  { label: 'Burgundy Wine', hex: '#630b1c' },
  { label: 'Imperial Amber', hex: '#78350f' },
  { label: 'Titanium Grey', hex: '#26262b' },
  { label: 'Electric Marine', hex: '#02588c' },
  { label: 'Espresso Bronze', hex: '#3b2518' },
]

type ThemeCategory = 'conventional' | 'digital' | 'custom'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (values: WalletFormValues) => void
  initialValues?: Partial<WalletFormValues>
  mode: 'add' | 'edit'
}

export function WalletModal({ isOpen, onClose, onSave, initialValues, mode }: WalletModalProps) {
  const { t } = useI18n()
  const [mounted, setMounted] = useState(false)
  const initialThemeId = initialValues?.themeId || 'bca'
  const [themeId, setThemeId] = useState<string>(initialThemeId)
  const [customHex, setCustomHex] = useState<string>(
    initialThemeId.startsWith('custom_') ? initialThemeId.replace('custom_', '') : '#0a2e68',
  )
  const [categoryTab, setCategoryTab] = useState<ThemeCategory>(
    initialThemeId.startsWith('custom_') || LUXURY_METAL_THEME_IDS.includes(initialThemeId)
      ? 'custom'
      : BANK_DIGITAL_THEME_IDS.includes(initialThemeId)
        ? 'digital'
        : 'conventional',
  )

  const [name, setName] = useState(initialValues?.name ?? WALLET_THEMES[themeId]?.label ?? 'BCA')
  const [amountStr, setAmountStr] = useState(
    initialValues?.balanceIdr != null ? String(initialValues.balanceIdr) : '',
  )
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (initialValues) {
      if (initialValues.themeId) {
        setThemeId(initialValues.themeId)
        if (
          initialValues.themeId.startsWith('custom_') ||
          LUXURY_METAL_THEME_IDS.includes(initialValues.themeId)
        ) {
          if (initialValues.themeId.startsWith('custom_')) {
            setCustomHex(initialValues.themeId.replace('custom_', ''))
          }
          setCategoryTab('custom')
        } else if (BANK_DIGITAL_THEME_IDS.includes(initialValues.themeId)) {
          setCategoryTab('digital')
        } else {
          setCategoryTab('conventional')
        }
      }
      if (initialValues.name) setName(initialValues.name)
      if (initialValues.balanceIdr != null) setAmountStr(String(initialValues.balanceIdr))
    }
  }, [initialValues])

  const numericBalance = parseInt(amountStr.replace(/\D/g, ''), 10) || 0

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountStr(e.target.value.replace(/\D/g, ''))
    setError(null)
  }

  const handleSelectTheme = (tid: string) => {
    setThemeId(tid)
    if (mode === 'add' && (!name || Object.values(WALLET_THEMES).some((t) => t.label === name))) {
      setName(WALLET_THEMES[tid]?.label ?? '')
    }
  }

  const handleSelectCustomSwatch = (hex: string, label: string) => {
    setCustomHex(hex)
    const customTid = `custom_${hex}`
    setThemeId(customTid)
    if (mode === 'add' && (!name || Object.values(WALLET_THEMES).some((t) => t.label === name))) {
      setName(label)
    }
  }

  const handleCustomColorPickerChange = (hex: string) => {
    setCustomHex(hex)
    setThemeId(`custom_${hex}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = WalletFormSchema.safeParse({
      name: name.trim(),
      balanceIdr: numericBalance,
      themeId,
    })
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Data tidak valid')
      return
    }
    setIsSaving(true)
    onSave(result.data)
    setIsSaving(false)
    onClose()
  }

  if (!isOpen || !mounted) return null

  const activeTheme = getWalletTheme(themeId)

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'add' ? 'Tambah dompet baru' : 'Ubah dompet'}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999, // Mutlak di atas semua elemen antarmuka termasuk floating navigation bar
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="animate-drawer-up"
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '26px 26px 0 0',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '88vh',
          boxShadow: '0 -12px 48px rgba(0, 0, 0, 0.4)',
          borderTop: '1px solid var(--color-border)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Fixed Drawer Header */}
        <div
          style={{
            padding: '14px 20px 10px 20px',
            borderBottom: '1px solid var(--color-border-subtle)',
            flexShrink: 0,
          }}
        >
          {/* Handle bar */}
          <div
            style={{
              width: '38px',
              height: '4px',
              borderRadius: '9999px',
              backgroundColor: 'var(--color-border)',
              margin: '0 auto 10px auto',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  margin: 0,
                }}
              >
                {mode === 'add' ? t('walletModalAddTitle') : t('walletModalEditTitle')}
              </h2>
              <p
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--color-text-muted)',
                  margin: '2px 0 0 0',
                }}
              >
                {t('walletModalSub')}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('btnClose')}
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                backgroundColor: 'var(--color-surface-raised)',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 2. Scrollable Body */}
        <form
          id="wallet-form"
          onSubmit={handleSubmit}
          style={{
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {/* Preview Kartu Mini */}
          <div
            style={{
              borderRadius: '16px',
              padding: '14px 18px',
              background: activeTheme.gradient,
              color: activeTheme.textColor,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
              minHeight: '64px',
              flexShrink: 0,
            }}
          >
            <CardBrandLogo
              iconType={activeTheme.iconType}
              name={name || activeTheme.label}
              textColor={activeTheme.textColor}
              size="md"
            />
            <div
              style={{
                backgroundColor: activeTheme.pillBg,
                color: activeTheme.pillText,
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                backdropFilter: 'blur(6px)',
              }}
            >
              {numericBalance > 0 ? formatRupiah(numericBalance) : 'Rp 0'}
            </div>
          </div>

          {/* Pilihan Penerbit & Tampilan Gradien Standar Bank */}
          <div>
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
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {t('walletModalAppearanceLabel')}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                {t('walletModalStandardBank')}
              </span>
            </div>

            {/* Segmented Category Tabs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                backgroundColor: 'var(--color-surface-raised)',
                padding: '3px',
                borderRadius: 'var(--radius-lg)',
                gap: '3px',
                marginBottom: '10px',
                border: '1px solid var(--color-border)',
              }}
            >
              {[
                { id: 'conventional' as ThemeCategory, label: t('walletModalTabConventional') },
                { id: 'digital' as ThemeCategory, label: t('walletModalTabDigital') },
                { id: 'custom' as ThemeCategory, label: t('walletModalTabCustom') },
              ].map((tab) => {
                const isActive = categoryTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCategoryTab(tab.id)}
                    style={{
                      minHeight: '34px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      backgroundColor: isActive ? 'var(--color-surface)' : 'transparent',
                      color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
                      fontSize: '0.74rem',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 150ms ease',
                    }}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* 1. Tab Bank Konvensional */}
            {categoryTab === 'conventional' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '6px',
                }}
              >
                {BANK_CONVENTIONAL_THEME_IDS.map((id) => {
                  const t = WALLET_THEMES[id]
                  if (!t) return null
                  const isSelected = themeId === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSelectTheme(id)}
                      style={{
                        minHeight: '44px',
                        borderRadius: 'var(--radius-md)',
                        background: t.gradient,
                        color: t.textColor,
                        border: isSelected
                          ? '2px solid var(--color-accent)'
                          : '1px solid rgba(255,255,255,0.18)',
                        cursor: 'pointer',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 10px',
                        boxShadow: isSelected ? '0 0 0 2px var(--color-surface)' : 'none',
                        transition: 'transform 120ms ease',
                        textAlign: 'left',
                      }}
                    >
                      <BankBrandBadge iconType={t.iconType} textColor={t.textColor} size={20} />
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                        }}
                      >
                        {t.label}
                      </span>
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </button>
                  )
                })}
              </div>
            )}

            {/* 2. Tab Bank Digital & E-Wallet */}
            {categoryTab === 'digital' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '6px',
                }}
              >
                {BANK_DIGITAL_THEME_IDS.map((id) => {
                  const t = WALLET_THEMES[id]
                  if (!t) return null
                  const isSelected = themeId === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSelectTheme(id)}
                      style={{
                        minHeight: '44px',
                        borderRadius: 'var(--radius-md)',
                        background: t.gradient,
                        color: t.textColor,
                        border: isSelected
                          ? '2px solid var(--color-accent)'
                          : '1px solid rgba(255,255,255,0.18)',
                        cursor: 'pointer',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 10px',
                        boxShadow: isSelected ? '0 0 0 2px var(--color-surface)' : 'none',
                        transition: 'transform 120ms ease',
                        textAlign: 'left',
                      }}
                    >
                      <BankBrandBadge iconType={t.iconType} textColor={t.textColor} size={20} />
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                        }}
                      >
                        {t.label}
                      </span>
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </button>
                  )
                })}
              </div>
            )}

            {/* 3. Tab Kustom & Logam */}
            {categoryTab === 'custom' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  {t('walletModalSectionMetal')}
                </span>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '6px',
                  }}
                >
                  {LUXURY_METAL_THEME_IDS.map((id) => {
                    const t = WALLET_THEMES[id]
                    if (!t) return null
                    const isSelected = themeId === id
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleSelectTheme(id)}
                        style={{
                          minHeight: '44px',
                          borderRadius: 'var(--radius-md)',
                          background: t.gradient,
                          color: t.textColor,
                          border: isSelected
                            ? '2px solid var(--color-accent)'
                            : '1px solid rgba(255,255,255,0.18)',
                          cursor: 'pointer',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 10px',
                          boxShadow: isSelected ? '0 0 0 2px var(--color-surface)' : 'none',
                          transition: 'transform 120ms ease',
                          textAlign: 'left',
                        }}
                      >
                        <BankBrandBadge iconType={t.iconType} textColor={t.textColor} size={20} />
                        <span
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1,
                          }}
                        >
                          {t.label}
                        </span>
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </button>
                    )
                  })}
                </div>

                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, marginTop: '4px' }}>
                  {t('walletModalSectionSwatches')}
                </span>

                {/* 8 Luxury Swatches */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '6px',
                  }}
                >
                  {LUXURY_TONE_SWATCHES.map((swatch) => {
                    const customTid = `custom_${swatch.hex}`
                    const isSelected = themeId === customTid
                    return (
                      <button
                        key={swatch.hex}
                        type="button"
                        onClick={() => handleSelectCustomSwatch(swatch.hex, swatch.label)}
                        style={{
                          minHeight: '38px',
                          borderRadius: 'var(--radius-md)',
                          background: `linear-gradient(135deg, ${swatch.hex} 0%, rgba(0,0,0,0.55) 100%)`,
                          color: '#ffffff',
                          border: isSelected
                            ? '2px solid var(--color-accent)'
                            : '1px solid rgba(255,255,255,0.18)',
                          cursor: 'pointer',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          padding: '0 4px',
                          boxShadow: isSelected ? '0 0 0 2px var(--color-surface)' : 'none',
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {swatch.label}
                        </span>
                        {isSelected && <Check size={10} strokeWidth={3} />}
                      </button>
                    )
                  })}
                </div>

                {/* Custom Color Wheel Picker */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--color-surface-raised)',
                    border: '1px solid var(--color-border)',
                    marginTop: '2px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label
                      htmlFor="custom-color-picker"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: customHex,
                        border: '2px solid rgba(255, 255, 255, 0.4)',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        cursor: 'pointer',
                        display: 'block',
                        position: 'relative',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      <input
                        id="custom-color-picker"
                        type="color"
                        value={customHex}
                        onChange={(e) => handleCustomColorPickerChange(e.target.value)}
                        style={{
                          position: 'absolute',
                          opacity: 0,
                          width: '100%',
                          height: '100%',
                          cursor: 'pointer',
                        }}
                      />
                    </label>
                    <div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text)' }}>
                        {t('walletModalColorPickerTitle')}
                      </span>
                      <p style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', margin: 0 }}>
                        {t('walletModalColorPickerSub')}
                      </p>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      color: 'var(--color-text)',
                      backgroundColor: 'var(--color-surface)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {customHex.toUpperCase()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Nama Kartu */}
          <div>
            <label
              htmlFor="wallet-name"
              style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {t('walletModalCardNameLabel')}
            </label>
            <input
              id="wallet-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError(null)
              }}
              placeholder={t('walletModalCardNamePlaceholder')}
              maxLength={40}
              style={{
                width: '100%',
                minHeight: '42px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-raised)',
                color: 'var(--color-text)',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Saldo Input + Quick Adjustment Chips */}
          <div>
            <label
              htmlFor="wallet-balance"
              style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {t('walletModalBalanceLabel')}
            </label>
            <input
              id="wallet-balance"
              type="text"
              inputMode="numeric"
              value={amountStr ? parseInt(amountStr, 10).toLocaleString('id-ID') : ''}
              onChange={handleAmountChange}
              placeholder="0"
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-raised)',
                color: 'var(--color-text)',
                fontSize: '1.05rem',
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                outline: 'none',
              }}
            />

            {/* Quick Adjustment Chips */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
              {[100000, 500000, 1000000, 5000000].map((addAmount) => (
                <button
                  key={addAmount}
                  type="button"
                  onClick={() => {
                    const next = numericBalance + addAmount
                    setAmountStr(String(next))
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface-raised)',
                    color: 'var(--color-text)',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  +{formatRupiah(addAmount).replace('Rp ', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p style={{ fontSize: '0.78rem', color: 'var(--color-error)', margin: 0 }}>{error}</p>
          )}
        </form>

        {/* 3. Sticky Bottom Action Footer (Tidak akan pernah tertutup) */}
        <div
          style={{
            padding: '12px 20px',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            flexShrink: 0,
            boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.05)',
          }}
        >
          <button
            type="submit"
            form="wallet-form"
            disabled={isSaving}
            style={{
              minHeight: '46px',
              width: '100%',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-text)',
              border: 'none',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'opacity 150ms ease',
              opacity: isSaving ? 0.7 : 1,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
            {mode === 'add' ? t('walletModalSaveAdd') : t('walletModalSaveEdit')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
