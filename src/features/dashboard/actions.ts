'use server'

import { and, desc, eq, isNull, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { auth } from '@/auth'
import { CATEGORIES } from '@/lib/ai/types'
import { decrypt } from '@/lib/crypto'
import { db } from '@/lib/db/client'
import { captures, devices, googleTokens, users } from '@/lib/db/schema'
import { appendTransactionRow } from '@/lib/google/sheets'

const ApproveReviewSchema = z.object({
  captureId: z.string().uuid(),
  merchant: z.string().min(1, 'Merchant tidak boleh kosong').max(100),
  amountIdr: z.coerce.number().int().positive('Nominal harus lebih dari 0'),
  category: z.enum(CATEGORIES),
  txDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD'),
  paymentMethod: z.string().max(50).optional().default('Lainnya'),
  note: z.string().max(200).optional().default('-'),
})

export interface CategorySummary {
  category: string
  total: number
  percentage: number
}

export interface DashboardData {
  mtdTotal: number
  txCount: number
  recentTransactions: Array<{
    id: string
    merchant: string | null
    amountIdr: number | null
    category: string | null
    txDate: string | null
    createdAt: Date
  }>
  reviewQueue: Array<{
    id: string
    merchant: string | null
    amountIdr: number | null
    category: string | null
    txDate: string | null
    confidence: number | null
    createdAt: Date
  }>
  categoryBreakdown: CategorySummary[]
  activeDevice?: {
    label: string
    lastSeenAt: Date | null
  } | null
}

/**
 * Ambil semua data statistik dashboard untuk user yang sedang login.
 */
export async function getDashboardData(userId: string): Promise<DashboardData> {
  const currentMonthPrefix = new Date().toISOString().slice(0, 7) // 'YYYY-MM'

  // 1. Antrean review (needs_review)
  const reviewQueue = await db
    .select({
      id: captures.id,
      merchant: captures.merchant,
      amountIdr: captures.amountIdr,
      category: captures.category,
      txDate: captures.txDate,
      confidence: captures.confidence,
      createdAt: captures.createdAt,
    })
    .from(captures)
    .where(and(eq(captures.userId, userId), eq(captures.status, 'needs_review')))
    .orderBy(desc(captures.createdAt))

  // 2. Transaksi sukses bulan ini untuk hitung MTD & kategori
  const monthOkCaptures = await db
    .select({
      id: captures.id,
      merchant: captures.merchant,
      amountIdr: captures.amountIdr,
      category: captures.category,
      txDate: captures.txDate,
      createdAt: captures.createdAt,
    })
    .from(captures)
    .where(
      and(
        eq(captures.userId, userId),
        eq(captures.status, 'ok'),
        sql`${captures.txDate} LIKE ${`${currentMonthPrefix}%`}`,
      ),
    )
    .orderBy(desc(captures.createdAt))

  const mtdTotal = monthOkCaptures.reduce((sum, c) => sum + (c.amountIdr ?? 0), 0)
  const txCount = monthOkCaptures.length

  // Breakdown kategori
  const catTotals: Record<string, number> = {}
  for (const c of monthOkCaptures) {
    const cat = c.category ?? 'Lainnya'
    catTotals[cat] = (catTotals[cat] ?? 0) + (c.amountIdr ?? 0)
  }

  const categoryBreakdown: CategorySummary[] = Object.entries(catTotals)
    .map(([category, total]) => ({
      category,
      total,
      percentage: mtdTotal > 0 ? Math.round((total / mtdTotal) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)

  // 3. 50 transaksi sukses terbaru secara keseluruhan untuk filter tab Transaksi
  const recentTransactions = await db
    .select({
      id: captures.id,
      merchant: captures.merchant,
      amountIdr: captures.amountIdr,
      category: captures.category,
      txDate: captures.txDate,
      createdAt: captures.createdAt,
    })
    .from(captures)
    .where(and(eq(captures.userId, userId), eq(captures.status, 'ok')))
    .orderBy(desc(captures.createdAt))
    .limit(50)

  // 4. Perangkat iPhone aktif terakhir
  const [activeDevice] = await db
    .select({
      label: devices.label,
      lastSeenAt: devices.lastSeenAt,
    })
    .from(devices)
    .where(and(eq(devices.userId, userId), isNull(devices.revokedAt)))
    .orderBy(desc(devices.lastSeenAt))
    .limit(1)

  return {
    mtdTotal,
    txCount,
    recentTransactions,
    reviewQueue,
    categoryBreakdown,
    activeDevice: activeDevice ?? null,
  }
}

/**
 * Setujui dan simpan transaksi dari antrean review langsung ke Google Sheets.
 */
export async function approveReviewAction(
  rawInput: unknown,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'Sesi telah berakhir, silakan login kembali' }
  }

  const parseResult = ApproveReviewSchema.safeParse(rawInput)
  if (!parseResult.success) {
    return { ok: false, error: parseResult.error.issues[0]?.message ?? 'Input tidak valid' }
  }

  const data = parseResult.data
  const userId = session.user.id

  // Ambil user dan token Google
  const [userRecord] = await db
    .select({ sheetId: users.sheetId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!userRecord?.sheetId) {
    return { ok: false, error: 'Google Sheet belum terhubung. Buka dashboard untuk menghubungkan.' }
  }

  const [tokenRecord] = await db
    .select()
    .from(googleTokens)
    .where(eq(googleTokens.userId, userId))
    .limit(1)

  if (!tokenRecord) {
    return { ok: false, error: 'Token Google tidak ditemukan. Silakan login ulang.' }
  }

  const refreshToken = decrypt({
    ciphertext: tokenRecord.refreshTokenEncrypted,
    iv: tokenRecord.iv,
    authTag: tokenRecord.authTag,
  })

  // Tulis ke Google Sheets
  try {
    await appendTransactionRow(refreshToken, userRecord.sheetId, {
      date: data.txDate,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      merchant: data.merchant,
      category: data.category,
      amountIdr: data.amountIdr,
      paymentMethod: data.paymentMethod,
      note: data.note,
      source: 'iPhone (Review)',
      id: data.captureId,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Gagal menulis ke Google Sheets'
    return { ok: false, error: msg }
  }

  // Update status di DB
  await db
    .update(captures)
    .set({
      merchant: data.merchant,
      amountIdr: data.amountIdr,
      category: data.category,
      txDate: data.txDate,
      status: 'ok',
      sheetRowId: data.captureId,
    })
    .where(and(eq(captures.id, data.captureId), eq(captures.userId, userId)))

  revalidatePath('/dashboard')
  return { ok: true }
}

/**
 * Abaikan transaksi di antrean review agar tidak muncul lagi.
 */
export async function dismissReviewAction(
  captureId: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'Sesi telah berakhir, silakan login kembali' }
  }

  await db
    .update(captures)
    .set({ status: 'ignored' })
    .where(and(eq(captures.id, captureId), eq(captures.userId, session.user.id)))

  revalidatePath('/dashboard')
  return { ok: true }
}
