'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Loader2,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  Bell,
  Calendar,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

import { CATEGORIES, type Category } from '@/lib/ai/types'
import { formatRupiah } from '@/lib/ai/currency'
import { useI18n } from '@/lib/i18n/context'
import { createManualTransactionAction } from './manual-entry-action'

// Kategori pengeluaran murni tanpa 'Transfer Antar Bank' (karena transfer dikelola via Pindah Saldo di Dompet)
const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c !== 'Transfer Antar Bank') as Category[]

const PAYMENT_METHODS = [
  'QRIS',
  'Transfer BCA',
  'Transfer Mandiri',
  'Kartu Debit',
  'Tunai',
  'Lainnya',
]

const QUICK_AMOUNTS = [10000, 25000, 50000, 100000, 500000]

interface ExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ExpenseModal({ isOpen, onClose, onSuccess }: ExpenseModalProps) {
  const router = useRouter()
  const { t, translateCategory, translatePaymentMethod } = useI18n()
  const todayStr = new Date().toISOString().slice(0, 10)

  const [mounted, setMounted] = useState(false)
  const [merchant, setMerchant] = useState('')
  const [amountStr, setAmountStr] = useState('')
  const [category, setCategory] = useState<Category>('Makanan & Minuman')
  const [txDate, setTxDate] = useState(todayStr)
  const [paymentMethod, setPaymentMethod] = useState('QRIS')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [budgetAlertMsg, setBudgetAlertMsg] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Tutup dengan tombol Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen || !mounted) return null

  const numericAmount = parseInt(amountStr.replace(/\D/g, ''), 10) || 0

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, '')
    setAmountStr(rawDigits)
    setErrorMsg(null)
  }

  const handleAddAmount = (val: number) => {
    const current = parseInt(amountStr.replace(/\D/g, ''), 10) || 0
    setAmountStr(String(current + val))
    setErrorMsg(null)
  }

  const resetForm = () => {
    setMerchant('')
    setAmountStr('')
    setCategory('Makanan & Minuman')
    setTxDate(todayStr)
    setPaymentMethod('QRIS')
    setNote('')
    setErrorMsg(null)
    setSuccessMsg(null)
    setBudgetAlertMsg(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!merchant.trim()) {
      setErrorMsg(t('errMerchantRequired'))
      return
    }
    if (numericAmount <= 0) {
      setErrorMsg(t('errAmountPositive'))
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const res = await createManualTransactionAction({
        merchant: merchant.trim(),
        amountIdr: numericAmount,
        category,
        txDate,
        paymentMethod,
        note: note.trim() || '-',
        txType: 'expense',
      })

      if (!res.ok) {
        setErrorMsg(res.error ?? t('errSaveFailed'))
      } else {
        setSuccessMsg(
          t('manualSuccessMsg', {
            amount: formatRupiah(numericAmount),
            merchant: merchant.trim(),
          }),
        )
        if (res.budgetAlert?.alertMessage) {
          setBudgetAlertMsg(res.budgetAlert.alertMessage)
        }

        router.refresh()
        onSuccess?.()

        // Tutup modal secara otomatis setelah jeda singkat agar user melihat konfirmasi
        setTimeout(
          () => {
            resetForm()
            onClose()
          },
          res.budgetAlert?.alertMessage ? 2200 : 900,
        )
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('errSystemError')
      setErrorMsg(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="expense-modal-title"
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
        padding: 0,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose()
        }
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
          maxHeight: '90vh',
          boxShadow: '0 -12px 48px rgba(0, 0, 0, 0.4)',
          borderTop: '1px solid var(--color-border)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header Bottom Sheet */}
        <div
          style={{
            padding: '14px 20px 12px 20px',
            borderBottom: '1px solid var(--color-border-subtle)',
            flexShrink: 0,
          }}
        >
          {/* Grab handle */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-expense-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ArrowDownLeft size={18} color="var(--color-expense)" strokeWidth={2.4} />
              </div>
              <div>
                <h2
                  id="expense-modal-title"
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 750,
                    color: 'var(--color-text)',
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Catat Pengeluaran
                </h2>
                <p
                  style={{
                    fontSize: '0.74rem',
                    color: 'var(--color-text-muted)',
                    margin: '2px 0 0 0',
                  }}
                >
                  Tersimpan ke Google Sheets & mutasi dompet
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label={t('btnClose')}
              style={{
                width: '36px',
                height: '36px',
                minWidth: '36px',
                minHeight: '36px',
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

        {/* 2. Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding:
              '16px 20px calc(var(--space-8) + env(safe-area-inset-bottom, 16px)) 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {/* Pesan Peringatan Batas Anggaran */}
          {budgetAlertMsg && (
            <div
              role="alert"
              className="animate-slide-up"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-warning-subtle)',
                border: '1.5px solid var(--color-warning)',
              }}
            >
              <Bell size={16} color="var(--color-warning)" />
              <span
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--color-warning-text)',
                }}
              >
                {budgetAlertMsg}
              </span>
            </div>
          )}

          {/* Pesan Sukses */}
          {successMsg && (
            <div
              className="animate-scale-in"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-success-subtle)',
                border: '1px solid var(--color-success)',
                color: 'var(--color-success)',
              }}
            >
              <CheckCircle2 size={16} />
              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{successMsg}</span>
            </div>
          )}

          {/* Pesan Error */}
          {errorMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-error-subtle)',
                border: '1px solid var(--color-error)',
                color: 'var(--color-error)',
                fontSize: '0.82rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Input Nominal */}
          <div>
            <label
              htmlFor="expense-amount"
              style={{
                display: 'block',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'var(--color-text-muted)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {t('labelAmount')}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="expense-amount"
                type="text"
                inputMode="numeric"
                autoFocus
                value={amountStr ? parseInt(amountStr, 10).toLocaleString('id-ID') : ''}
                onChange={handleAmountChange}
                placeholder="0"
                style={{
                  width: '100%',
                  minHeight: '48px',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1.5px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface-raised)',
                  color: 'var(--color-text)',
                  fontFamily: 'inherit',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  fontVariantNumeric: 'tabular-nums',
                  outline: 'none',
                  letterSpacing: '-0.02em',
                }}
              />
            </div>

            {/* Quick Increment Chips */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                marginTop: '8px',
              }}
            >
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddAmount(val)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-muted)',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  +{val.toLocaleString('id-ID')}
                </button>
              ))}
            </div>

            {numericAmount > 0 && (
              <p
                style={{
                  fontSize: '0.76rem',
                  color: 'var(--color-text-muted)',
                  margin: '6px 0 0 0',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {t('amountInterpreted', { amount: formatRupiah(numericAmount) })}
              </p>
            )}
          </div>

          {/* Input Nama Tempat / Merchant */}
          <div>
            <label
              htmlFor="expense-merchant"
              style={{
                display: 'block',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'var(--color-text-muted)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {t('labelMerchant')}
            </label>
            <input
              id="expense-merchant"
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder={t('placeholderMerchant')}
              style={{
                width: '100%',
                minHeight: '44px',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-raised)',
                color: 'var(--color-text)',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Pilihan Kategori */}
          <div>
            <span
              style={{
                display: 'block',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'var(--color-text-muted)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {t('labelCategory')}
            </span>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
              }}
            >
              {EXPENSE_CATEGORIES.map((cat) => {
                const isSelected = category === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    style={{
                      minHeight: '36px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontFamily: 'inherit',
                      fontSize: '0.76rem',
                      fontWeight: isSelected ? 700 : 500,
                      border: isSelected
                        ? '1px solid var(--color-accent)'
                        : '1px solid var(--color-border)',
                      backgroundColor: isSelected
                        ? 'var(--color-accent)'
                        : 'var(--color-surface-raised)',
                      color: isSelected ? 'var(--color-accent-text)' : 'var(--color-text)',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                  >
                    {translateCategory(cat)}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tanggal Transaksi */}
          <div>
            <label
              htmlFor="expense-date"
              style={{
                display: 'block',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'var(--color-text-muted)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {t('labelDate')}
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  id="expense-date"
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface-raised)',
                    color: 'var(--color-text)',
                    fontFamily: 'inherit',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setTxDate(todayStr)}
                style={{
                  minHeight: '44px',
                  padding: '0 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor:
                    txDate === todayStr ? 'var(--color-surface-raised)' : 'transparent',
                  color: 'var(--color-text)',
                  fontFamily: 'inherit',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Calendar size={13} />
                {t('btnToday')}
              </button>
            </div>
          </div>

          {/* Metode Pembayaran */}
          <div>
            <span
              style={{
                display: 'block',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'var(--color-text-muted)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {t('labelPayment')}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {PAYMENT_METHODS.map((method) => {
                const isSelected = paymentMethod === method
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    style={{
                      minHeight: '36px',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'inherit',
                      fontSize: '0.76rem',
                      fontWeight: isSelected ? 700 : 500,
                      border: isSelected
                        ? '1px solid var(--color-accent)'
                        : '1px solid var(--color-border)',
                      backgroundColor: isSelected
                        ? 'var(--color-accent-subtle)'
                        : 'var(--color-surface-raised)',
                      color: isSelected ? 'var(--color-accent)' : 'var(--color-text)',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                  >
                    {translatePaymentMethod(method)}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Catatan Tambahan (Opsional) */}
          <div>
            <label
              htmlFor="expense-note"
              style={{
                display: 'block',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'var(--color-text-muted)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {t('labelNote')}
            </label>
            <input
              id="expense-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('placeholderNote')}
              style={{
                width: '100%',
                minHeight: '44px',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-raised)',
                color: 'var(--color-text)',
                fontFamily: 'inherit',
                fontSize: '0.88rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Tombol Simpan Pengeluaran */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              minHeight: '48px',
              width: '100%',
              marginTop: 'var(--space-2)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-text)',
              border: 'none',
              fontFamily: 'inherit',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              transition: 'all var(--duration-fast) var(--ease-default)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {t('submittingManual')}
              </>
            ) : (
              t('btnSubmitManual')
            )}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  )
}

