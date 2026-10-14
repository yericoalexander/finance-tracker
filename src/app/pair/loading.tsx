export default function PairLoading() {
  return (
    <main
      style={{
        minHeight: '100svh',
        backgroundColor: 'var(--color-bg)',
        padding: 'var(--space-6)',
        paddingTop: 'calc(var(--space-6) + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(var(--space-6) + env(safe-area-inset-bottom, 0px))',
        maxWidth: '430px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}
      aria-busy="true"
      aria-label="Memuat pengaturan perangkat..."
    >
      {/* Header Skeleton */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-border)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div
              style={{
                width: '160px',
                height: '20px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-border)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
            <div
              style={{
                width: '120px',
                height: '14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-border-subtle)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          </div>
        </div>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-border-subtle)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      </header>

      {/* Direct Setup Card Skeleton */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        <div
          style={{
            width: '180px',
            height: '18px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-border)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            width: '100%',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-border-subtle)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            width: '100%',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-accent)',
            opacity: 0.15,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      </div>

      {/* Guide Card Skeleton */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        <div
          style={{
            width: '140px',
            height: '16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-border)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            style={{
              height: '56px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        ))}
      </div>
    </main>
  )
}
