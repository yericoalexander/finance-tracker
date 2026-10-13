'use client'

import { AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { retryEnsureSpreadsheetAction } from './actions'

export function RetrySheetCard() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleRetry() {
    setLoading(true)
    setErrorMessage(null)

    try {
      const result = await retryEnsureSpreadsheetAction()
      if (!result.ok) {
        setErrorMessage(result.error ?? 'Gagal membuat Google Sheet. Coba lagi.')
      } else {
        router.refresh()
      }
    } catch {
      setErrorMessage('Terjadi gangguan jaringan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div style={{ textAlign: 'left' }}>
        <p
          style={{
            margin: 0,
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          Google Sheet belum terhubung
        </p>
        <p
          style={{
            margin: 'var(--space-1) 0 0 0',
            fontSize: '0.8rem',
            color: 'var(--color-text-muted)',
            lineHeight: 1.4,
          }}
        >
          Spreadsheet transaksi belum selesai dibuat saat proses login sebelumnya.
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-2)',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-error-subtle)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-error)',
            fontSize: '0.8rem',
            lineHeight: 1.4,
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleRetry}
        disabled={loading}
        aria-label="Coba hubungkan Google Sheet lagi"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-2)',
          minHeight: '44px',
          width: '100%',
          padding: `var(--space-2) var(--space-4)`,
          backgroundColor: loading ? 'var(--color-surface-raised)' : 'var(--color-accent)',
          color: loading ? 'var(--color-text-muted)' : 'var(--color-accent-text)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600,
          fontSize: '0.88rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background-color var(--duration-fast) var(--ease-default)',
        }}
      >
        {loading ? (
          <>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Sedang membuat spreadsheet...</span>
          </>
        ) : (
          <>
            <RefreshCw size={16} />
            <span>Coba lagi</span>
          </>
        )}
      </button>
    </div>
  )
}
