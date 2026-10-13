import { eq } from 'drizzle-orm'
import { LogOut } from 'lucide-react'
import { redirect } from 'next/navigation'

import { auth, signOut } from '@/auth'
import { DashboardView } from '@/features/dashboard/dashboard-view'
import { getDashboardData } from '@/features/dashboard/actions'
import { RetrySheetCard } from '@/features/sheets/retry-sheet-card'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { user } = session
  const firstName = user.name?.split(' ')[0] ?? 'Kamu'

  // Ambil sheetId terbaru langsung dari database
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    columns: { sheetId: true },
  })
  const currentSheetId = dbUser?.sheetId ?? user.sheetId

  const dashboardData = await getDashboardData(user.id)

  return (
    <main
      style={{
        minHeight: '100svh',
        backgroundColor: 'var(--color-bg)',
        padding: 'var(--space-6)',
        paddingTop: 'calc(var(--space-6) + env(safe-area-inset-top))',
        paddingBottom: 'calc(var(--space-8) + env(safe-area-inset-bottom))',
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
            aria-label="Keluar dari akun"
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

      {/* Kartu coba lagi bila pembuatan spreadsheet awal belum selesai */}
      {!currentSheetId ? <RetrySheetCard /> : null}

      {/* Antarmuka Dashboard Interaktif */}
      <DashboardView data={dashboardData} sheetId={currentSheetId} />
    </main>
  )
}
