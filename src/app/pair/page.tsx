import { desc, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { PairHeader } from '@/features/devices/pair-header'
import { DeviceList } from '@/features/devices/device-list'
import { PairCard } from '@/features/devices/pair-card'
import { db } from '@/lib/db/client'
import { devices } from '@/lib/db/schema'

export default async function PairPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id

  const userDevices = await db.query.devices.findMany({
    where: eq(devices.userId, userId),
    orderBy: [desc(devices.createdAt)],
  })

  const serializedDevices = userDevices.map((d) => ({
    id: d.id,
    label: d.label,
    lastSeenAt: d.lastSeenAt ? d.lastSeenAt.toISOString() : null,
    revokedAt: d.revokedAt ? d.revokedAt.toISOString() : null,
    createdAt: d.createdAt.toISOString(),
  }))

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
      <PairHeader />

      <PairCard userName={session.user.name ?? undefined} />
      <DeviceList devices={serializedDevices} />
    </main>
  )
}
