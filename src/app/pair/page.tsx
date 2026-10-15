import { desc, eq } from 'drizzle-orm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { DeviceList } from '@/features/devices/device-list'
import { HomeScreenGuideCard } from '@/features/devices/home-screen-guide-card'
import { PairCard } from '@/features/devices/pair-card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
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
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Link
            href="/dashboard"
            prefetch={true}
            aria-label="Kembali ke Dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '44px',
              minWidth: '44px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              backgroundColor: 'var(--color-surface)',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                margin: 0,
                color: 'var(--color-text)',
              }}
            >
              Pengaturan Perangkat
            </h1>
            <p
              style={{
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
                margin: 0,
              }}
            >
              Hubungkan iPhone dan kelola akses Shortcut
            </p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <PairCard userName={session.user.name ?? undefined} />
      <HomeScreenGuideCard defaultExpanded={false} />
      <DeviceList devices={serializedDevices} />
    </main>
  )
}
