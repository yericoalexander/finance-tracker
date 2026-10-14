import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import Image from 'next/image'

import { auth, signOut } from '@/auth'
import { ThemeToggle } from '@/components/ui/theme-toggle'
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

  const [dbUser, dashboardData] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.id, user.id),
      columns: { sheetId: true },
    }),
    getDashboardData(user.id),
  ])
  const currentSheetId = dbUser?.sheetId ?? user.sheetId

  return (
    <main
      style={{
        minHeight: '100svh',
        backgroundColor: 'var(--color-bg)',
        paddingTop: 'calc(var(--space-5) + env(safe-area-inset-top))',
        paddingBottom: 'calc(var(--space-10) + env(safe-area-inset-bottom))',
        paddingLeft: 'var(--space-5)',
        paddingRight: 'var(--space-5)',
        maxWidth: '430px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
      }}
    >
      {/* Header — mirip referensi: nama app bold kiri, avatar kanan */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 'var(--space-2)',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--color-text)',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            FINANCE.
          </h1>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)',
              marginTop: '2px',
              fontWeight: 500,
            }}
          >
            Halo, {firstName} 👋
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <ThemeToggle />
          {/* Avatar dengan initials, mirip referensi */}
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/login' })
            }}
          >
            <button
              type="submit"
              aria-label="Keluar dari akun"
              title={`Keluar (${user.name ?? ''})`}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accent-text)',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? 'avatar'}
                  width={40}
                  height={40}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              ) : (
                (user.name?.charAt(0) ?? 'U').toUpperCase()
              )}
            </button>
          </form>
        </div>
      </header>

      {!currentSheetId ? <RetrySheetCard /> : null}

      <DashboardView data={dashboardData} sheetId={currentSheetId} />
    </main>
  )
}
