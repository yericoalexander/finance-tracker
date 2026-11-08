import { createHash } from 'crypto'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

import { formatRupiah } from '@/lib/ai/currency'
import { defaultExtractionProvider } from '@/lib/ai/gemini'
import { db } from '@/lib/db/client'
import { captures, devices, googleTokens, users } from '@/lib/db/schema'
import { GoogleApiError } from '@/lib/google/sheets'
import {
  evaluateBudgetReminder,
  type BudgetReminderEvaluation,
} from '@/features/dashboard/reminder-evaluator'
import { sendPushNotificationToUser } from '@/lib/push/send-push'
import { validateImageBuffer } from '@/lib/security/magic-bytes'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { authenticateDevice } from '@/lib/security/device-auth'
import { syncCaptureToGoogleSheets } from '@/lib/google/sync-helper'
import { applyTransactionToWallets } from '@/features/wallets/wallet-sync'

// ── Handler POST /api/capture ────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // 1. Autentikasi token perangkat
  const authResult = await authenticateDevice(request.headers.get('Authorization'))
  if (!authResult.ok) {
    return NextResponse.json({ status: 'failed', message: authResult.error }, { status: 401 })
  }

  const device = authResult.device

  // 2. Rate limit: 20 request / menit per perangkat
  const rateLimit = checkRateLimit(`device_${device.id}`, 20, 60 * 1000)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        status: 'failed',
        message: `Terlalu banyak permintaan. Tunggu ${rateLimit.retryAfterSeconds} detik.`,
      },
      { status: 429 },
    )
  }

  // Update last seen perangkat di background (tanpa await agar tidak memperlambat)
  void db
    .update(devices)
    .set({ lastSeenAt: new Date() })
    .where(eq(devices.id, device.id))
    .catch(() => {})

  // 3. Validasi multipart & file gambar
  let imageBuffer: Buffer | null = null
  const contentType = request.headers.get('content-type') ?? ''

  if (contentType.startsWith('image/')) {
    imageBuffer = Buffer.from(await request.arrayBuffer())
  } else {
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json(
        { status: 'failed', message: 'Format request harus berupa form-data' },
        { status: 400 },
      )
    }

    let file = formData.get('image')
    if (!file) {
      file =
        formData.get('file') ??
        formData.get('File') ??
        formData.get('Image') ??
        formData.get('screenshot') ??
        formData.get('Screenshot') ??
        formData.get('photo') ??
        formData.get('Photo') ??
        formData.get('gambar')

      if (!file) {
        for (const val of formData.values()) {
          if (val instanceof Blob && val.size > 0) {
            file = val
            break
          }
          if (typeof val === 'string' && val.length > 50) {
            file = val
            break
          }
        }
      }
    }

    if (
      !file ||
      (file instanceof Blob && file.size === 0) ||
      (typeof file === 'string' && file.trim() === '')
    ) {
      return NextResponse.json(
        {
          status: 'failed',
          message:
            'Tangkapan layar kosong. Pastikan memilih "Selalu Izinkan" saat iPhone meminta izin tangkapan layar, lalu coba lagi.',
        },
        { status: 400 },
      )
    }

    if (file instanceof Blob) {
      imageBuffer = Buffer.from(await file.arrayBuffer())
    } else if (typeof file === 'string') {
      const base64Data = file.replace(/^data:image\/[a-z]+;base64,/, '')
      const decoded = Buffer.from(base64Data, 'base64')
      const check = validateImageBuffer(decoded)
      if (check.valid) {
        imageBuffer = decoded
      } else {
        return NextResponse.json(
          {
            status: 'failed',
            message:
              'Field image di Shortcuts terkirim sebagai teks. Hapus field image di Shortcuts, tambah baru dengan tipe File (bukan Text), lalu pilih variabel Screenshot.',
          },
          { status: 400 },
        )
      }
    }
  }

  if (!imageBuffer) {
    return NextResponse.json(
      { status: 'failed', message: 'File gambar tidak dapat dibaca' },
      { status: 400 },
    )
  }

  const validation = validateImageBuffer(imageBuffer)
  if (!validation.valid || !validation.mimeType) {
    return NextResponse.json(
      { status: 'failed', message: validation.error ?? 'Format gambar tidak valid' },
      { status: 400 },
    )
  }

  // 4. Deteksi duplikat via SHA-256 gambar (cek instan sebelum AI untuk hemat kuota & waktu)
  const imageHash = createHash('sha256').update(imageBuffer).digest('hex')
  const existing = await db.query.captures.findFirst({
    where: and(eq(captures.userId, device.userId), eq(captures.imageHash, imageHash)),
  })

  if (existing) {
    return NextResponse.json({
      status: 'duplicate',
      merchant: existing.merchant ?? undefined,
      amount: existing.amountIdr ? formatRupiah(existing.amountIdr) : undefined,
      message: 'Transaksi ini sudah pernah dicatat sebelumnya',
    })
  }

  // 5. Ekstraksi model AI secara paralel dengan pre-load data Google Sheets
  const [extractionResult, authData] = await Promise.all([
    Promise.resolve(defaultExtractionProvider.extractReceipt(imageBuffer, validation.mimeType))
      .then((val) => ({ ok: true as const, value: val }))
      .catch((err) => ({ ok: false as const, error: err })),
    Promise.all([
      db.query.users.findFirst({
        where: eq(users.id, device.userId),
        columns: { sheetId: true },
      }),
      db.query.googleTokens.findFirst({
        where: eq(googleTokens.userId, device.userId),
      }),
    ]),
  ])

  if (!extractionResult.ok) {
    const errorMsg =
      extractionResult.error instanceof Error
        ? extractionResult.error.message
        : String(extractionResult.error)
    console.error('[Capture API] Ekstraksi struk gagal:', errorMsg)
    await db.insert(captures).values({
      userId: device.userId,
      deviceId: device.id,
      imageHash,
      status: 'failed',
      errorCode: 'EXTRACTION_FAILED',
    })
    return NextResponse.json({
      status: 'failed',
      message:
        errorMsg.includes('429') || errorMsg.includes('quota')
          ? 'Layanan AI sedang padat. Silakan coba kembali sesaat lagi.'
          : 'Gagal mengekstrak struk: informasi transaksi tidak terbaca',
    })
  }

  const extraction = extractionResult.value

  // Tolak notifikasi promo atau gambar tanpa nominal pembayaran nyata (Rp 0)
  if (!extraction.amountIdr || extraction.amountIdr <= 0) {
    return NextResponse.json(
      {
        status: 'failed',
        message:
          'Notifikasi promo atau bukan pembayaran valid diabaikan (nominal Rp 0). Transaksi tidak dicatat.',
      },
      { status: 400 },
    )
  }

  const [preloadedUser, preloadedToken] = authData
  const preloadedAuth = {
    user: preloadedUser,
    tokenRecord: preloadedToken,
  }

  // 6. Simpan transaksi langsung dengan status 'ok' dan tulis ke Google Sheets
  const formattedAmount = formatRupiah(extraction.amountIdr)

  // Simpan record capture status ok — semua pembayaran otomatis masuk pengeluaran (expense)
  const [newCapture] = await db
    .insert(captures)
    .values({
      userId: device.userId,
      deviceId: device.id,
      imageHash,
      status: 'ok',
      confidence: extraction.confidence,
      merchant: extraction.merchant,
      amountIdr: extraction.amountIdr,
      category:
        extraction.category === 'Transfer Antar Bank' ? 'Lainnya' : extraction.category,
      txDate: extraction.date,
      txType: 'expense',
    })
    .returning()

  if (!newCapture) {
    return NextResponse.json({ status: 'failed', message: 'Gagal menyimpan transaksi ke database' })
  }

  // Tulis ke Google Sheets
  try {
    await syncCaptureToGoogleSheets(device.userId, newCapture.id, extraction, 'iPhone', preloadedAuth)
    await db
      .update(captures)
      .set({ sheetRowId: newCapture.id })
      .where(eq(captures.id, newCapture.id))

    revalidatePath('/dashboard')

    // Sinkronisasi mutasi ke sistem dompet / saldo kartu pengguna (mengurangi saldo bank asal)
    const walletMutation = await applyTransactionToWallets(device.userId, {
      amountIdr: extraction.amountIdr,
      category: extraction.category === 'Transfer Antar Bank' ? 'Lainnya' : extraction.category,
      paymentMethod: extraction.paymentMethod,
      merchant: extraction.merchant,
      sourceBank: extraction.sourceBank,
      destinationBank: extraction.destinationBank,
      isTransfer: false,
      txType: 'expense',
    }).catch((err) => {
      console.error('[Capture API] Gagal sinkronisasi dompet:', err)
      return null
    })

    // Evaluasi pengingat batas pengeluaran bulanan pengguna
    const txMonthPrefix = extraction.date?.slice(0, 7) || new Date().toISOString().slice(0, 7)
    const reminderEval: BudgetReminderEvaluation = await evaluateBudgetReminder(
      device.userId,
      txMonthPrefix,
    ).catch((): BudgetReminderEvaluation => ({ shouldAlert: false }))

    let responseMessage = `Tercatat: ${formattedAmount} di ${extraction.merchant}`
    if (walletMutation?.applied && walletMutation.summaryMessage) {
      responseMessage = `Tercatat: ${formattedAmount} (${walletMutation.summaryMessage})`
    }
    if (reminderEval.alertMessage) {
      responseMessage = `${reminderEval.alertMessage}\n(${responseMessage})`
    }

    if (reminderEval.shouldAlert && reminderEval.alertMessage) {
      const pushTitle =
        reminderEval.milestone === '100'
          ? '🚨 Batas Anggaran Terlampaui!'
          : `⚠️ Peringatan: Pengeluaran Mencapai ${reminderEval.milestone}%!`

      // Kirim Web Push langsung dari Finance Tracker ke layar HP pengguna
      sendPushNotificationToUser(device.userId, {
        title: pushTitle,
        body: reminderEval.alertMessage,
        url: '/dashboard',
        tag: `budget-alert-${reminderEval.milestone}`,
      }).catch(() => null)
    }

    return NextResponse.json({
      status: 'ok',
      merchant: extraction.merchant,
      amount: formattedAmount,
      message: responseMessage,
      budgetAlert: reminderEval.alertMessage
        ? {
            exceeded: true,
            currentTotal: reminderEval.currentMonthTotal,
            limit: reminderEval.monthlyLimitIdr,
            alertMessage: reminderEval.alertMessage,
          }
        : undefined,
    })
  } catch (err) {
    const isGoogleAuthError =
      (err instanceof GoogleApiError && (err.code === 401 || err.code === 403)) ||
      (err instanceof Error && err.message === 'GOOGLE_AUTH_MISSING')

    await db
      .update(captures)
      .set({
        status: 'failed',
        errorCode: isGoogleAuthError ? 'GOOGLE_AUTH_EXPIRED' : 'SHEETS_SYNC_ERROR',
      })
      .where(eq(captures.id, newCapture.id))

    revalidatePath('/dashboard')

    if (isGoogleAuthError) {
      return NextResponse.json({
        status: 'failed',
        message: 'Akses Google perlu diperbarui, masuk ulang di aplikasi',
      })
    }

    return NextResponse.json({
      status: 'failed',
      message: 'Gagal menulis ke Google Sheets. Coba lagi nanti.',
    })
  }
}
