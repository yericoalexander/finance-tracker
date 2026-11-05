import { createHash } from 'crypto'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { devices } from '@/lib/db/schema'

export async function authenticateDevice(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { ok: false, error: 'Token perangkat tidak ditemukan' } as const
  }

  let token = authHeader.slice(7).trim()
  if (!token) {
    return { ok: false, error: 'Token perangkat kosong' } as const
  }

  // Handle possible JSON-wrapped token string from iOS Shortcuts setup
  if (token.startsWith('{') && token.endsWith('}')) {
    try {
      const parsed = JSON.parse(token) as Record<string, unknown>
      if (typeof parsed.token === 'string') {
        token = parsed.token.trim()
      } else if (typeof parsed.deviceToken === 'string') {
        token = parsed.deviceToken.trim()
      }
    } catch {
      // Ignore parse failure, proceed with raw string
    }
  }

  // Clean unintended wrapping quotes
  token = token.replace(/^["']|["']$/g, '').trim()

  const tokenHash = createHash('sha256').update(token).digest('hex')
  const device = await db.query.devices.findFirst({
    where: eq(devices.tokenHash, tokenHash),
  })

  if (!device || device.revokedAt) {
    return { ok: false, error: 'Perangkat tidak terdaftar atau akses telah dicabut' } as const
  }

  return { ok: true, device } as const
}

