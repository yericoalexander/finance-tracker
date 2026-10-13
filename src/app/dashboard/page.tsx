import { eq } from 'drizzle-orm'
import { ExternalLink, LogOut } from 'lucide-react'
import { redirect } from 'next/navigation'

import { auth, signOut } from '@/auth'
import { RetrySheetCard } from '@/features/sheets/retry-sheet-card'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { user } = session
  const firstName = user.name?.split(' ')[0] ?? 'Kamu'

  // Ambil sheetId terbaru langsung dari database
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    columns: { sheetId: true },
  })
  const currentSheetId = dbUser?.sheetId ?? user.sheetId

  return (
    <main
      style={{
        minHeight: '100svh',
        backgroundColor: 'var(--color-bg)',
        padding: 'var(--space-6)',
        paddingTop: 'calc(var(--space-6) + env(safe-area-inset-top))',
        paddingBottom: 'calc(var(--space-6) + env(safe-area-inset-bottom))',
        maxWidth: '430px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Selamat datang kembali
          </p>
          <h1
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              color: 'var(--color-text)',
              margin: 0,
            }}
          >
            Halo, {firstName} 👋
          </h1>
        </div>

        {/* Tombol keluar */}
        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/login' })
          }}
        >
          <button
            type="submit"
            aria-label="Keluar"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
              minHeight: '44px',
              minWidth: '44px',
              padding: `var(--space-2) var(--space-3)`,
              backgroundColor: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-muted)',
              fontSize: '0.82rem',
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            <LogOut size={16} />
            Keluar
          </button>
        </form>
      </header>

      {/* Placeholder konten — diisi di Fase 3 */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8)',
          border: '1px solid var(--color-border)',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: '0.9rem',
        }}
      >
        Dashboard lengkap tersedia di Fase 3.
      </div>

      {/* Tombol buka Google Sheets */}
      {currentSheetId && (
        <a
          href={`https://docs.google.com/spreadsheets/d/${currentSheetId}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-2)',
            minHeight: '44px',
            padding: `var(--space-3) var(--space-5)`,
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-accent-text)',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          <ExternalLink size={16} />
          Buka Google Sheets
        </a>
      )}

      {/* Navigasi ke Pengaturan Perangkat */}
      <a
        href="/pair"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-2)',
          minHeight: '44px',
          padding: `var(--space-3) var(--space-5)`,
          backgroundColor: 'transparent',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text)',
          borderRadius: 'var(--radius-md)',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '0.9rem',
        }}
      >
        Pengaturan Perangkat & Pairing
      </a>

      {/* Retry card jika sheet belum dibuat */}
      {!currentSheetId && <RetrySheetCard />}
    </main>
  )
}
