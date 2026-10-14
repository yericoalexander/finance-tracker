'use client'

import { Sparkles } from 'lucide-react'

export function ShortcutGuideCard() {

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        padding: 'var(--space-5)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <Sparkles size={20} style={{ color: 'var(--color-accent)' }} />
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            margin: 0,
            color: 'var(--color-text)',
          }}
        >
          Panduan Pintasan & Back Tap
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {/* Step 1: Pasang Pintasan */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-surface-raised)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-text)',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            1
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.86rem', color: 'var(--color-text)' }}>
              Tekan Tombol &quot;Pasang &amp; Hubungkan Pintasan&quot; di Atas
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              Cukup ketuk tombol hitam di atas sekali saja. iPhone Anda otomatis membuka layar resmi{' '}
              <strong>&quot;Tambahkan Pintasan&quot;</strong>.
            </p>
          </div>
        </div>

        {/* Step 2: Pastikan Token Pribadi */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-surface-raised)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-text)',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            2
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.86rem', color: 'var(--color-text)' }}>
              Pastikan Token Pribadi Anda Terpasang
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              Buka aplikasi <strong>Pintasan</strong> di iPhone → ketuk titik tiga <code>...</code> pada <strong>Finance Tracker</strong> → pada bagian Headers <em>Authorization</em>, pastikan terisi <strong>Token Pribadi</strong> Anda agar transaksi masuk ke Google Sheets Anda sendiri.
            </p>
          </div>
        </div>

        {/* Step 3: Selalu Izinkan */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-surface-raised)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-text)',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            3
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.86rem', color: 'var(--color-text)' }}>
              Pilih &quot;Selalu Izinkan&quot; (Always Allow)
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              Saat pertama kali pintasan dipakai di iPhone, iOS meminta izin jaringan: wajib pilih{' '}
              <strong>Selalu Izinkan</strong> agar pengiriman struk belanja tidak terblokir.
            </p>
          </div>
        </div>

        {/* Step 4: Aktifkan Back Tap */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-surface-raised)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-text)',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            4
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.86rem', color: 'var(--color-text)' }}>
              Pasang Ketuk Belakang (Back Tap)
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              Buka <strong>Pengaturan iPhone</strong> → <strong>Aksesibilitas</strong> →{' '}
              <strong>Sentuh</strong> → <strong>Ketuk Bagian Belakang</strong> → Pilih{' '}
              <strong>Finance Tracker</strong> pada Ketuk Dua Kali.
            </p>
          </div>
        </div>
      </div>

      {/* Catatan Sederhana Cara Pakai */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-3)',
          backgroundColor: 'var(--color-surface-raised)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          fontSize: '0.8rem',
          color: 'var(--color-text-muted)',
          lineHeight: 1.4,
        }}
      >
        <span>💡</span>
        <span>
          <strong>Selesai!</strong> Kapan pun Anda melihat struk atau bukti transfer di iPhone, cukup ketuk 2x punggung iPhone Anda untuk mencatat pengeluaran otomatis ke Google Sheets.
        </span>
      </div>
    </div>
  )
}
