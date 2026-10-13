import type { DefaultSession } from 'next-auth'

// Extend session user type dengan field tambahan dari DB
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      sheetId: string | null
    } & DefaultSession['user']
  }
}
