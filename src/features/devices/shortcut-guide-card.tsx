'use client'

import { ChevronDown, ChevronUp, ExternalLink, Layers, Sparkles } from 'lucide-react'
import { useState } from 'react'

export function ShortcutGuideCard() {
  const [showDetailRecipe, setShowDetailRecipe] = useState(false)

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.86rem', color: 'var(--color-text)' }}>
              Tambahkan Pintasan ke iPhone
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              Ketuk tombol di bawah untuk langsung membuka sheet <strong>&quot;Tambahkan Pintasan&quot;</strong> di iPhone Anda:
            </p>
            <a
              href="https://www.icloud.com/shortcuts/829aa46d8e254e1683b528945e1749c9"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accent-text)',
                fontSize: '0.82rem',
                fontWeight: 600,
                textDecoration: 'none',
                minHeight: '44px',
                marginTop: '4px',
              }}
            >
              <span>Tambahkan Pintasan &quot;Finance Tracker&quot;</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Step 2: Hubungkan 1-Klik */}
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
              Ketuk Tombol Hubungkan di Atas
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              Tekan tombol hijau di atas. Pilih <strong>Selalu Izinkan</strong> saat iOS meminta izin
              koneksi server.
            </p>
          </div>
        </div>

        {/* Step 3: Aktifkan Back Tap */}
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
              Pasang Ketuk Belakang (Back Tap)
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              Buka <strong>Pengaturan iPhone</strong> → <strong>Aksesibilitas</strong> →{' '}
              <strong>Sentuh</strong> → <strong>Ketuk Bagian Belakang</strong> → Pilih{' '}
              <strong>Catat Pengeluaran</strong> pada Ketuk Dua Kali.
            </p>
          </div>
        </div>
      </div>

      {/* Accordion Alur Lengkap Pintasan */}
      <div
        style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: 'var(--space-3)',
        }}
      >
        <button
          type="button"
          onClick={() => setShowDetailRecipe(!showDetailRecipe)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--color-text)',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 'var(--space-1) 0',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Layers size={16} style={{ color: 'var(--color-accent)' }} />
            <span>Lihat Struktur Aksi Pintasan iOS</span>
          </span>
          {showDetailRecipe ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showDetailRecipe && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              marginTop: 'var(--space-3)',
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontSize: '0.78rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
            }}
          >
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>
              Alur Pintasan &quot;Catat Pengeluaran&quot;:
            </p>
            <ol style={{ margin: 0, paddingLeft: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>
                <strong>Ambil Tangkapan Layar (Take Screenshot)</strong>
              </li>
              <li>
                <strong>Dapatkan Isi URL (Get Contents of URL)</strong>:
                <br />• URL: <code>{typeof window !== 'undefined' ? window.location.origin : ''}/api/capture</code>
                <br />• Metode: <code>POST</code>
                <br />• Tajuk (Header): <code>Authorization: Bearer [Token Perangkat]</code>
                <br />• Isi Permintaan (Body): <code>Form</code> dengan kunci <code>image</code> bertipe File (isi dengan Screenshot).
              </li>
              <li>
                <strong>Dapatkan Kamus dari Hasil URL</strong>
              </li>
              <li>
                <strong>Tampilkan Pemberitahuan</strong>: Ambil teks pesan (<code>message</code>) dari hasil URL.
              </li>
            </ol>
            <p style={{ margin: 0, marginTop: '4px', fontSize: '0.74rem' }}>
              💡 Pintasan akan secara otomatis membaca struk atau notifikasi bank dari screenshot dan
              menuliskannya langsung ke spreadsheet pribadi Anda.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
