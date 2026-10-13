import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Smoke test: memastikan validasi env schema bekerja dengan benar
describe('env schema', () => {
  const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(32),
    NEXTAUTH_URL: z.string().url(),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    ENCRYPTION_KEY: z.string().length(64),
    GEMINI_API_KEY: z.string().min(1),
    GEMINI_MODEL: z.string().min(1).default('gemini-1.5-flash'),
  })

  it('menerima semua field valid', () => {
    const result = envSchema.safeParse({
      DATABASE_URL: 'postgresql://user:pass@host/db',
      NEXTAUTH_SECRET: 'a'.repeat(32),
      NEXTAUTH_URL: 'http://localhost:3000',
      GOOGLE_CLIENT_ID: 'client-id',
      GOOGLE_CLIENT_SECRET: 'client-secret',
      ENCRYPTION_KEY: 'a'.repeat(64),
      GEMINI_API_KEY: 'gemini-key-123',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.GEMINI_MODEL).toBe('gemini-1.5-flash')
    }
  })

  it('menolak ENCRYPTION_KEY yang kurang dari 64 karakter', () => {
    const result = envSchema.safeParse({
      DATABASE_URL: 'postgresql://user:pass@host/db',
      NEXTAUTH_SECRET: 'a'.repeat(32),
      NEXTAUTH_URL: 'http://localhost:3000',
      GOOGLE_CLIENT_ID: 'client-id',
      GOOGLE_CLIENT_SECRET: 'client-secret',
      ENCRYPTION_KEY: 'tooshort',
      GEMINI_API_KEY: 'gemini-key-123',
    })
    expect(result.success).toBe(false)
  })

  it('menolak jika GEMINI_API_KEY kosong', () => {
    const result = envSchema.safeParse({
      DATABASE_URL: 'postgresql://user:pass@host/db',
      NEXTAUTH_SECRET: 'a'.repeat(32),
      NEXTAUTH_URL: 'http://localhost:3000',
      GOOGLE_CLIENT_ID: 'client-id',
      GOOGLE_CLIENT_SECRET: 'client-secret',
      ENCRYPTION_KEY: 'a'.repeat(64),
      GEMINI_API_KEY: '',
    })
    expect(result.success).toBe(false)
  })
})
