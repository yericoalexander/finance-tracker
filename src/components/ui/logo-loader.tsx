import Image from 'next/image'

interface LogoLoaderProps {
  label?: string
  fullscreen?: boolean
}

export function LogoLoader({ label = 'Memuat...', fullscreen = true }: LogoLoaderProps) {
  const content = (
    <div
      role="status"
      aria-live="polite"
      aria-label="Memuat aplikasi Finance Tracker"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-6)',
      }}
    >
      {/* Double-bezel squircle container with breathing animation */}
      <div
        className="splash-ambient-wrap"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Ambient glow behind logo */}
        <div
          className="splash-ambient-glow"
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-accent)',
            filter: 'blur(24px)',
            opacity: 0.12,
            pointerEvents: 'none',
          }}
        />

        {/* Outer shell (double-bezel pattern) */}
        <div
          className="splash-logo-pulse"
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '24px',
            padding: '6px',
            backgroundColor: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Inner core housing the crisp icon */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '18px',
              overflow: 'hidden',
              backgroundColor: '#0c1017',
              boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.2)',
              position: 'relative',
            }}
          >
            <Image
              src="/icons/apple-touch-icon-v2.png"
              alt="Logo Finance Tracker"
              width={72}
              height={72}
              style={{
                display: 'block',
              }}
            />
          </div>
        </div>
      </div>

      {/* Brand typographic identity */}
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
            color: 'var(--color-text)',
          }}
        >
          Finance Tracker
        </span>

        {/* Linear/Apple style micro-progress bar */}
        <div
          className="splash-progress-track"
          aria-hidden="true"
          style={{
            marginTop: '4px',
            width: '120px',
            height: '3px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-border)',
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
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-accent)',
            }}
          />
        </div>

        {/* Minimalist Indonesian status microcopy */}
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
            fontWeight: 500,
            letterSpacing: '0.02em',
            marginTop: '2px',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  )

  if (!fullscreen) {
    return content
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      {content}
    </div>
  )
}
