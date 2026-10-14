import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isProtected =
        nextUrl.pathname.startsWith('/dashboard') ||
        nextUrl.pathname.startsWith('/pair')
      const isAuthPath = nextUrl.pathname.startsWith('/login')

      if (nextUrl.pathname === '/') {
        return Response.redirect(new URL(isLoggedIn ? '/dashboard' : '/login', nextUrl))
      }

      if (isProtected && !isLoggedIn) {
        return false
      }

      if (isAuthPath && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }

      return true
    },
  },
  providers: [],
}
