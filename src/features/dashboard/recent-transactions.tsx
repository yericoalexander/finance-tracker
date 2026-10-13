import { Receipt } from 'lucide-react'

import { formatRupiah } from '@/lib/ai/currency'

interface TransactionItem {
  id: string
  merchant: string | null
  amountIdr: number | null
  category: string | null
  txDate: string | null
  createdAt: Date
}

interface RecentTransactionsProps {
  transactions: TransactionItem[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <section
      aria-label="Riwayat transaksi terbaru"
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--color-text)',
            margin: 0,
          }}
        >
          Transaksi Terbaru
        </h2>
        <span
          style={{
            fontSize: '0.78rem',
            color: 'var(--color-text-muted)',
          }}
        >
          {transactions.length} tercatat
        </span>
      </div>

      {transactions.length === 0 ? (
        <div
          style={{
            padding: 'var(--space-6) 0',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-2)',
            color: 'var(--color-text-muted)',
          }}
        >
          <Receipt size={32} strokeWidth={1.5} />
          <p style={{ margin: 0, fontSize: '0.85rem' }}>Belum ada transaksi tersinkronisasi.</p>
          <p style={{ margin: 0, fontSize: '0.78rem' }}>
            Lakukan Back Tap di iPhone untuk mencatat transaksi pertama.
          </p>
        </div>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          {transactions.map((tx) => (
            <li
              key={tx.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 'var(--space-3)',
                borderBottom: '1px solid var(--color-border-subtle)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                <span
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {tx.merchant || 'Transaksi'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface-raised)',
                      color: 'var(--color-text-muted)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {tx.category || 'Lainnya'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {tx.txDate || new Date(tx.createdAt).toISOString().slice(0, 10)}
                  </span>
                </div>
              </div>

              <div
                style={{
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  fontVariantNumeric: 'tabular-nums',
                  whiteSpace: 'nowrap',
                  marginLeft: 'var(--space-3)',
                }}
              >
                {formatRupiah(tx.amountIdr ?? 0)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
