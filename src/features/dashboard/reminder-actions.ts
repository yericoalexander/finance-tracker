'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { auth } from '@/auth'
import { db } from '@/lib/db/client'
import { reminderSettings, type ReminderSetting } from '@/lib/db/schema'
import { sendPushNotificationToUser } from '@/lib/push/send-push'
import { evaluateBudgetReminder } from './reminder-evaluator'

const UpdateReminderSchema = z.object({
  monthlyLimitIdr: z
    .number()
    .int('Nominal harus berupa bilangan bulat')
    .min(10000, 'Batas pengeluaran minimal Rp 10.000')
    .max(1000000000, 'Batas pengeluaran maksimal Rp 1 Miliar')
    .nullable(),
  customMessage: z.string().max(150, 'Pesan pengingat maksimal 150 karakter').nullable().optional(),
  earlyWarningEnabled: z.boolean().optional(),
  warningThresholdPercent: z.number().int().min(0).max(100).default(90).optional(),
  isEnabled: z.boolean(),
})

export type UpdateReminderInput = z.infer<typeof UpdateReminderSchema>

export async function getReminderSettingsAction(): Promise<{
  ok: boolean
  data?: ReminderSetting | null
  error?: string
}> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'Sesi telah berakhir, silakan login kembali' }
  }

  try {
    const settings = await db.query.reminderSettings.findFirst({
      where: eq(reminderSettings.userId, session.user.id),
    })

    return { ok: true, data: settings ?? null }
  } catch (err) {
    console.error('[Reminder] Gagal mengambil pengaturan pengingat:', err)
    return { ok: false, error: 'Gagal memuat pengaturan pengingat' }
  }
}

export async function updateReminderSettingsAction(
  rawInput: unknown,
): Promise<{ ok: boolean; data?: ReminderSetting; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'Sesi telah berakhir, silakan login kembali' }
  }

  const parsed = UpdateReminderSchema.safeParse(rawInput)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Format input tidak valid',
    }
  }

  const userId = session.user.id
  const {
    monthlyLimitIdr,
    customMessage,
    earlyWarningEnabled,
    warningThresholdPercent,
    isEnabled,
  } = parsed.data
  const sanitizedMessage = customMessage?.trim() ? customMessage.trim() : null
  const finalThreshold = warningThresholdPercent ?? (earlyWarningEnabled === false ? 0 : 90)
  const isEarlyWarningActive = finalThreshold > 0 && finalThreshold < 100

  try {
    const [saved] = await db
      .insert(reminderSettings)
      .values({
        userId,
        monthlyLimitIdr,
        customMessage: sanitizedMessage,
        earlyWarningEnabled: isEarlyWarningActive,
        warningThresholdPercent: finalThreshold,
        isEnabled,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: reminderSettings.userId,
        set: {
          monthlyLimitIdr,
          customMessage: sanitizedMessage,
          earlyWarningEnabled: isEarlyWarningActive,
          warningThresholdPercent: finalThreshold,
          isEnabled,
          lastAlertMilestone: null,
          updatedAt: new Date(),
        },
      })
      .returning()

    // Evaluasi apakah dengan pengaturan limit/threshold baru ini pengeluaran saat ini langsung menyentuh batas
    if (isEnabled && monthlyLimitIdr) {
      const currentMonthPrefix = new Date().toISOString().slice(0, 7)
      const reminderEval = await evaluateBudgetReminder(userId, currentMonthPrefix).catch(
        () => null,
      )
      if (reminderEval?.shouldAlert && reminderEval.alertMessage) {
        const pushTitle =
          reminderEval.milestone === '100'
            ? '🚨 Batas Anggaran Terlampaui!'
            : `⚠️ Peringatan: Pengeluaran Mencapai ${reminderEval.milestone}%!`
        sendPushNotificationToUser(userId, {
          title: pushTitle,
          body: reminderEval.alertMessage,
          url: '/dashboard',
          tag: `budget-alert-${reminderEval.milestone}`,
        }).catch(() => null)
      }
    }

    revalidatePath('/dashboard')

    return { ok: true, data: saved }
  } catch (err) {
    console.error('[Reminder] Gagal menyimpan pengaturan pengingat:', err)
    return { ok: false, error: 'Gagal menyimpan pengaturan pengingat' }
  }
}
