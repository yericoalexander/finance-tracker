'use client'

import { useState, useTransition } from 'react'
import { AlertCircle, Check, Trash2, Loader2, Sparkles } from 'lucide-react'

import { CATEGORIES } from '@/lib/ai/types'
import { formatRupiah } from '@/lib/ai/currency'
import { approveReviewAction, dismissReviewAction } from './actions'

interface ReviewItem {
  id: string
  merchant: string | null
  amountIdr: number | null
  category: string | null
  txDate: string | null
  confidence: number | null
  createdAt: Date
}

interface ReviewQueueProps {
  items: ReviewItem[]
}

export function ReviewQueue({ items: initialItems }: ReviewQueueProps) {
  const [items, setItems] = useState(initialItems)

  const handleItemRemoved = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  if (items.length === 0) {
    return (
      <section
        aria-label="Antrean perlu dicek"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          border: '1px solid var(--color-border)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface-raised)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-success)',
          }}
        >
          <Sparkles size={20} />
        </div>
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--color-text)',
            margin: 0,
          }}
        >
          Semua transaksi sudah rapi
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: '0.82rem',
            color: 'var(--color-text-muted)',
            maxWidth: '300px',
          }}
        >
          Tidak ada struk atau bukti transfer yang memerlukan pengecekan manual saat ini.
        </p>
      </section>
    )
  }

  return (
    <section
      aria-label="Antrean transaksi perlu dicek"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <AlertCircle size={18} color="var(--color-warning)" />
          <h2
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--color-text)',
              margin: 0,
            }}
          >
            Perlu Dicek
          </h2>
        </div>
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-warning-subtle)',
            color: 'var(--color-warning-text)',
            border: '1px solid var(--color-warning)',
          }}
        >
          {items.length} item
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        {items.map((item) => (
          <InteractiveReviewCard
            key={item.id}
            item={item}
            onRemoved={() => handleItemRemoved(item.id)}
          />
        ))}
      </div>
    </section>
  )
}

function InteractiveReviewCard({
  item,
  onRemoved,
}: {
  item: ReviewItem
  onRemoved: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [merchant, setMerchant] = useState(
    item.merchant && item.merchant !== 'Transaksi' && item.merchant !== 'Tidak Diketahui'
      ? item.merchant
      : '',
  )
  const [amountRaw, setAmountRaw] = useState<number>(item.amountIdr && item.amountIdr > 0 ? item.amountIdr : 0)
  const [category, setCategory] = useState<string>(item.category || 'Makanan & Minuman')
  const [txDate, setTxDate] = useState<string>(
    item.txDate || new Date(item.createdAt).toISOString().slice(0, 10),
  )

  const todayStr = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  const addNominal = (val: number) => {
    setAmountRaw((prev) => prev + val)
  }

  const handleApprove = () => {
    setErrorMsg(null)
    if (!merchant.trim()) {
      setErrorMsg('Nama merchant atau toko wajib diisi')
      return
    }
    if (amountRaw <= 0) {
      setErrorMsg('Nominal harus lebih dari Rp 0')
      return
    }

    startTransition(async () => {
      const res = await approveReviewAction({
        captureId: item.id,
        merchant: merchant.trim(),
        amountIdr: amountRaw,
        category,
        txDate,
      })
      if (!res.ok) {
        setErrorMsg(res.error || 'Gagal menyimpan transaksi')
      } else {
        onRemoved()
      }
    })
  }

  const handleDismiss = () => {
    setErrorMsg(null)
    startTransition(async () => {
      const res = await dismissReviewAction(item.id)
      if (!res.ok) {
        setErrorMsg(res.error || 'Gagal menghapus')
      } else {
        onRemoved()
      }
    })
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-5)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        transition: 'opacity var(--duration-base) var(--ease-default)',
        opacity: isPending ? 0.6 : 1,
      }}
    >
      {/* Header Card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          {new Date(item.createdAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
        <span
          style={{
            fontSize: '0.74rem',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface-raised)',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
          }}
        >
          Confidence {Math.round((item.confidence ?? 0) * 100)}%
        </span>
      </div>

      {errorMsg ? (
        <div
          role="alert"
          style={{
            fontSize: '0.8rem',
            color: 'var(--color-error)',
            backgroundColor: 'var(--color-error-subtle)',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {errorMsg}
        </div>
      ) : null}

      {/* Input Merchant & Nominal */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div>
          <label
            htmlFor={`merchant-${item.id}`}
            style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '4px' }}
          >
            Nama Toko / Merchant
          </label>
          <input
            id={`merchant-${item.id}`}
            type="text"
            placeholder="mis. Warteg Ceria, Alfamart, GoPay"
            value={merchant}
            disabled={isPending}
            onChange={(e) => setMerchant(e.target.value)}
            style={{
              width: '100%',
              minHeight: '44px',
              padding: '0 var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              fontSize: '0.9rem',
            }}
          />
        </div>

        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '4px',
            }}
          >
            <label
              htmlFor={`amount-${item.id}`}
              style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}
            >
              Nominal Transaksi
            </label>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--color-text)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatRupiah(amountRaw)}
            </span>
          </div>

          <input
            id={`amount-${item.id}`}
            type="text"
            inputMode="numeric"
            placeholder="Ketik nominal..."
            value={amountRaw > 0 ? String(amountRaw) : ''}
            disabled={isPending}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '')
              setAmountRaw(digits ? parseInt(digits, 10) : 0)
            }}
            style={{
              width: '100%',
              minHeight: '44px',
              padding: '0 var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              fontSize: '0.9rem',
              fontVariantNumeric: 'tabular-nums',
            }}
          />

          {/* Quick Preset Nominal Chips */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
            {[10000, 20000, 50000, 100000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => addNominal(val)}
                disabled={isPending}
                style={{
                  minHeight: '32px',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-surface-raised)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  fontSize: '0.74rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                +{val / 1000}rb
              </button>
            ))}
            {amountRaw > 0 ? (
              <button
                type="button"
                onClick={() => setAmountRaw(0)}
                disabled={isPending}
                style={{
                  minHeight: '32px',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Kategori Quick Chips */}
      <div>
        <span
          style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            marginBottom: '6px',
          }}
        >
          Pilih Kategori
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                disabled={isPending}
                style={{
                  minHeight: '34px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: isSelected ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                  backgroundColor: isSelected ? 'var(--color-accent)' : 'var(--color-surface-raised)',
                  color: isSelected ? 'var(--color-accent-text)' : 'var(--color-text)',
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all var(--duration-fast) var(--ease-default)',
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tanggal Cepat */}
      <div>
        <span
          style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            marginBottom: '6px',
          }}
        >
          Tanggal Transaksi
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setTxDate(todayStr)}
            disabled={isPending}
            style={{
              minHeight: '36px',
              padding: '0 12px',
              borderRadius: 'var(--radius-md)',
              border: txDate === todayStr ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
              backgroundColor: txDate === todayStr ? 'var(--color-surface-raised)' : 'transparent',
              color: txDate === todayStr ? 'var(--color-accent)' : 'var(--color-text-muted)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => setTxDate(yesterday)}
            disabled={isPending}
            style={{
              minHeight: '36px',
              padding: '0 12px',
              borderRadius: 'var(--radius-md)',
              border: txDate === yesterday ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
              backgroundColor: txDate === yesterday ? 'var(--color-surface-raised)' : 'transparent',
              color: txDate === yesterday ? 'var(--color-accent)' : 'var(--color-text-muted)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Kemarin
          </button>
          <input
            type="date"
            value={txDate}
            disabled={isPending}
            onChange={(e) => setTxDate(e.target.value)}
            style={{
              flex: 1,
              minHeight: '36px',
              padding: '0 var(--space-2)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              fontSize: '0.8rem',
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
        <button
          type="button"
          onClick={handleApprove}
          disabled={isPending}
          style={{
            flex: 1,
            minHeight: '44px',
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-accent-text)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '0.86rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-2)',
            cursor: isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          Simpan ke Sheets
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          disabled={isPending}
          aria-label="Abaikan transaksi ini"
          style={{
            minHeight: '44px',
            minWidth: '44px',
            padding: '0 var(--space-3)',
            backgroundColor: 'transparent',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isPending ? 'not-allowed' : 'pointer',
          }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
