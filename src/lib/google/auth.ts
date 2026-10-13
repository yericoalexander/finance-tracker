import { google } from 'googleapis'

import { env } from '@/lib/env'

/**
 * Buat OAuth2Client yang sudah terkonfigurasi dengan refresh token.
 * Gunakan ini untuk semua panggilan Google API per-user.
 */
export function buildOAuth2Client(refreshToken: string) {
  const client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${env.NEXTAUTH_URL}/api/auth/callback/google`,
  )
  client.setCredentials({ refresh_token: refreshToken })
  return client
}
