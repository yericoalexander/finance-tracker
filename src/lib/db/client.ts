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

// Singleton pada globalThis agar koneksi DB tetap hangat (warm) dan tidak membuat koneksi baru
// baik di environment development (HMR) maupun serverless production (Vercel)
if (!globalThis._postgresClient) {
  globalThis._postgresClient = postgres(connectionString, {
    ssl: 'require',
    prepare: false, // Wajib untuk Supabase Transaction Pooler (port 6543)
    max: 5, // Izinkan hingga 5 koneksi konkuren agar query paralel dashboard tidak antre
    idle_timeout: 20,
    connect_timeout: 10,
  })
}

export const db = drizzle(globalThis._postgresClient, { schema })
