import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import Script from 'next/script'

import { AppSplashScreen } from '@/components/ui/splash-screen'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: {
    default: 'Finance Tracker',
    template: '%s · Finance Tracker',
  },
  description: 'Catat pengeluaran dari screenshot iPhone langsung ke Google Sheets milik kamu.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Finance',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon-v2.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  verification: {
    google: '3ZtWGsOhcmp8f5Ywc-jXL4blmVbiMY1_pGksc6tvck0',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f7f5' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0c0b' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-theme="light" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-v2.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon.png" />
        <meta name="google-site-verification" content="3ZtWGsOhcmp8f5Ywc-jXL4blmVbiMY1_pGksc6tvck0" />
      </head>
      <body className={`${plusJakarta.variable} antialiased`}>
        {/* Next.js official Script component with beforeInteractive strategy to prevent React 19 script tag warnings */}
        <Script
          id="theme-detector"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.setAttribute('data-theme','dark');}else{document.documentElement.setAttribute('data-theme','light');}}catch(e){}if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.getRegistrations().then(function(r){for(var s of r){s.unregister();}});},{once:true});}})();`,
          }}
        />

        {/* Instant zero-latency branded splash screen managed safely through React lifecycle */}
        <AppSplashScreen />
        {children}
      </body>
    </html>
  )
}
