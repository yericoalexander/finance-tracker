'use server'

import { and, desc, eq, isNull, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { auth } from '@/auth'
import { CATEGORIES } from '@/lib/ai/types'
import { decrypt } from '@/lib/crypto'
import { db } from '@/lib/db/client'
import {
  captures,
  devices,
  googleTokens,
  reminderSettings,
  users,
  type ReminderSetting,
} from '@/lib/db/schema'
import { appendTransactionRow, deleteTransactionRow } from '@/lib/google/sheets'
import { evaluateBudgetReminder } from './reminder-evaluator'

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
  availableMonths?: string[]
  reminderSetting?: ReminderSetting | null
}

/**
 * Ambil semua data statistik dashboard untuk user yang sedang login.
 */
export async function getDashboardData(userId: string): Promise<DashboardData> {
  const currentMonthPrefix = new Date().toISOString().slice(0, 7) // 'YYYY-MM'

  // Eksekusi semua query secara paralel untuk memangkas waktu tunggu database
  const [
    reviewQueue,
    monthOkCaptures,
    recentTransactions,
    activeDeviceList,
    monthRows,
    userReminder,
  ] = await Promise.all([
    // 1. Antrean review (needs_review)
    db
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
      .orderBy(desc(captures.createdAt)),

    // 2. Transaksi sukses bulan ini untuk hitung MTD & kategori
    db
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
      .orderBy(desc(captures.createdAt)),

    // 3. 50 transaksi sukses terbaru secara keseluruhan untuk filter tab Transaksi
    db
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
      .limit(50),

    // 4. Perangkat iPhone aktif terakhir (non-blocking / resilient)
    db
      .select({
        label: devices.label,
        lastSeenAt: devices.lastSeenAt,
      })
      .from(devices)
      .where(and(eq(devices.userId, userId), isNull(devices.revokedAt)))
      .orderBy(desc(devices.lastSeenAt))
      .limit(1)
      .catch((err) => {
        console.warn('[Dashboard] Info perangkat aktif tidak dapat dimuat:', err)
        return []
      }),

    // 5. Daftar bulan unik yang tercatat di riwayat transaksi
    db
      .select({
        month: sql<string>`DISTINCT SUBSTRING(${captures.txDate}, 1, 7)`,
      })
      .from(captures)
      .where(
        and(
          eq(captures.userId, userId),
          eq(captures.status, 'ok'),
          sql`${captures.txDate} IS NOT NULL`,
        ),
      )
      .limit(12)
      .catch(() => []),

    // 6. Pengaturan limit & pengingat budget pengguna
    db.query.reminderSettings
      .findFirst({
        where: eq(reminderSettings.userId, userId),
      })
      .catch(() => null),
  ])

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

  const activeDevice = activeDeviceList[0] ?? null

  // Susun daftar bulan unik secara aman
  const monthsSet = new Set<string>([currentMonthPrefix])
  for (const c of monthOkCaptures) {
    if (c.txDate && c.txDate.length >= 7) monthsSet.add(c.txDate.slice(0, 7))
  }
  for (const tx of recentTransactions) {
    if (tx.txDate && tx.txDate.length >= 7) monthsSet.add(tx.txDate.slice(0, 7))
  }
  for (const r of monthRows ?? []) {
    if (r.month && r.month.length >= 7) monthsSet.add(r.month)
  }
  const availableMonths = Array.from(monthsSet).sort().reverse()

  return {
    mtdTotal,
    txCount,
    recentTransactions,
    reviewQueue,
    categoryBreakdown,
    activeDevice,
    availableMonths,
    reminderSetting: userReminder ?? null,
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

/**
 * Ambil data ringkasan pengeluaran & kategori untuk bulan tertentu (format YYYY-MM).
 */
export async function getMonthSummaryAction(targetMonth: string): Promise<{
  ok: boolean
  data?: {
    month: string
    total: number
    txCount: number
    categoryBreakdown: CategorySummary[]
  }
  error?: string
}> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'Sesi telah berakhir, silakan login kembali' }
  }

  if (!/^\d{4}-\d{2}$/.test(targetMonth)) {
    return { ok: false, error: 'Format bulan tidak valid' }
  }

  const userId = session.user.id

  try {
    const monthCaptures = await db
      .select({
        amountIdr: captures.amountIdr,
        category: captures.category,
      })
      .from(captures)
      .where(
        and(
          eq(captures.userId, userId),
          eq(captures.status, 'ok'),
          sql`${captures.txDate} LIKE ${`${targetMonth}%`}`,
        ),
      )

    const total = monthCaptures.reduce((sum, c) => sum + (c.amountIdr ?? 0), 0)
    const txCount = monthCaptures.length

    const catTotals: Record<string, number> = {}
    for (const c of monthCaptures) {
      const cat = c.category ?? 'Lainnya'
      catTotals[cat] = (catTotals[cat] ?? 0) + (c.amountIdr ?? 0)
    }

    const categoryBreakdown: CategorySummary[] = Object.entries(catTotals)
      .map(([category, catTotal]) => ({
        category,
        total: catTotal,
        percentage: total > 0 ? Math.round((catTotal / total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)

    return {
      ok: true,
      data: {
        month: targetMonth,
        total,
        txCount,
        categoryBreakdown,
      },
    }
  } catch (err) {
    console.error('[Dashboard] Gagal memuat ringkasan bulan:', err)
    return { ok: false, error: 'Gagal memuat ringkasan bulan' }
  }
}

/**
 * Hapus transaksi dari database dan Google Sheets (otomatis merapikan baris tanpa celah).
 */
export async function deleteTransactionAction(
  captureId: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'Sesi telah berakhir, silakan login kembali' }
  }

  const userId = session.user.id

  // 1. Ambil data capture untuk verifikasi kepemilikan dan data pencocokan sheets
  const [captureRecord] = await db
    .select()
    .from(captures)
    .where(and(eq(captures.id, captureId), eq(captures.userId, userId)))
    .limit(1)

  if (!captureRecord) {
    return { ok: false, error: 'Transaksi tidak ditemukan' }
  }

  // 2. Jika user memiliki Google Sheet yang terhubung, hapus barisnya di Google Sheets
  const [userList, tokenList] = await Promise.all([
    db.select({ sheetId: users.sheetId }).from(users).where(eq(users.id, userId)).limit(1),
    db.select().from(googleTokens).where(eq(googleTokens.userId, userId)).limit(1),
  ])

  const userRecord = userList[0]
  const tokenRecord = tokenList[0]

  if (userRecord?.sheetId && tokenRecord) {
    try {
      const refreshToken = decrypt({
        ciphertext: tokenRecord.refreshTokenEncrypted,
        iv: tokenRecord.iv,
        authTag: tokenRecord.authTag,
      })

      await deleteTransactionRow(refreshToken, userRecord.sheetId, captureId, {
        date: captureRecord.txDate ?? undefined,
        merchant: captureRecord.merchant ?? undefined,
        amountIdr: captureRecord.amountIdr ?? undefined,
      })
    } catch (err) {
      console.warn('[Dashboard] Gagal menghapus baris di Google Sheets:', err)
    }
  }

  // 3. Hapus capture dari database
  await db.delete(captures).where(and(eq(captures.id, captureId), eq(captures.userId, userId)))

  // 4. Evaluasi ulang milestone pengingat jika pengeluaran turun di bawah ambang batas
  const txMonthPrefix = captureRecord.txDate?.slice(0, 7) || new Date().toISOString().slice(0, 7)
  await evaluateBudgetReminder(userId, txMonthPrefix).catch(() => null)

  revalidatePath('/dashboard')
  return { ok: true }
}
