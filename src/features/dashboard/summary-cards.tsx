import { formatRupiah } from '@/lib/ai/currency'

interface SummaryCardsProps {
  mtdTotal: number
  txCount: number
}

export function SummaryCards({ mtdTotal, txCount }: SummaryCardsProps) {
  const currentMonthName = new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <section
      aria-label="Ringkasan pengeluaran bulan ini"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: '0.82rem',
            fontWeight: 500,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Pengeluaran {currentMonthName}
        </span>
        <span
          style={{
            fontSize: '0.78rem',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface-raised)',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
          }}
        >
          {txCount} transaksi
        </span>
      </div>

      <div
        style={{
          fontSize: '1.9rem',
          fontWeight: 800,
          color: 'var(--color-text)',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em',
          marginTop: 'var(--space-1)',
        }}
      >
        {formatRupiah(mtdTotal)}
      </div>

      <p
        style={{
          margin: 0,
          fontSize: '0.8rem',
          color: 'var(--color-text-muted)',
        }}
      >
        Tersinkronisasi otomatis dari screenshot iPhone Anda
      </p>
    </section>
  )
}
