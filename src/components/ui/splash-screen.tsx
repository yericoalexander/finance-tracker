'use client'

import { useEffect, useState } from 'react'

const DISMISS_DELAY_MS = 200
const TRANSITION_DURATION_MS = 240

export function AppSplashScreen() {
  const [fading, setFading] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFading(true)
    }, DISMISS_DELAY_MS)

    const dismissTimer = setTimeout(() => {
      setDismissed(true)
    }, DISMISS_DELAY_MS + TRANSITION_DURATION_MS)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(dismissTimer)
    }
  }, [])

  if (dismissed) {
    return null
  }

  return (
    <div id="app-splash" className={fading ? 'app-splash-fade-out' : ''} aria-hidden="true">
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
  )
}

export { AppSplashScreen as SplashScreenCoordinator }
