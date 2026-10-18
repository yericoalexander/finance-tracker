import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

import { auth } from '@/auth'
import { db } from '@/lib/db/client'
import { pushSubscriptions } from '@/lib/db/schema'
import { env } from '@/lib/env'

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
  userAgent: z.string().optional(),
})

const unsubscribeSchema = z.object({
  endpoint: z.string().url(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    publicKey: env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null,
  })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const json: unknown = await req.json()
    const parsed = subscribeSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Format data langganan tidak valid', details: parsed.error.format() },
        { status: 400 },
      )
    }

    const { endpoint, p256dh, auth: authSecret, userAgent } = parsed.data

    await db
      .insert(pushSubscriptions)
      .values({
        userId: session.user.id,
        endpoint,
        p256dh,
        auth: authSecret,
        userAgent,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: {
          userId: session.user.id,
          p256dh,
          auth: authSecret,
          userAgent,
          updatedAt: new Date(),
        },
      })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Gagal menyimpan langganan'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const json: unknown = await req.json()
    const parsed = unsubscribeSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Endpoint tidak valid' }, { status: 400 })
    }

    await db
      .delete(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.userId, session.user.id),
          eq(pushSubscriptions.endpoint, parsed.data.endpoint),
        ),
      )

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Gagal menghapus langganan'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
