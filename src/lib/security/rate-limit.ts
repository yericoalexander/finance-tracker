interface RateLimitRecord {
  timestamps: number[]
}

const store = new Map<string, RateLimitRecord>()

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

/**
 * In-memory sliding window rate limiter.
 * Cocok untuk rate limiting per-IP atau per-device token.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number = 60 * 1000,
): RateLimitResult {
  const now = Date.now()
  const windowStart = now - windowMs

  let record = store.get(key)
  if (!record) {
    record = { timestamps: [] }
    store.set(key, record)
  }

  // Bersihkan timestamp yang sudah di luar jendela waktu
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart)

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0] ?? now
    const retryAfterMs = oldest + windowMs - now
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    }
  }

  record.timestamps.push(now)
  return {
    allowed: true,
    remaining: maxRequests - record.timestamps.length,
    retryAfterSeconds: 0,
  }
}
