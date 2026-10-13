'use server'

import crypto from 'node:crypto'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { auth } from '@/auth'
import { CATEGORIES } from '@/lib/ai/types'
import { decrypt } from '@/lib/crypto'
import { db } from '@/lib/db/client'
import { captures, googleTokens, users } from '@/lib/db/schema'
import { appendTransactionRow } from '@/lib/google/sheets'

const CreateManualTransactionSchema = z.object({
  merchant: z.string().trim().min(1, 'Nama merchant tidak boleh kosong').max(100),
  amountIdr: z.coerce.number().int().positive('Nominal harus lebih dari 0'),
  category: z.enum(CATEGORIES),
  txDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  paymentMethod: z.string().trim().max(50).optional().default('Lainnya'),
  note: z.string().trim().max(200).optional().default('-'),
})

export type CreateManualTransactionInput = z.infer<typeof CreateManualTransactionSchema>

/**
 * Fetch Google refresh token and sheetId for authenticated user.
 */
async function getUserGoogleCredentials(userId: string) {
  const [userRecord] = await db
    .select({ sheetId: users.sheetId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!userRecord?.sheetId) {
    throw new Error('Google Sheet belum terhubung. Hubungkan di dashboard terlebih dahulu.')
  }

  const [tokenRecord] = await db
    .select()
    .from(googleTokens)
    .where(eq(googleTokens.userId, userId))
    .limit(1)

  if (!tokenRecord) {
    throw new Error('Token Google tidak ditemukan. Silakan login ulang.')
  }

  const refreshToken = decrypt({
    ciphertext: tokenRecord.refreshTokenEncrypted,
    iv: tokenRecord.iv,
    authTag: tokenRecord.authTag,
  })

  return { sheetId: userRecord.sheetId, refreshToken }
}

/**
 * Record a manual transaction directly to Google Sheets and the database.
 */
export async function createManualTransactionAction(
  rawInput: unknown,
): Promise<{ ok: boolean; error?: string; id?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'Sesi telah berakhir, silakan login kembali' }
  }

  const parseResult = CreateManualTransactionSchema.safeParse(rawInput)
  if (!parseResult.success) {
    return { ok: false, error: parseResult.error.issues[0]?.message ?? 'Data transaksi tidak valid' }
  }

  const data = parseResult.data
  const userId = session.user.id
  const captureId = crypto.randomUUID()
  const imageHash = crypto
    .createHash('sha256')
    .update(`manual-${userId}-${Date.now()}-${captureId}`)
    .digest('hex')

  try {
    const { sheetId, refreshToken } = await getUserGoogleCredentials(userId)

    await appendTransactionRow(refreshToken, sheetId, {
      date: data.txDate,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      merchant: data.merchant,
      category: data.category,
      amountIdr: data.amountIdr,
      paymentMethod: data.paymentMethod ?? 'Lainnya',
      note: data.note ?? '-',
      source: 'Manual (Web)',
      id: captureId,
    })

    await db.insert(captures).values({
      id: captureId,
      userId,
      imageHash,
      status: 'ok',
      confidence: 1.0,
      merchant: data.merchant,
      amountIdr: data.amountIdr,
      category: data.category,
      txDate: data.txDate,
      sheetRowId: captureId,
    })

    revalidatePath('/dashboard')
    return { ok: true, id: captureId }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Gagal menyimpan transaksi'
    return { ok: false, error: msg }
  }
}
