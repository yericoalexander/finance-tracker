'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { auth } from '@/auth'
import { decrypt } from '@/lib/crypto'
import { db } from '@/lib/db/client'
import { googleTokens, users } from '@/lib/db/schema'
import { ensureSpreadsheet, GoogleApiError } from '@/lib/google/sheets'

export interface RetrySheetResult {
  ok: boolean
  sheetId?: string
  error?: string
}

/**
 * Server Action untuk membuat ulang Google Sheets bagi user yang belum punya sheetId.
 */
export async function retryEnsureSpreadsheetAction(): Promise<RetrySheetResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'Sesi telah berakhir. Silakan login kembali.' }
  }

  const userId = session.user.id
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, sheetId: true },
  })

  if (!user) {
    return { ok: false, error: 'Akun tidak ditemukan di database.' }
  }

  if (user.sheetId) {
    revalidatePath('/dashboard')
    return { ok: true, sheetId: user.sheetId }
  }

  const tokenRecord = await db.query.googleTokens.findFirst({
    where: eq(googleTokens.userId, userId),
  })

  if (!tokenRecord) {
    return { ok: false, error: 'Kredensial Google belum tersedia. Silakan login ulang.' }
  }

  try {
    const refreshToken = decrypt({
      ciphertext: tokenRecord.refreshTokenEncrypted,
      iv: tokenRecord.iv,
      authTag: tokenRecord.authTag,
    })

    const sheetId = await ensureSpreadsheet(refreshToken, null)

    await db
      .update(users)
      .set({ sheetId })
      .where(eq(users.id, userId))

    revalidatePath('/dashboard')
    return { ok: true, sheetId }
  } catch (err) {
    if (err instanceof GoogleApiError) {
      if (err.action === 're-auth') {
        return {
          ok: false,
          error: 'Izin Google Drive/Sheets ditolak. Silakan keluar dan login ulang dengan menyetujui izin Google.',
        }
      }
      return {
        ok: false,
        error: `Gagal membuat spreadsheet (${err.googleCode}): ${err.message}`,
      }
    }
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan internal'
    return { ok: false, error: `Gagal membuat spreadsheet: ${msg}` }
  }
}
