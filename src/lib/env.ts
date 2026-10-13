import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL harus berupa URL yang valid'),

  // Auth.js
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET minimal 32 karakter'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL harus berupa URL yang valid'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID wajib diisi'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET wajib diisi'),

  // Encryption — 32-byte hex (64 karakter) untuk AES-256-GCM
  ENCRYPTION_KEY: z
    .string()
    .length(64, 'ENCRYPTION_KEY harus 64 karakter hex (32 byte)'),

  // Google Gemini AI
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY wajib diisi'),
  GEMINI_MODEL: z.string().min(1, 'GEMINI_MODEL wajib diisi').default('gemini-2.5-flash'),

  // Node environment
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  // Auth.js v5 — percaya pada proxy header X-Forwarded-Host di deploy
  AUTH_TRUST_HOST: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Konfigurasi env tidak valid:')
  console.error(parsed.error.flatten().fieldErrors)
  throw new Error('Konfigurasi env tidak valid. Lihat log di atas.')
}

export const env = parsed.data
