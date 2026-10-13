import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'

import * as schema from './schema'

// Singleton — satu koneksi untuk seluruh lifetime proses Next.js
// Gunakan ?sslmode=require di DATABASE_URL untuk Supabase
const client = postgres(process.env['DATABASE_URL'] ?? '', {
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

export const db = drizzle(client, { schema })
