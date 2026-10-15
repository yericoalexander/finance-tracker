import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'

import { SplashScreenCoordinator } from '@/components/ui/splash-screen'
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
    <html lang="id" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-v2.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon.png" />
        <link rel="preload" as="image" href="/icons/apple-touch-icon-v2.png" type="image/png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.setAttribute('data-theme','dark');}else{document.documentElement.setAttribute('data-theme','light');}}catch(e){}if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.getRegistrations().then(function(r){for(var s of r){s.unregister();}});},{once:true});}})();`,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              #app-splash {
                position: fixed;
                inset: 0;
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #f7f7f5;
                color: #111110;
              }
              html[data-theme='dark'] #app-splash {
                background-color: #0c0c0b;
                color: #ededec;
              }
            `,
          }}
        />
      </head>
      <body className={`${plusJakarta.variable} antialiased`}>
        {/* Instant zero-latency branded splash overlay for 0ms initial launch feedback */}
        <div id="app-splash" aria-hidden="true">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              padding: '1.5rem',
            }}
          >
            <div
              className="splash-ambient-wrap"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                className="splash-ambient-glow"
                style={{
                  position: 'absolute',
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  backgroundColor: 'currentColor',
                  filter: 'blur(24px)',
                  opacity: 0.12,
                  pointerEvents: 'none',
                }}
              />
              <div
                className="splash-logo-pulse"
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '24px',
                  padding: '6px',
                  backgroundColor: 'var(--color-surface-raised, rgba(128,128,128,0.08))',
                  border: '1px solid var(--color-border, rgba(128,128,128,0.18))',
                  boxShadow: '0 8px 24px -4px rgba(0,0,0,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    backgroundColor: '#0c1017',
                    boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <img
                    src="/icons/apple-touch-icon-v2.png"
                    alt="Finance Tracker"
                    width={72}
                    height={72}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-sans), system-ui, -apple-system, sans-serif',
                }}
              >
                Finance Tracker
              </span>
              <div
                className="splash-progress-track"
                style={{
                  marginTop: '4px',
                  width: '120px',
                  height: '3px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--color-border, rgba(128,128,128,0.2))',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  className="splash-progress-bar"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: '40%',
                    borderRadius: '9999px',
                    backgroundColor: 'currentColor',
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  opacity: 0.65,
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                  marginTop: '2px',
                  fontFamily: 'var(--font-sans), system-ui, -apple-system, sans-serif',
                }}
              >
                Memuat...
              </span>
            </div>
          </div>
        </div>

        <SplashScreenCoordinator />
        {children}
      </body>
    </html>
  )
}
