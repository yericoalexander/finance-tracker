import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { auth } from '@/auth'
import { decrypt } from '@/lib/crypto'
import { db } from '@/lib/db/client'
import { googleTokens, users } from '@/lib/db/schema'
import { refreshSummarySheet } from '@/lib/google/sheets'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { sheetId: true },
  })

  if (!user?.sheetId) {
    return NextResponse.json({ error: 'Spreadsheet belum tersedia' }, { status: 400 })
  }

  const tokenRecord = await db.query.googleTokens.findFirst({
    where: eq(googleTokens.userId, session.user.id),
  })

  if (!tokenRecord) {
    return NextResponse.json(
      { error: 'Kredensial Google belum tersedia. Silakan login ulang.' },
      { status: 400 },
    )
  }

  try {
    const refreshToken = decrypt({
      ciphertext: tokenRecord.refreshTokenEncrypted,
      iv: tokenRecord.iv,
      authTag: tokenRecord.authTag,
    })

    await refreshSummarySheet(refreshToken, user.sheetId)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[API /api/sheets/refresh] Gagal memperbarui spreadsheet:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gagal memperbarui spreadsheet' },
      { status: 500 },
    )
  }
}
