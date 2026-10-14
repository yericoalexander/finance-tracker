import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'

import * as schema from './schema'

declare global {
  var _postgresClient: postgres.Sql | undefined
}

const rawUrl = process.env['DATABASE_URL'] ?? ''
// Otomatis arahkan pooler Supabase ke port 6543 (Transaction Mode)
// agar tidak melebihi batas 15 client di Session Mode (port 5432)
const connectionString = rawUrl.includes('pooler.supabase.com:5432')
  ? rawUrl.replace(':5432', ':6543')
  : rawUrl

// Singleton pada globalThis agar Hot Module Reloading di Next.js tidak membuat koneksi baru berulang kali
const client =
  globalThis._postgresClient ??
  postgres(connectionString, {
    ssl: 'require',
    prepare: false, // Wajib untuk Supabase Transaction Pooler (port 6543)
    max: 1, // 1 koneksi dengan native pipelining — mencegah burst TLS handshake & error limit koneksi Supabase
    idle_timeout: 20,
    connect_timeout: 10,
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis._postgresClient = client
}

export const db = drizzle(client, { schema })
