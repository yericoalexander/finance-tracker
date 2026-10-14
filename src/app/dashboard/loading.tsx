export default function DashboardLoading() {
  return (
    <main
      style={{
        minHeight: '100svh',
        backgroundColor: 'var(--color-bg)',
        paddingTop: 'calc(var(--space-5) + env(safe-area-inset-top))',
        paddingBottom: 'calc(var(--space-10) + env(safe-area-inset-bottom))',
        paddingLeft: 'var(--space-5)',
        paddingRight: 'var(--space-5)',
        maxWidth: '430px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
      }}
      aria-busy="true"
      aria-label="Memuat dashboard..."
    >
      {/* Header Skeleton */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 'var(--space-2)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div
            style={{
              width: '120px',
              height: '24px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-border)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: '80px',
              height: '14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-border-subtle)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-border-subtle)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-border)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        </div>
      </header>

      {/* Segmented Tab Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          backgroundColor: 'var(--color-surface)',
          padding: '4px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          gap: '4px',
          height: '48px',
        }}
      >
        <div
          style={{
            borderRadius: 'calc(var(--radius-xl) - 4px)',
            backgroundColor: 'var(--color-accent)',
            opacity: 0.15,
          }}
        />
        <div style={{ borderRadius: 'calc(var(--radius-xl) - 4px)' }} />
        <div style={{ borderRadius: 'calc(var(--radius-xl) - 4px)' }} />
      </div>

      {/* Sync Status Skeleton */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            width: '130px',
            height: '14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-border-subtle)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            width: '80px',
            height: '28px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-border-subtle)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      </div>

      {/* 2-Column Summary Cards Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            padding: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            minHeight: '110px',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-border-subtle)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: '70px',
              height: '12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-border-subtle)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: '110px',
              height: '20px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-border)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        </div>
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            padding: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            minHeight: '110px',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-border-subtle)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: '70px',
              height: '12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-border-subtle)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: '90px',
              height: '20px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-border)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      {/* Spreadsheet Link Card Skeleton */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-4)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          height: '68px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-border-subtle)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div
            style={{
              width: '100px',
              height: '14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-border)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: '140px',
              height: '11px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-border-subtle)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      {/* Categories Card Skeleton */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[0.6, 0.4, 0.25].map((w, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div
                  style={{
                    width: '80px',
                    height: '12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-border-subtle)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
                <div
                  style={{
                    width: '60px',
                    height: '12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-border-subtle)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
              </div>
              <div
                style={{
                  height: '6px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-border-subtle)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${w * 100}%`,
                    height: '100%',
                    backgroundColor: 'var(--color-accent)',
                    opacity: 0.2,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
