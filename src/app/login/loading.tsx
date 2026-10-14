export default function LoginLoading() {
  return (
    <main
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
        backgroundColor: 'var(--color-bg)',
      }}
      aria-busy="true"
      aria-label="Memuat halaman masuk..."
    >
      <div
        style={{
          width: '100%',
          maxWidth: '375px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-6)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--color-border)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            width: '180px',
            height: '24px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-border)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            width: '100%',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-border-subtle)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      </div>
    </main>
  )
}
