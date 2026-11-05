import { createHash } from 'crypto'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { after, type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { formatRupiah } from '@/lib/ai/currency'
import { parseTransactionNotification } from '@/lib/ai/text-parser'
import { db } from '@/lib/db/client'
import { captures, devices } from '@/lib/db/schema'
import { syncCaptureToGoogleSheets } from '@/lib/google/sync-helper'
import {
  evaluateBudgetReminder,
  type BudgetReminderEvaluation,
} from '@/features/dashboard/reminder-evaluator'
import { sendPushNotificationToUser } from '@/lib/push/send-push'
import { authenticateDevice } from '@/lib/security/device-auth'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { applyTransactionToWallets } from '@/features/wallets/wallet-sync'

const CaptureTextRequestSchema = z.object({
  text: z.string().min(5, 'Teks notifikasi minimal 5 karakter').max(2000),
  source: z.string().optional().default('notification'),
})

export async function POST(request: NextRequest) {
  // 1. Autentikasi token perangkat iOS
  const authResult = await authenticateDevice(request.headers.get('authorization'))
  if (!authResult.ok) {
    return NextResponse.json({ status: 'failed', message: authResult.error }, { status: 401 })
  }
  const { device } = authResult

  // 2. Proteksi rate limit per user
  const rateLimit = checkRateLimit(`device_${device.id}`, 20, 60 * 1000)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        status: 'failed',
        message: `Terlalu banyak permintaan. Coba lagi dalam ${rateLimit.retryAfterSeconds} detik.`,
      },
      {
        status: 429,
        headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
      },
    )
  }

  // 3. Baca dan validasi payload JSON
  let bodyJson: unknown
  try {
    bodyJson = await request.json()
  } catch {
    return NextResponse.json(
      { status: 'failed', message: 'Payload harus berupa JSON valid' },
      { status: 400 },
    )
  }

  const parsedBody = CaptureTextRequestSchema.safeParse(bodyJson)
  if (!parsedBody.success) {
    return NextResponse.json(
      {
        status: 'failed',
        message: parsedBody.error.issues[0]?.message || 'Data teks tidak valid',
      },
      { status: 400 },
    )
  }

  const { text, source } = parsedBody.data

  // 4. Deteksi duplikat notifikasi via SHA-256 teks (mencegah double-capture jika notif terkirim 2x)
  const textHash = createHash('sha256')
    .update(`text:${device.userId}:${text.trim().toLowerCase()}`)
    .digest('hex')

  const existing = await db.query.captures.findFirst({
    where: and(eq(captures.userId, device.userId), eq(captures.imageHash, textHash)),
  })

  if (existing) {
    return NextResponse.json({
      status: 'duplicate',
      merchant: existing.merchant ?? undefined,
      amount: existing.amountIdr ? formatRupiah(existing.amountIdr) : undefined,
      message: 'Notifikasi ini sudah pernah dicatat sebelumnya.',
    })
  }

  // 5. Ekstraksi data transaksi (Regex Tier 1 < 1ms, fallback ke Gemini Flash AI)
  let parsed
  try {
    parsed = await parseTransactionNotification(text)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Format notifikasi tidak dapat dibaca'
    return NextResponse.json({ status: 'failed', message: errorMsg }, { status: 422 })
  }

  // 6. Simpan transaksi ke database lokal
  const [newCapture] = await db
    .insert(captures)
    .values({
      userId: device.userId,
      deviceId: device.id,
      imageHash: textHash,
      status: 'ok',
      confidence: parsed.confidence,
      merchant: parsed.merchant,
      amountIdr: parsed.amountIdr,
      category: parsed.category,
      txDate: parsed.date,
      txType: parsed.txType,
    })
    .returning()

  if (!newCapture) {
    return NextResponse.json(
      { status: 'failed', message: 'Gagal menyimpan transaksi ke database' },
      { status: 500 },
    )
  }

  // Sinkronisasi mutasi ke sistem dompet / saldo kartu pengguna
  const walletMutation = await applyTransactionToWallets(device.userId, {
    amountIdr: parsed.amountIdr,
    category: parsed.category,
    paymentMethod: parsed.paymentMethod,
    merchant: parsed.merchant,
    sourceBank: parsed.sourceBank,
    destinationBank: parsed.destinationBank,
    isTransfer: parsed.isTransfer,
    txType: parsed.txType,
  }).catch((err) => {
    console.error('[Capture Text API] Gagal sinkronisasi dompet:', err)
    return null
  })

  // Perbarui waktu aktif terakhir perangkat
  await db
    .update(devices)
    .set({ lastSeenAt: new Date() })
    .where(eq(devices.id, device.id))
    .catch(() => {})

  // 7. Non-Blocking Background Tasks (Google Sheets Sync & Budget Alert)
  after(async () => {
    try {
      await syncCaptureToGoogleSheets(
        device.userId,
        newCapture.id,
        {
          date: parsed.date,
          time: parsed.time,
          merchant: parsed.merchant,
          category: parsed.category,
          amountIdr: parsed.amountIdr,
          paymentMethod: parsed.paymentMethod,
          note: parsed.note,
          confidence: parsed.confidence,
        },
        source === 'sms' ? 'SMS Notif' : 'Notifikasi iOS',
      )

      await db
        .update(captures)
        .set({ sheetRowId: newCapture.id })
        .where(eq(captures.id, newCapture.id))

      revalidatePath('/dashboard')
      revalidatePath('/wallets')

      // Evaluasi pengingat budget bulanan
      const txMonthPrefix = parsed.date?.slice(0, 7) || new Date().toISOString().slice(0, 7)
      const reminderEval: BudgetReminderEvaluation = await evaluateBudgetReminder(
        device.userId,
        txMonthPrefix,
      ).catch((): BudgetReminderEvaluation => ({
        shouldAlert: false,
      }))

      if (reminderEval.shouldAlert && reminderEval.alertMessage) {
        await sendPushNotificationToUser(device.userId, {
          title: '⚠️ Peringatan Anggaran Bulanan',
          body: reminderEval.alertMessage,
          url: '/dashboard',
        }).catch(() => {})
      }
    } catch (err) {
      console.error('[Capture Text Background Sync Error]:', err)
    }
  })

  // 8. Langsung balas sukses ke iPhone (< 100ms)
  const formattedAmount = formatRupiah(parsed.amountIdr)
  const typeLabel = parsed.txType === 'income' ? 'Uang Masuk' : 'Uang Keluar'

  let responseMessage = `Tercatat ${typeLabel}: ${formattedAmount} di ${parsed.merchant}`
  if (parsed.isTransfer && walletMutation?.summaryMessage) {
    responseMessage = `Tercatat Transfer: ${formattedAmount} (${walletMutation.summaryMessage})`
  } else if (walletMutation?.applied && walletMutation.summaryMessage) {
    responseMessage = `Tercatat ${typeLabel}: ${formattedAmount} (${walletMutation.summaryMessage})`
  }

  return NextResponse.json({
    status: 'ok',
    merchant: parsed.merchant,
    amount: formattedAmount,
    amountIdr: parsed.amountIdr,
    category: parsed.category,
    txType: parsed.txType,
    paymentMethod: parsed.paymentMethod,
    walletMutation: walletMutation?.summaryMessage,
    message: responseMessage,
  })
}
