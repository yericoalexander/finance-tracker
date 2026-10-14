import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

import { auth, signOut } from '@/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0
import { DashboardHeader } from '@/features/dashboard/dashboard-header'
import { DashboardView } from '@/features/dashboard/dashboard-view'
import { getDashboardData } from '@/features/dashboard/actions'
import { SetupGate } from '@/features/devices/setup-gate'
import { RetrySheetCard } from '@/features/sheets/retry-sheet-card'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'

interface DashboardPageProps {
  searchParams: Promise<{ skip?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { user } = session
  const params = await searchParams

  // Gunakan sheetId dari sesi JWT jika sudah ada untuk menghindari query database tambahan
  const [dbUser, dashboardData] = await Promise.all([
    user.sheetId
      ? Promise.resolve(null)
      : db.query.users.findFirst({
          where: eq(users.id, user.id),
          columns: { sheetId: true },
        }),
    getDashboardData(user.id),
  ])
  const currentSheetId = user.sheetId ?? dbUser?.sheetId ?? null

  // Jika belum ada perangkat iPhone terhubung, wajibkan setup terlebih dahulu
  if (!dashboardData.activeDevice && params.skip !== 'true') {
    return (
      <main
        style={{
          minHeight: '100svh',
          backgroundColor: 'var(--color-bg)',
          paddingLeft: 'var(--space-5)',
          paddingRight: 'var(--space-5)',
          maxWidth: '430px',
          margin: '0 auto',
        }}
      >
        <SetupGate
          user={user}
          onSignOut={async () => {
            'use server'
            await signOut({ redirectTo: '/login' })
          }}
        />
      </main>
    )
  }

  return (
    <main
      style={{
        minHeight: '100svh',
        backgroundColor: 'var(--color-bg)',
        paddingTop: 0,
        paddingBottom: 'calc(var(--space-10) + env(safe-area-inset-bottom))',
        paddingLeft: 'var(--space-5)',
        paddingRight: 'var(--space-5)',
        maxWidth: '430px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <DashboardView
        data={dashboardData}
        sheetId={currentSheetId}
        userName={user.name ?? undefined}
        header={
          <DashboardHeader
            user={user}
            sheetId={currentSheetId}
            onSignOut={async () => {
              'use server'
              await signOut({ redirectTo: '/login' })
            }}
          />
        }
        banner={!currentSheetId ? <RetrySheetCard /> : null}
      />
    </main>
  )
}
