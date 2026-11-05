'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Check, Loader2 } from 'lucide-react'
import { formatRupiah } from '@/lib/ai/currency'
import { WALLET_THEMES, getWalletTheme, type WalletThemeId } from './types'
import { WalletFormSchema, type WalletFormValues } from './use-wallets'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (values: WalletFormValues) => void
  initialValues?: Partial<WalletFormValues>
  mode: 'add' | 'edit'
}

export function WalletModal({ isOpen, onClose, onSave, initialValues, mode }: WalletModalProps) {
  const [mounted, setMounted] = useState(false)
  const [themeId, setThemeId] = useState<WalletThemeId>(
    (initialValues?.themeId as WalletThemeId) || 'bca',
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
      if (initialValues.themeId) setThemeId(initialValues.themeId as WalletThemeId)
      if (initialValues.name) setName(initialValues.name)
      if (initialValues.balanceIdr != null) setAmountStr(String(initialValues.balanceIdr))
    }
  }, [initialValues])

  const numericBalance = parseInt(amountStr.replace(/\D/g, ''), 10) || 0

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountStr(e.target.value.replace(/\D/g, ''))
    setError(null)
  }

  const handleSelectTheme = (tid: WalletThemeId) => {
    setThemeId(tid)
    if (mode === 'add' && (!name || Object.values(WALLET_THEMES).some((t) => t.label === name))) {
      setName(WALLET_THEMES[tid]?.label ?? '')
    }
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
                {mode === 'add' ? 'Tambah Dompet' : 'Ubah Saldo Dompet'}
              </h2>
              <p
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--color-text-muted)',
                  margin: '2px 0 0 0',
                }}
              >
                Atur nominal kartu bank & e-wallet kamu
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
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
              padding: '12px 16px',
              background: activeTheme.gradient,
              color: activeTheme.textColor,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: 'var(--shadow-sm)',
              minHeight: '60px',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '0.92rem', fontWeight: 800 }}>
              {name || 'Nama Kartu'}
            </span>
            <div
              style={{
                backgroundColor: activeTheme.pillBg,
                color: activeTheme.pillText,
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {numericBalance > 0 ? formatRupiah(numericBalance) : 'Rp 0'}
            </div>
          </div>

          {/* Preset Penerbit Kartu */}
          <div>
            <span
              style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Penerbit & Tampilan
            </span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '6px',
              }}
            >
              {Object.entries(WALLET_THEMES).map(([id, t]) => {
                const isSelected = themeId === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSelectTheme(id as WalletThemeId)}
                    style={{
                      height: '36px',
                      borderRadius: 'var(--radius-md)',
                      background: t.gradient,
                      color: t.textColor,
                      border: isSelected ? '2px solid var(--color-accent)' : '1px solid rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '0 4px',
                      boxShadow: isSelected ? '0 0 0 2px var(--color-surface)' : 'none',
                    }}
                  >
                    <span>{t.label}</span>
                    {isSelected && <Check size={11} strokeWidth={3} />}
                  </button>
                )
              })}
            </div>
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
              Nama Kartu
            </label>
            <input
              id="wallet-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError(null)
              }}
              placeholder="Cth: BCA Utama, GoPay"
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
              Saldo Saat Ini (Rp)
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
            {mode === 'add' ? 'Simpan Dompet Baru' : 'Perbarui Saldo'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
