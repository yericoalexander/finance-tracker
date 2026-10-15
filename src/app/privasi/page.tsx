import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  Database,
  ExternalLink,
  Lock,
  Mail,
  Shield,
  Trash2,
} from 'lucide-react'

import { ThemeToggle } from '@/components/ui/theme-toggle'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description: 'Kebijakan privasi dan standar perlindungan data pengguna aplikasi Finance Tracker.',
}

export default function PrivacyPage() {
  return (
    <main
      style={{
        minHeight: '100svh',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)',
        padding: 'var(--space-4) var(--space-4) calc(var(--space-10) + env(safe-area-inset-bottom))',
      }}
    >
      <div
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
        }}
      >
        {/* Top Navbar */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 'var(--space-2)',
          }}
        >
          <Link
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              color: 'var(--color-text-muted)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              minHeight: '44px',
              padding: '0 var(--space-2)',
              borderRadius: 'var(--radius-md)',
              transition: 'color var(--duration-fast)',
            }}
          >
            <ArrowLeft size={18} />
            <span>Kembali</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Finance Tracker
            </span>
            <ThemeToggle />
          </div>
        </header>

        {/* Tab Navigasi Halaman Legal */}
        <nav
          aria-label="Dokumen Legal"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-1)',
            padding: '4px',
            backgroundColor: 'var(--color-surface-raised)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-2) var(--space-3)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontWeight: 600,
              fontSize: '0.875rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)',
              minHeight: '40px',
            }}
          >
            Kebijakan Privasi
          </span>
          <Link
            href="/ketentuan"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-2) var(--space-3)',
              color: 'var(--color-text-muted)',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              borderRadius: 'var(--radius-md)',
              minHeight: '40px',
              transition: 'background-color var(--duration-fast), color var(--duration-fast)',
            }}
          >
            Ketentuan Layanan
          </Link>
        </nav>

        {/* Hero Banner Header */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              width: 'fit-content',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-accent-subtle)',
              color: 'var(--color-accent)',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <Shield size={14} />
            <span>Privasi & Perlindungan Data</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              margin: 0,
              color: 'var(--color-text)',
            }}
          >
            Kebijakan Privasi
          </h1>

          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Finance Tracker berkomitmen menjaga privasi Anda. Kami meyakini bahwa data keuangan Anda
            sepenuhnya adalah milik Anda sendiri.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              paddingTop: 'var(--space-2)',
              borderTop: '1px solid var(--color-border-subtle)',
              fontSize: '0.8125rem',
              color: 'var(--color-text-muted)',
            }}
          >
            <span>Pembaruan Terakhir: 15 Oktober 2026</span>
            <span>•</span>
            <span>Versi 1.0</span>
          </div>
        </div>

        {/* Highlight Banner: Ringkasan Cepat */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-raised)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4) var(--space-5)',
            border: '1px solid var(--color-border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <p
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--color-text)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            ⚡ Ringkasan Pokok Privasi
          </p>

          <div
            style={{
              display: 'grid',
              gap: 'var(--space-2)',
              fontSize: '0.875rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
              <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Data pengeluaran Anda disimpan langsung di Google Spreadsheet akun Anda sendiri.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
              <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Kami tidak pernah menjual atau membagikan data transaksi Anda ke pihak ketiga manapun.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
              <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Izin akses Google Drive hanya mencakup file yang dibuat oleh aplikasi ini (<code>drive.file</code>).</span>
            </div>
          </div>
        </div>

        {/* Section List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* 01: Pendahuluan */}
          <section
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--color-accent)',
                  backgroundColor: 'var(--color-accent-subtle)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                01
              </span>
              <h2
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  margin: 0,
                  color: 'var(--color-text)',
                }}
              >
                Pendahuluan
              </h2>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: '0.9375rem',
                lineHeight: 1.7,
                color: 'var(--color-text-muted)',
              }}
            >
              Kebijakan Privasi ini menjelaskan bagaimana Finance Tracker (&ldquo;kami&rdquo;)
              memproses, mengamankan, dan menghormati data Anda ketika Anda menggunakan aplikasi web kami
              beserta integrasi iOS Shortcut untuk pencatatan keuangan pribadi.
            </p>
          </section>

          {/* 02: Data yang Kami Kumpulkan */}
          <section
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--color-accent)',
                  backgroundColor: 'var(--color-accent-subtle)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                02
              </span>
              <h2
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  margin: 0,
                  color: 'var(--color-text)',
                }}
              >
                Data yang Kami Kumpulkan
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: 'var(--color-surface-raised)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
                  <Database size={16} color="var(--color-accent)" />
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                    Profil Akun Google
                  </strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  Nama, alamat email, dan foto profil Anda saat masuk melalui Google OAuth untuk autentikasi sesi.
                </p>
              </div>

              <div
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: 'var(--color-surface-raised)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
                  <Lock size={16} color="var(--color-accent)" />
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                    Izin Akses Google Sheets & Drive (Terbatas)
                  </strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  Cakupan <code>https://www.googleapis.com/auth/drive.file</code>. Izin ini dibatasi ketat oleh Google
                  hanya untuk membuat dan memodifikasi spreadsheet yang dibuat langsung oleh Finance Tracker. Kami tidak
                  dapat melihat atau mengedit berkas pribadi lain di Google Drive Anda.
                </p>
              </div>

              <div
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: 'var(--color-surface-raised)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
                  <Shield size={16} color="var(--color-accent)" />
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                    Tangkapan Layar & Data Ekstraksi
                  </strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  Gambar bukti transaksi yang Anda kirimkan diproses sementara secara real-time untuk mengekstrak
                  nominal uang, nama merchant, tanggal, dan kategori.
                </p>
              </div>
            </div>
          </section>

          {/* 03: Standar Kepatuhan Google API (Limited Use) */}
          <section
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              border: '2px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--color-accent)',
                  backgroundColor: 'var(--color-accent-subtle)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                03
              </span>
              <h2
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  margin: 0,
                  color: 'var(--color-text)',
                }}
              >
                Kepatuhan Kebijakan Data Pengguna Google API
              </h2>
            </div>

            <p
              style={{
                margin: 0,
                fontSize: '0.9375rem',
                lineHeight: 1.7,
                color: 'var(--color-text-muted)',
              }}
            >
              Penggunaan dan pemindahan informasi yang diterima dari Google API oleh Finance Tracker ke aplikasi lain
              sepenuhnya mematuhi{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noreferrer"
                style={{
                  color: 'var(--color-text)',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Google API Services User Data Policy</span>
                <ExternalLink size={13} />
              </a>
              , termasuk seluruh persyaratan <strong>Penggunaan Terbatas (Limited Use Requirements)</strong>.
            </p>

            <ul
              style={{
                margin: 'var(--space-2) 0 0 var(--space-4)',
                padding: 0,
                fontSize: '0.875rem',
                lineHeight: 1.6,
                color: 'var(--color-text-muted)',
              }}
            >
              <li>Data Anda tidak digunakan untuk melatih model AI umum.</li>
              <li>Data Anda tidak pernah dijual atau ditransfer ke pengiklan/broker data pihak ketiga.</li>
              <li>Akses manusia terhadap data transaksi hanya dilakukan jika Anda secara eksplisit meminta dukungan teknis atas persetujuan Anda.</li>
            </ul>
          </section>

          {/* 04: Keamanan & Retensi */}
          <section
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--color-accent)',
                  backgroundColor: 'var(--color-accent-subtle)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                04
              </span>
              <h2
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  margin: 0,
                  color: 'var(--color-text)',
                }}
              >
                Keamanan & Penyimpanan Data
              </h2>
            </div>

            <p
              style={{
                margin: 0,
                fontSize: '0.9375rem',
                lineHeight: 1.7,
                color: 'var(--color-text-muted)',
              }}
            >
              Setiap token otorisasi Google OAuth disimpan dalam basis data terisolasi menggunakan enkripsi
              kriptografi simetris <strong>AES-256-GCM</strong> dengan kunci 256-bit. Tangkapan layar yang diunggah
              hanya diproses di dalam memori komputasi sementara dan tidak disimpan secara permanen di server setelah
              pencatatan ke spreadsheet selesai.
            </p>
          </section>

          {/* 05: Hak Anda & Pencabutan Izin */}
          <section
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--color-accent)',
                  backgroundColor: 'var(--color-accent-subtle)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                05
              </span>
              <h2
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  margin: 0,
                  color: 'var(--color-text)',
                }}
              >
                Hak Pengguna & Pencabutan Izin
              </h2>
            </div>

            <p
              style={{
                margin: 0,
                fontSize: '0.9375rem',
                lineHeight: 1.7,
                color: 'var(--color-text-muted)',
              }}
            >
              Anda memiliki kendali penuh atas akun Anda kapan saja:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: 'var(--color-surface-raised)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-text)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <span>Cabut Izin Akses di Pengaturan Akun Google</span>
                <ExternalLink size={15} color="var(--color-text-muted)" />
              </a>

              <Link
                href="/dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: 'var(--color-surface-raised)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-text)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <span>Kelola Perangkat Tertaut di Dashboard</span>
                <Trash2 size={15} color="var(--color-text-muted)" />
              </Link>
            </div>
          </section>

          {/* 06: Kontak Pengembang */}
          <section
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--color-accent)',
                  backgroundColor: 'var(--color-accent-subtle)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                06
              </span>
              <h2
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  margin: 0,
                  color: 'var(--color-text)',
                }}
              >
                Kontak Pengembang
              </h2>
            </div>

            <p
              style={{
                margin: 0,
                fontSize: '0.9375rem',
                lineHeight: 1.7,
                color: 'var(--color-text-muted)',
              }}
            >
              Apabila Anda memiliki pertanyaan, masukan, atau kendala seputar privasi data Anda, silakan hubungi kami:
            </p>

            <a
              href="mailto:yericoalexander12@gmail.com"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--color-accent-subtle)',
                color: 'var(--color-accent)',
                borderRadius: 'var(--radius-lg)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9375rem',
                width: 'fit-content',
                minHeight: '44px',
              }}
            >
              <Mail size={16} />
              <span>yericoalexander12@gmail.com</span>
            </a>
          </section>
        </div>

        {/* Footer */}
        <footer
          style={{
            textAlign: 'center',
            fontSize: '0.8125rem',
            color: 'var(--color-text-muted)',
            paddingTop: 'var(--space-4)',
          }}
        >
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} Finance Tracker. Hak cipta dilindungi undang-undang.
          </p>
        </footer>
      </div>
    </main>
  )
}
