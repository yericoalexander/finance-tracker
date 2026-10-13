'use client'

import { AlertCircle, Check, Trash2, Loader2, Sparkles } from 'lucide-react'
import { useState, useTransition } from 'react'

import { CATEGORIES } from '@/lib/ai/types'
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

export function ReviewQueue({ items }: ReviewQueueProps) {
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
            fontWeight: 600,
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
            maxWidth: '280px',
          }}
        >
          Tidak ada struk atau transfer yang memerlukan verifikasi manual saat ini.
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
        gap: 'var(--space-4)',
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
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-warning)',
            color: '#ffffff',
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
          <ReviewItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

function ReviewItemCard({ item }: { item: ReviewItem }) {
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [merchant, setMerchant] = useState(
    item.merchant && item.merchant !== 'Transaksi' && item.merchant !== 'Tidak Diketahui'
      ? item.merchant
      : '',
  )
  const [amount, setAmount] = useState(item.amountIdr && item.amountIdr > 0 ? String(item.amountIdr) : '')
  const [category, setCategory] = useState(item.category || 'Lainnya')
  const [txDate, setTxDate] = useState(
    item.txDate || new Date(item.createdAt).toISOString().slice(0, 10),
  )

  const handleApprove = () => {
    setErrorMsg(null)
    const numAmount = parseInt(amount.replace(/\D/g, ''), 10)
    if (!merchant.trim()) {
      setErrorMsg('Nama merchant/toko harus diisi')
      return
    }
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('Nominal harus lebih dari 0')
      return
    }

    startTransition(async () => {
      const res = await approveReviewAction({
        captureId: item.id,
        merchant: merchant.trim(),
        amountIdr: numAmount,
        category,
        txDate,
      })
      if (!res.ok) {
        setErrorMsg(res.error || 'Gagal menyimpan transaksi')
      }
    })
  }

  const handleDismiss = () => {
    setErrorMsg(null)
    startTransition(async () => {
      const res = await dismissReviewAction(item.id)
      if (!res.ok) {
        setErrorMsg(res.error || 'Gagal menghapus')
      }
    })
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
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
        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
          {new Date(item.createdAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
        <span
          style={{
            fontSize: '0.72rem',
            padding: '2px 6px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-surface-raised)',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
          }}
        >
          Confidence {Math.round((item.confidence ?? 0) * 100)}%
        </span>
      </div>

      {errorMsg && (
        <div
          role="alert"
          style={{
            fontSize: '0.78rem',
            color: 'var(--color-error)',
            backgroundColor: 'var(--color-error-subtle)',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Input Form Cepat */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Merchant / Toko</span>
          <input
            type="text"
            placeholder="mis. Warteg / Indomaret"
            value={merchant}
            disabled={isPending}
            onChange={(e) => setMerchant(e.target.value)}
            style={{
              height: '44px',
              padding: '0 var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              fontSize: '0.85rem',
            }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Nominal (Rp)</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={amount}
            disabled={isPending}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              height: '44px',
              padding: '0 var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              fontSize: '0.85rem',
              fontVariantNumeric: 'tabular-nums',
            }}
          />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Kategori</span>
          <select
            value={category}
            disabled={isPending}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              height: '44px',
              padding: '0 var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              fontSize: '0.85rem',
            }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Tanggal</span>
          <input
            type="date"
            value={txDate}
            disabled={isPending}
            onChange={(e) => setTxDate(e.target.value)}
            style={{
              height: '44px',
              padding: '0 var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              fontSize: '0.85rem',
            }}
          />
        </label>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
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
            fontSize: '0.85rem',
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
          aria-label="Abaikan"
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
