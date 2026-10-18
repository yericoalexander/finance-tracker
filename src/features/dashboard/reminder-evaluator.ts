import { and, eq, sql } from 'drizzle-orm'

import { formatRupiah } from '@/lib/ai/currency'
import { db } from '@/lib/db/client'
import { captures, reminderSettings } from '@/lib/db/schema'

export interface BudgetReminderEvaluation {
  shouldAlert: boolean
  monthlyLimitIdr?: number
  currentMonthTotal?: number
  alertMessage?: string
  milestone?: string
}

/**
 * Format pesan pengingat kustom dengan mengganti placeholder variabel pintar.
 */
export function formatReminderMessage(
  customMessage: string | null | undefined,
  total: number,
  limit: number,
  isEarlyWarning = false,
  warningPercent = 90,
): string {
  const formattedTotal = formatRupiah(total)
  const formattedLimit = formatRupiah(limit)
  const cleanedText = customMessage?.trim() || ''

  if (isEarlyWarning) {
    const baseWarning = `⚠️ PERINGATAN: Pengeluaran bulan ini sudah mencapai ${warningPercent}% (${formattedTotal} dari batas ${formattedLimit}).`
    if (cleanedText) {
      return `${baseWarning} ${cleanedText}`
    }
    return baseWarning
  }

  const baseNotice = `🚨 BATAS TERLAMPAUI: Pengeluaran bulan ini sudah mencapai ${formattedTotal}! (Batas: ${formattedLimit})`
  if (!cleanedText) {
    return baseNotice
  }

  // Jika pengguna menulis tag template, ganti dengan nilai variabel
  if (
    cleanedText.includes('{total}') ||
    cleanedText.includes('{limit}') ||
    cleanedText.includes('{sisa}')
  ) {
    return cleanedText
      .replace(/\{total\}/gi, formattedTotal)
      .replace(/\{limit\}/gi, formattedLimit)
      .replace(/\{sisa\}/gi, formatRupiah(Math.max(0, limit - total)))
  }

  // Pengguna hanya mengetik teks pengingat murni tanpa angka; sistem otomatis menyertakan nominal di depannya
  return `${baseNotice} ${cleanedText}`
}

/**
 * Evaluasi apakah pengeluaran bulan berjalan pengguna telah mencapai atau melampaui limit.
 * Dilengkapi Anti-Spam / Throttle agar notifikasi tidak membombardir HP pada transaksi-transaksi kecil berikutnya.
 * Jika pengeluaran turun di bawah ambang batas (karena transaksi dihapus), milestone di-reset otomatis
 * agar notifikasi dapat berbunyi kembali saat melampaui ambang batas lagi.
 */
export async function evaluateBudgetReminder(
  userId: string,
  txMonthPrefix: string,
): Promise<BudgetReminderEvaluation> {
  // Ambil pengaturan pengingat pengguna
  const settings = await db.query.reminderSettings.findFirst({
    where: eq(reminderSettings.userId, userId),
  })

  if (
    !settings ||
    !settings.isEnabled ||
    !settings.monthlyLimitIdr ||
    settings.monthlyLimitIdr <= 0
  ) {
    return { shouldAlert: false }
  }

  // Hitung akumulasi pengeluaran sukses bulan ini secara langsung di database
  const [sumResult] = await db
    .select({
      total: sql<number | null>`COALESCE(SUM(${captures.amountIdr}), 0)::integer`,
    })
    .from(captures)
    .where(
      and(
        eq(captures.userId, userId),
        eq(captures.status, 'ok'),
        sql`${captures.txDate} LIKE ${`${txMonthPrefix}%`}`,
      ),
    )

  const currentMonthTotal = sumResult?.total ?? 0
  const limit = settings.monthlyLimitIdr
  const lastMilestone = settings.lastAlertMilestone

  const thresholdPct = settings.warningThresholdPercent ?? (settings.earlyWarningEnabled ? 90 : 0)
  const thresholdAmount =
    thresholdPct > 0 && thresholdPct < 100 ? Math.round((limit * thresholdPct) / 100) : limit

  // 1. Cek Batas Penuh (100%)
  if (currentMonthTotal >= limit) {
    const targetMilestone = `${txMonthPrefix}:100`

    // Anti-spam throttle: jika sudah pernah diberi tahu 100% di bulan ini, jangan spam lagi
    if (lastMilestone === targetMilestone) {
      return {
        shouldAlert: false,
        monthlyLimitIdr: limit,
        currentMonthTotal,
      }
    }

    // Catat bahwa milestone 100% sudah di-alert
    await db
      .update(reminderSettings)
      .set({
        lastAlertMilestone: targetMilestone,
        updatedAt: new Date(),
      })
      .where(eq(reminderSettings.userId, userId))

    const alertMessage = formatReminderMessage(
      settings.customMessage,
      currentMonthTotal,
      limit,
      false,
    )

    return {
      shouldAlert: true,
      monthlyLimitIdr: limit,
      currentMonthTotal,
      alertMessage,
      milestone: '100',
    }
  }

  // 2. Cek Ambang Peringatan Dini jika diset > 0 dan < 100
  if (thresholdPct > 0 && thresholdPct < 100 && currentMonthTotal >= thresholdAmount) {
    const targetMilestone = `${txMonthPrefix}:${thresholdPct}`

    // Anti-spam throttle: jika sudah pernah diberi tahu untuk milestone ini atau sudah 100% di bulan ini, jangan spam
    if (lastMilestone === targetMilestone || lastMilestone === `${txMonthPrefix}:100`) {
      return {
        shouldAlert: false,
        monthlyLimitIdr: limit,
        currentMonthTotal,
      }
    }

    // Catat bahwa milestone ambang batas ini sudah di-alert
    await db
      .update(reminderSettings)
      .set({
        lastAlertMilestone: targetMilestone,
        updatedAt: new Date(),
      })
      .where(eq(reminderSettings.userId, userId))

    const alertMessage = formatReminderMessage(
      settings.customMessage,
      currentMonthTotal,
      limit,
      true,
      thresholdPct,
    )

    return {
      shouldAlert: true,
      monthlyLimitIdr: limit,
      currentMonthTotal,
      alertMessage,
      milestone: String(thresholdPct),
    }
  }

  // 3. Reset milestone jika pengeluaran turun di bawah ambang batas (misal karena transaksi dihapus/dikoreksi)
  // Dengan reset ini, saat pengeluaran naik kembali dan menyentuh ambang batas, notifikasi PASTI akan berbunyi lagi!
  if (lastMilestone && currentMonthTotal < thresholdAmount) {
    await db
      .update(reminderSettings)
      .set({
        lastAlertMilestone: null,
        updatedAt: new Date(),
      })
      .where(eq(reminderSettings.userId, userId))
  } else if (
    lastMilestone === `${txMonthPrefix}:100` &&
    currentMonthTotal < limit &&
    currentMonthTotal >= thresholdAmount
  ) {
    // Pengeluaran turun dari 100% ke rentang ambang batas
    await db
      .update(reminderSettings)
      .set({
        lastAlertMilestone: `${txMonthPrefix}:${thresholdPct}`,
        updatedAt: new Date(),
      })
      .where(eq(reminderSettings.userId, userId))
  }

  return {
    shouldAlert: false,
    monthlyLimitIdr: limit,
    currentMonthTotal,
  }
}
