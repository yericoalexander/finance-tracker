import { eq } from 'drizzle-orm'
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

import { authConfig } from '@/features/auth/auth.config'
import { encrypt } from '@/lib/crypto'
import { db } from '@/lib/db/client'
import { googleTokens, users } from '@/lib/db/schema'
import { env } from '@/lib/env'
import { GoogleApiError, ensureSpreadsheet } from '@/lib/google/sheets'

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope:
            'openid email profile https://www.googleapis.com/auth/drive.file',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    ...authConfig.callbacks,

    async signIn({ account, profile }) {
      if (!account || !profile?.sub || !profile.email) return false

      const refreshToken = account.refresh_token
      if (!refreshToken) {
        console.warn('Google tidak mengirim refresh token — pastikan prompt=consent')
        return false
      }

      try {
        const [user] = await db
          .insert(users)
          .values({
            email: profile.email,
            googleSub: profile.sub,
          })
          .onConflictDoUpdate({
            target: users.googleSub,
            set: { email: profile.email },
          })
          .returning()

        if (!user) throw new Error('Gagal menyimpan user ke database')

        const encrypted = encrypt(refreshToken)
        await db
          .insert(googleTokens)
          .values({
            userId: user.id,
            refreshTokenEncrypted: encrypted.ciphertext,
            iv: encrypted.iv,
            authTag: encrypted.authTag,
          })
          .onConflictDoUpdate({
            target: googleTokens.userId,
            set: {
              refreshTokenEncrypted: encrypted.ciphertext,
              iv: encrypted.iv,
              authTag: encrypted.authTag,
              updatedAt: new Date(),
            },
          })

        try {
          const sheetId = await ensureSpreadsheet(refreshToken, user.sheetId ?? null)
          if (sheetId !== user.sheetId) {
            await db
              .update(users)
              .set({ sheetId })
              .where(eq(users.id, user.id))
          }
        } catch (sheetErr) {
          if (sheetErr instanceof GoogleApiError) {
            console.warn(
              `Pembuatan spreadsheet gagal pada langkah "${sheetErr.step ?? 'proses'}": HTTP ${sheetErr.code}, kode: ${sheetErr.googleCode}, aksi: ${sheetErr.action} — ${sheetErr.message}`,
            )
          } else {
            console.warn(
              'Pembuatan spreadsheet gagal (tidak terduga):',
              sheetErr instanceof Error ? sheetErr.message : String(sheetErr),
            )
          }
        }

        return true
      } catch (err) {
        console.error('signIn callback error:', err instanceof Error ? err.message : String(err))
        return false
      }
    },

    async jwt({ token, profile }) {
      if (profile?.sub) {
        const user = await db.query.users.findFirst({
          where: eq(users.googleSub, profile.sub),
          columns: { id: true, sheetId: true },
        })
        if (user) {
          token['userId'] = user.id
          token['sheetId'] = user.sheetId
        }
      }
      return token
    },

    session({ session, token }) {
      session.user.id = token['userId'] as string
      session.user.sheetId = (token['sheetId'] as string | null) ?? null
      return session
    },
  },
})
