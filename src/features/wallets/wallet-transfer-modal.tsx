'use client'

import { useState, useId, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeftRight, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react'
import { formatRupiah } from '@/lib/ai/currency'
import { transferBetweenWalletsAction } from './actions'
import type { Wallet } from './types'

interface WalletTransferModalProps {
  isOpen: boolean
  onClose: () => void
  wallets: Wallet[]
  onSuccess: (sourceId: string, destId: string, amountIdr: number) => void
}

export function WalletTransferModal({
  isOpen,
  onClose,
  wallets,
  onSuccess,
}: WalletTransferModalProps) {
  const formId = useId()
  const [sourceId, setSourceId] = useState<string>(wallets[0]?.id ?? '')
  const [destId, setDestId] = useState<string>(
    wallets.find((w) => w.id !== wallets[0]?.id)?.id ?? '',
  )
  const [amountStr, setAmountStr] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

  const numericAmount = parseInt(amountStr.replace(/\D/g, ''), 10) || 0
  const sourceWallet = wallets.find((w) => w.id === sourceId)
  const destWallet = wallets.find((w) => w.id === destId)

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    setAmountStr(raw)
    setErrorMsg(null)
  }

  const handleQuickAmount = (val: number) => {
    setAmountStr(String(val))
    setErrorMsg(null)
  }

  const handleAllBalance = () => {
    if (sourceWallet) {
      setAmountStr(String(sourceWallet.balanceIdr))
      setErrorMsg(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sourceId || !destId || sourceId === destId) {
      setErrorMsg('Pilih dompet asal dan tujuan yang berbeda.')
      return
    }
    if (numericAmount <= 0) {
      setErrorMsg('Nominal transfer harus lebih dari Rp 0.')
      return
    }
    if (sourceWallet && numericAmount > sourceWallet.balanceIdr) {
      setErrorMsg(`Saldo ${sourceWallet.name} tidak mencukupi (${formatRupiah(sourceWallet.balanceIdr)}).`)
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const res = await transferBetweenWalletsAction({
        sourceWalletId: sourceId,
        destWalletId: destId,
        amountIdr: numericAmount,
      })

      if (!res.ok) {
        setErrorMsg(res.error ?? 'Gagal memindahkan saldo')
      } else {
        setSuccessMsg(
          `Berhasil pindah ${formatRupiah(numericAmount)} dari ${sourceWallet?.name} ke ${destWallet?.name}`,
        )
        onSuccess(sourceId, destId, numericAmount)
        setTimeout(() => {
          setSuccessMsg(null)
          setAmountStr('')
          onClose()
        }, 400)
      }
    } catch {
      setErrorMsg('Terjadi kesalahan saat memproses transfer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${formId}-title`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999, // Di atas seluruh antarmuka termasuk fixed bottom bar
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose()
      }}
    >
      <div
        className="animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '430px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '28px 28px 0 0',
          padding:
            'var(--space-6) var(--space-5) calc(var(--space-8) + env(safe-area-inset-bottom, 16px))',
          boxShadow: 'var(--shadow-lg)',
          maxHeight: '90vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface-raised)',
                color: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--color-border)',
              }}
            >
              <ArrowLeftRight size={18} strokeWidth={2.2} />
            </div>
            <div>
              <h2
                id={`${formId}-title`}
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  margin: 0,
                  color: 'var(--color-text)',
                  letterSpacing: '-0.02em',
                }}
              >
                Pindah Saldo
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Hanya mutasi dompet, tidak dihitung pengeluaran
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Tutup"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              backgroundColor: 'var(--color-surface-raised)',
              color: 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Error / Success Alert */}
        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-error-subtle)',
              color: 'var(--color-error)',
              fontSize: '0.84rem',
              fontWeight: 500,
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-success-subtle)',
              color: 'var(--color-success)',
              fontSize: '0.84rem',
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Dari Dompet */}
          <div>
            <label
              htmlFor={`${formId}-source`}
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                marginBottom: '6px',
              }}
            >
              Dari Dompet (Sumber)
            </label>
            <select
              id={`${formId}-source`}
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              disabled={isSubmitting}
              style={{
                width: '100%',
                minHeight: '48px',
                padding: '0 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                fontSize: '0.92rem',
                fontWeight: 600,
              }}
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id} disabled={w.id === destId}>
                  {w.name} ({formatRupiah(w.balanceIdr)})
                </option>
              ))}
            </select>
          </div>

          {/* Ke Dompet */}
          <div>
            <label
              htmlFor={`${formId}-dest`}
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                marginBottom: '6px',
              }}
            >
              Ke Dompet (Tujuan)
            </label>
            <select
              id={`${formId}-dest`}
              value={destId}
              onChange={(e) => setDestId(e.target.value)}
              disabled={isSubmitting}
              style={{
                width: '100%',
                minHeight: '48px',
                padding: '0 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                fontSize: '0.92rem',
                fontWeight: 600,
              }}
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id} disabled={w.id === sourceId}>
                  {w.name} ({formatRupiah(w.balanceIdr)})
                </option>
              ))}
            </select>
          </div>

          {/* Nominal */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label
                htmlFor={`${formId}-amount`}
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                }}
              >
                Nominal Transfer
              </label>
              {sourceWallet && sourceWallet.balanceIdr > 0 && (
                <button
                  type="button"
                  onClick={handleAllBalance}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: 'var(--color-accent)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Semua ({formatRupiah(sourceWallet.balanceIdr)})
                </button>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontWeight: 800,
                  color: 'var(--color-text)',
                  fontSize: '1rem',
                }}
              >
                Rp
              </span>
              <input
                id={`${formId}-amount`}
                type="text"
                inputMode="numeric"
                value={numericAmount > 0 ? numericAmount.toLocaleString('id-ID') : amountStr}
                onChange={handleAmountChange}
                placeholder="0"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  minHeight: '52px',
                  paddingLeft: '44px',
                  paddingRight: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  fontVariantNumeric: 'tabular-nums',
                }}
              />
            </div>

            {/* Quick Chips */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
              {[10000, 25000, 50000, 100000, 500000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAmount(val)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-muted)',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  +{formatRupiah(val).replace('Rp', '').trim()}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || numericAmount <= 0}
            style={{
              width: '100%',
              minHeight: '50px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-text)',
              fontSize: '0.95rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: isSubmitting || numericAmount <= 0 ? 'not-allowed' : 'pointer',
              opacity: isSubmitting || numericAmount <= 0 ? 0.5 : 1,
              marginTop: '8px',
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <ArrowLeftRight size={16} />
                <span>Pindahkan Saldo</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  )
}

