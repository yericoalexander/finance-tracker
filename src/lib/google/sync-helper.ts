import { eq } from 'drizzle-orm'
import type { TransactionExtraction } from '@/lib/ai/types'
import { decrypt } from '@/lib/crypto'
import { db } from '@/lib/db/client'
import { googleTokens, users } from '@/lib/db/schema'
import { appendTransactionRow, ensureSpreadsheet } from '@/lib/google/sheets'

export async function syncCaptureToGoogleSheets(
  userId: string,
  captureId: string,
  extraction: TransactionExtraction,
  source: string = 'iPhone',
  preloaded?: {
    user?: { sheetId: string | null } | null
    tokenRecord?: typeof googleTokens.$inferSelect | null
  },
) {
  let user = preloaded?.user
  let tokenRecord = preloaded?.tokenRecord

  if (!preloaded) {
    const [dbUser, dbToken] = await Promise.all([
      db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { sheetId: true },
      }),
      db.query.googleTokens.findFirst({
        where: eq(googleTokens.userId, userId),
      }),
    ])
    user = dbUser
    tokenRecord = dbToken
  }

  if (!tokenRecord) {
    throw new Error('GOOGLE_AUTH_MISSING')
  }

  const refreshToken = decrypt({
    ciphertext: tokenRecord.refreshTokenEncrypted,
    iv: tokenRecord.iv,
    authTag: tokenRecord.authTag,
  })

  let sheetId = user?.sheetId
  if (!sheetId) {
    sheetId = await ensureSpreadsheet(refreshToken, null)
    await db.update(users).set({ sheetId }).where(eq(users.id, userId))
  }

  await appendTransactionRow(refreshToken, sheetId, {
    date: extraction.date,
    time: extraction.time,
    merchant: extraction.merchant,
    category: extraction.category,
    amountIdr: extraction.amountIdr,
    paymentMethod: extraction.paymentMethod,
    note: extraction.note,
    source,
    id: captureId,
  })
}

