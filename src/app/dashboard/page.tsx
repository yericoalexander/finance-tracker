import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

import { auth, signOut } from '@/auth'
import { DashboardHeader } from '@/features/dashboard/dashboard-header'
import { DashboardView } from '@/features/dashboard/dashboard-view'
import { getDashboardData } from '@/features/dashboard/actions'
import { RetrySheetCard } from '@/features/sheets/retry-sheet-card'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { user } = session

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
