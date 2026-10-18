import { createHash, randomBytes } from 'crypto'
import { and, eq, gt, isNull } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { db } from '@/lib/db/client'
import { devices, pairingCodes } from '@/lib/db/schema'
import { checkRateLimit } from '@/lib/security/rate-limit'

const PairRequestSchema = z.object({
  code: z.string().length(8, 'Kode pairing harus terdiri dari 8 karakter').toUpperCase(),
  label: z
    .string()
    .min(1, 'Nama perangkat tidak boleh kosong')
    .max(50, 'Nama perangkat maksimal 50 karakter')
    .trim(),
})

export async function POST(request: NextRequest) {
  // Ambil IP untuk rate limiting
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'

  // Batas 5 request / menit per IP
  const rateLimit = checkRateLimit(`pair_ip_${ip}`, 5, 60 * 1000)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: 'RATE_LIMITED',
        message: `Terlalu banyak percobaan. Coba lagi dalam ${rateLimit.retryAfterSeconds} detik.`,
      },
      { status: 429 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: 'BAD_REQUEST', message: 'Format JSON tidak valid' },
      { status: 400 },
    )
  }

  const parsed = PairRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: 'VALIDATION_ERROR',
        message: parsed.error.issues[0]?.message ?? 'Input tidak valid',
      },
      { status: 400 },
    )
  }

  const { code, label } = parsed.data
  const codeHash = createHash('sha256').update(code).digest('hex')
  const now = new Date()

  // Cari kode yang cocok, belum kedaluwarsa, dan belum digunakan
  const match = await db.query.pairingCodes.findFirst({
    where: and(
      eq(pairingCodes.codeHash, codeHash),
      gt(pairingCodes.expiresAt, now),
      isNull(pairingCodes.usedAt),
    ),
  })

  if (!match) {
    return NextResponse.json(
      {
        ok: false,
        error: 'INVALID_OR_EXPIRED_CODE',
        message: 'Kode pairing salah atau sudah kedaluwarsa.',
      },
      { status: 400 },
    )
  }

  // Tandai kode sudah dipakai
  await db.update(pairingCodes).set({ usedAt: now }).where(eq(pairingCodes.id, match.id))

  // Buat device token acak 32 byte (64 hex characters)
  const deviceToken = randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256').update(deviceToken).digest('hex')

  // Simpan hanya hash token ke tabel devices
  await db.insert(devices).values({
    userId: match.userId,
    tokenHash,
    label,
  })

  return NextResponse.json({
    ok: true,
    deviceToken,
    label,
    message: 'Perangkat berhasil dihubungkan. Simpan token ini pada Shortcut iOS.',
  })
}
