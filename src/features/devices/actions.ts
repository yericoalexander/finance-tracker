'use server'

import { createHash, randomBytes } from 'crypto'
import { and, desc, eq, gt, isNull } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { auth } from '@/auth'
import { db } from '@/lib/db/client'
import { devices, pairingCodes } from '@/lib/db/schema'

export interface PairingCodeResult {
  ok: boolean
  code?: string
  expiresAt?: string
  error?: string
}

export interface DeviceItem {
  id: string
  label: string
  lastSeenAt: string | null
  revokedAt: string | null
  createdAt: string
}

/**
 * Buat kode pairing 8 karakter acak baru, berlaku 10 menit, sekali pakai.
 * Hanya menyimpan hash SHA-256 di database.
 */
export async function createPairingCodeAction(): Promise<PairingCodeResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'Sesi telah berakhir. Silakan login kembali.' }
  }

  const userId = session.user.id

  // Buat kode 8 karakter alfanumerik uppercase yang mudah dibaca
  const rawCode = randomBytes(4).toString('hex').toUpperCase()
  const codeHash = createHash('sha256').update(rawCode).digest('hex')
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 menit

  try {
    await db.insert(pairingCodes).values({
      userId,
      codeHash,
      expiresAt,
    })

    revalidatePath('/pair')
    return { ok: true, code: rawCode, expiresAt: expiresAt.toISOString() }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, error: `Gagal membuat kode pairing: ${msg}` }
  }
}

/**
 * Mengambil kode pairing yang masih aktif untuk user (jika ada).
 */
export async function getActivePairingCodeAction(): Promise<PairingCodeResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'Sesi tidak valid' }
  }

  const now = new Date()
  const active = await db.query.pairingCodes.findFirst({
    where: and(
      eq(pairingCodes.userId, session.user.id),
      gt(pairingCodes.expiresAt, now),
      isNull(pairingCodes.usedAt),
    ),
    orderBy: [desc(pairingCodes.expiresAt)],
  })

  if (!active) {
    return { ok: false }
  }

  return { ok: true, expiresAt: active.expiresAt.toISOString() }
}

/**
 * Cabut akses perangkat terhubung.
 */
export async function revokeDeviceAction(deviceId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'Sesi tidak valid' }
  }

  try {
    await db
      .update(devices)
      .set({ revokedAt: new Date() })
      .where(and(eq(devices.id, deviceId), eq(devices.userId, session.user.id)))

    revalidatePath('/pair')
    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, error: `Gagal mencabut perangkat: ${msg}` }
  }
}
