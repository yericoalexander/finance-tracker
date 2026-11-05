'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/db/client'
import { wallets, type WalletRecord } from '@/lib/db/schema'
import { ensureUserWallets } from './wallet-sync'
import type { Wallet } from './types'

const WalletFormActionSchema = z.object({
  name: z.string().trim().min(1, 'Nama dompet wajib diisi').max(40, 'Maksimal 40 karakter'),
  balanceIdr: z.coerce.number().int().nonnegative('Saldo tidak boleh negatif'),
  themeId: z.string().min(1),
})

function recordToWallet(rec: WalletRecord): Wallet {
  return {
    id: rec.id,
    name: rec.name,
    balanceIdr: rec.balanceIdr,
    themeId: rec.themeId,
    order: rec.order,
    createdAt: rec.createdAt.toISOString(),
  }
}

/**
 * Ambil daftar dompet pengguna dari database. Jika baru, sediakan starter otomatis.
 */
export async function getWalletsAction(): Promise<{ ok: boolean; data?: Wallet[]; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'Sesi berakhir, silakan login kembali' }
  }

  try {
    const list = await ensureUserWallets(session.user.id)
    return { ok: true, data: list.map(recordToWallet) }
  } catch (err) {
    console.error('[getWalletsAction] Gagal mengambil dompet:', err)
    return { ok: false, error: 'Gagal memuat data dompet' }
  }
}

/**
 * Tambah kartu/dompet baru ke database.
 */
export async function createWalletAction(
  rawInput: unknown,
): Promise<{ ok: boolean; data?: Wallet; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'Sesi berakhir, silakan login kembali' }
  }

  const parsed = WalletFormActionSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Data dompet tidak valid' }
  }

  const { name, balanceIdr, themeId } = parsed.data
  const userId = session.user.id

  try {
    const currentWallets = await db.query.wallets.findMany({
      where: eq(wallets.userId, userId),
    })

    const [newRecord] = await db
      .insert(wallets)
      .values({
        userId,
        name,
        balanceIdr,
        themeId,
        order: currentWallets.length,
      })
      .returning()

    if (!newRecord) {
      return { ok: false, error: 'Gagal menyimpan dompet baru' }
    }

    revalidatePath('/dashboard')
    return { ok: true, data: recordToWallet(newRecord) }
  } catch (err) {
    console.error('[createWalletAction] Gagal membuat dompet:', err)
    return { ok: false, error: 'Terjadi kesalahan sistem saat membuat dompet' }
  }
}

/**
 * Perbarui nama, saldo, atau tema dompet di database.
 */
export async function updateWalletAction(
  id: string,
  rawInput: unknown,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'Sesi berakhir, silakan login kembali' }
  }

  const parsed = WalletFormActionSchema.partial().safeParse(rawInput)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Data pembaruan tidak valid' }
  }

  try {
    await db
      .update(wallets)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(wallets.id, id))

    revalidatePath('/dashboard')
    return { ok: true }
  } catch (err) {
    console.error('[updateWalletAction] Gagal memperbarui dompet:', err)
    return { ok: false, error: 'Gagal memperbarui dompet' }
  }
}

/**
 * Hapus dompet dari database.
 */
export async function deleteWalletAction(id: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'Sesi berakhir, silakan login kembali' }
  }

  try {
    await db.delete(wallets).where(eq(wallets.id, id))
    revalidatePath('/dashboard')
    return { ok: true }
  } catch (err) {
    console.error('[deleteWalletAction] Gagal menghapus dompet:', err)
    return { ok: false, error: 'Gagal menghapus dompet' }
  }
}

/**
 * Penyesuaian cepat saldo dompet (+/- nominal) dari UI.
 */
export async function quickAdjustWalletAction(
  id: string,
  deltaIdr: number,
): Promise<{ ok: boolean; newBalance?: number; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'Sesi berakhir, silakan login kembali' }
  }

  try {
    const existing = await db.query.wallets.findFirst({
      where: eq(wallets.id, id),
    })

    if (!existing) {
      return { ok: false, error: 'Dompet tidak ditemukan' }
    }

    const newBalance = Math.max(0, existing.balanceIdr + deltaIdr)
    await db
      .update(wallets)
      .set({ balanceIdr: newBalance, updatedAt: new Date() })
      .where(eq(wallets.id, id))

    revalidatePath('/dashboard')
    return { ok: true, newBalance }
  } catch (err) {
    console.error('[quickAdjustWalletAction] Gagal menyesuaikan saldo:', err)
    return { ok: false, error: 'Gagal mengubah saldo dompet' }
  }
}
