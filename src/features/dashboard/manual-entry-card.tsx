'use client'

import { useState } from 'react'
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { CATEGORIES, type Category } from '@/lib/ai/types'
import { formatRupiah } from '@/lib/ai/currency'
import { useI18n } from '@/lib/i18n/context'
import { createManualTransactionAction } from './manual-entry-action'

const PAYMENT_METHODS = [
  'QRIS',
  'Transfer BCA',
  'Transfer Mandiri',
  'Kartu Debit',
  'Tunai',
  'Lainnya',
]

interface ManualEntryCardProps {
  onSuccess?: () => void
}

export function ManualEntryCard({ onSuccess }: ManualEntryCardProps) {
  const router = useRouter()
  const { t, translateCategory, translatePaymentMethod } = useI18n()
  const todayStr = new Date().toISOString().slice(0, 10)

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

  const numericAmount = parseInt(amountStr.replace(/\D/g, ''), 10) || 0

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, '')
    setAmountStr(rawDigits)
    setErrorMsg(null)
  }

  const resetForm = () => {
    setMerchant('')
    setAmountStr('')
    setCategory('Makanan & Minuman')
    setTxDate(todayStr)
    setPaymentMethod('QRIS')
    setNote('')
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
      })

      if (!res.ok) {
        setErrorMsg(res.error ?? t('errSaveFailed'))
      } else {
        setSuccessMsg(
          t('manualSuccessMsg', { amount: formatRupiah(numericAmount), merchant: merchant.trim() }),
        )
        if (res.budgetAlert?.alertMessage) {
          setBudgetAlertMsg(res.budgetAlert.alertMessage)
        } else {
          setBudgetAlertMsg(null)
        }
        resetForm()
        router.refresh()
        if (onSuccess) {
          setTimeout(
            () => {
              onSuccess()
            },
            res.budgetAlert?.alertMessage ? 2500 : 700,
          )
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('errSystemError')
      setErrorMsg(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--color-text)',
              margin: 0,
            }}
          >
            {t('manualTitle')}
          </h2>
          <p
            style={{
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)',
              margin: '4px 0 0 0',
            }}
          >
            {t('manualSub')}
          </p>
        </div>

        {/* Feedback Pesan Sukses */}
        {budgetAlertMsg ? (
          <div
            role="alert"
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
              style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-warning-text)' }}
            >
              {budgetAlertMsg}
            </span>
          </div>
        ) : null}

        {successMsg ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-accent-subtle)',
              border: '1px solid var(--color-accent)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <CheckCircle2 size={16} color="var(--color-accent)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)' }}>
                {successMsg}
              </span>
            </div>
            {onSuccess ? (
              <button
                type="button"
                onClick={onSuccess}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  alignSelf: 'flex-start',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--color-accent)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {t('viewInTxTab')} <ArrowRight size={13} />
              </button>
            ) : null}
          </div>
        ) : null}

        {/* Feedback Pesan Error */}
        {errorMsg ? (
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
        ) : null}

        {/* Input Nominal */}
        <div>
          <label
            htmlFor="manual-amount"
            style={{
              display: 'block',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-1)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {t('labelAmount')}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="manual-amount"
              type="text"
              inputMode="numeric"
              value={amountStr ? parseInt(amountStr, 10).toLocaleString('id-ID') : ''}
              onChange={handleAmountChange}
              placeholder={t('placeholderAmount')}
              style={{
                width: '100%',
                minHeight: '44px',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-raised)',
                color: 'var(--color-text)',
                fontFamily: 'inherit',
                fontSize: '1.1rem',
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                outline: 'none',
              }}
            />
          </div>
          {numericAmount > 0 ? (
            <p
              style={{
                fontSize: '0.76rem',
                color: 'var(--color-text-muted)',
                margin: '4px 0 0 0',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {t('amountInterpreted', { amount: formatRupiah(numericAmount) })}
            </p>
          ) : null}
        </div>

        {/* Input Nama Tempat / Merchant */}
        <div>
          <label
            htmlFor="manual-merchant"
            style={{
              display: 'block',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-1)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {t('labelMerchant')}
          </label>
          <input
            id="manual-merchant"
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
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-1)',
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
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  style={{
                    minHeight: '38px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontFamily: 'inherit',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 600 : 500,
                    border: isSelected
                      ? '1px solid var(--color-accent)'
                      : '1px solid var(--color-border)',
                    backgroundColor: isSelected
                      ? 'var(--color-accent)'
                      : 'var(--color-surface-raised)',
                    color: isSelected ? 'var(--color-accent-text)' : 'var(--color-text)',
                    cursor: 'pointer',
                    transition: 'all var(--duration-fast) var(--ease-default)',
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
            htmlFor="manual-date"
            style={{
              display: 'block',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-1)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {t('labelDate')}
          </label>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <input
              id="manual-date"
              type="date"
              value={txDate}
              onChange={(e) => setTxDate(e.target.value)}
              style={{
                flex: 1,
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
            <button
              type="button"
              onClick={() => setTxDate(todayStr)}
              style={{
                minHeight: '44px',
                padding: '0 var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor:
                  txDate === todayStr ? 'var(--color-surface-raised)' : 'transparent',
                color: 'var(--color-text)',
                fontFamily: 'inherit',
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              {t('btnToday')}
            </button>
          </div>
        </div>

        {/* Metode Pembayaran */}
        <div>
          <span
            style={{
              display: 'block',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-1)',
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
                    padding: '3px 9px',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'inherit',
                    fontSize: '0.76rem',
                    fontWeight: isSelected ? 600 : 500,
                    border: isSelected
                      ? '1px solid var(--color-accent)'
                      : '1px solid var(--color-border)',
                    backgroundColor: isSelected
                      ? 'var(--color-accent-subtle)'
                      : 'var(--color-surface-raised)',
                    color: isSelected ? 'var(--color-accent)' : 'var(--color-text)',
                    cursor: 'pointer',
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
            htmlFor="manual-note"
            style={{
              display: 'block',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-1)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {t('labelNote')}
          </label>
          <input
            id="manual-note"
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

        {/* Tombol Simpan Transaksi */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-2)',
            minHeight: '46px',
            width: '100%',
            marginTop: 'var(--space-2)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-accent-text)',
            border: 'none',
            fontFamily: 'inherit',
            fontSize: '0.92rem',
            fontWeight: 600,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
            transition: 'all var(--duration-fast) var(--ease-default)',
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

      {/* Info Card Back Tap */}
      <div
        style={{
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-1)',
        }}
      >
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>
          {t('manualBackTapTipTitle')}
        </span>
        <p style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', margin: 0 }}>
          {t('manualBackTapTipDesc')}
        </p>
      </div>
    </div>
  )
}
