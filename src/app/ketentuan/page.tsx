import type { Metadata } from 'next'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Cpu,
  FileText,
  Mail,
  ShieldCheck,
} from 'lucide-react'

import { ThemeToggle } from '@/components/ui/theme-toggle'

export const metadata: Metadata = {
  title: 'Ketentuan Layanan',
  description: 'Syarat dan ketentuan resmi penggunaan aplikasi Finance Tracker.',
}

export default function TermsPage() {
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
          <Link
            href="/privasi"
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
            Kebijakan Privasi
          </Link>
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
            Ketentuan Layanan
          </span>
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
            <FileText size={14} />
            <span>Syarat & Perjanjian Pengguna</span>
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
            Ketentuan Layanan
          </h1>

          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Harap baca syarat dan ketentuan ini secara seksama sebelum menggunakan Finance Tracker.
            Dengan menggunakan layanan kami, Anda menyetujui seluruh ketentuan yang tercantum.
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
            ⚡ Ringkasan Pokok Ketentuan
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
              <span>Layanan ini disediakan sebagai alat bantu produktivitas keuangan pribadi Anda.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
              <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Ekstraksi data dibantu oleh AI vision, Anda disarankan meninjau catatan berkala.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
              <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Anda memegang kepemilikan penuh atas data spreadsheet di Google Drive Anda.</span>
            </div>
          </div>
        </div>

        {/* Section List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* 01: Penerimaan Ketentuan */}
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
                Penerimaan Ketentuan
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
              Dengan mendaftar, mengakses, atau menggunakan layanan Finance Tracker (&ldquo;Layanan&rdquo;),
              Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat secara hukum dengan seluruh
              Ketentuan Layanan ini beserta Kebijakan Privasi kami.
            </p>
          </section>

          {/* 02: Deskripsi Layanan */}
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
                Deskripsi Layanan
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {/* Item 1: Otomatisasi AI Vision */}
              <div
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-surface-raised)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border-subtle)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-3)',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: 'var(--color-accent)',
                  }}
                >
                  <Cpu size={18} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                      Otomatisasi Ekstraksi AI Vision
                    </strong>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--color-accent-subtle)',
                        color: 'var(--color-accent)',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      AI Powered
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.55 }}>
                    Memproses gambar bukti pembayaran (struk belanja fisik, mutasi m-banking, QRIS, e-wallet) menjadi data pengeluaran terstruktur secara otomatis.
                  </p>
                </div>
              </div>

              {/* Item 2: Sinkronisasi Google Sheets */}
              <div
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-surface-raised)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border-subtle)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-3)',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: 'var(--color-accent)',
                  }}
                >
                  <ShieldCheck size={18} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                      Sinkronisasi Google Sheets
                    </strong>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--color-accent-subtle)',
                        color: 'var(--color-accent)',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Live Sync
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.55 }}>
                    Menulis catatan transaksi langsung ke spreadsheet milik akun Google Anda sendiri, lengkap dengan formula rekapitulasi dan filter interaktif.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 03: Akun Pengguna & Kewajiban */}
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
                Akun Pengguna & Tanggung Jawab
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
              Untuk menggunakan Layanan, Anda harus menghubungkan Akun Google yang sah. Anda bertanggung jawab
              menjaga keamanan perangkat Anda serta kunci pasangan (API Pairing Key) yang dipasang pada shortcut iOS
              Anda. Segala bentuk aktivitas pencatatan yang berasal dari perangkat terverifikasi Anda dianggap sebagai
              tindakan sah Anda.
            </p>
          </section>

          {/* 04: Batasan Tanggung Jawab (Disclaimer AI) */}
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
                Akurasi AI & Batasan Tanggung Jawab
              </h2>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--color-surface-raised)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <AlertTriangle size={18} color="var(--color-warning, #d97706)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Teknologi AI ekstraksi visi dirancang dengan presisi tinggi, namun tetap memiliki kemungkinan
                kesalahan pembacaan akibat foto struk yang buram, terpotong, atau resolusi rendah. Kami sangat menyarankan
                Anda meninjau catatan transaksi di Google Spreadsheet secara berkala.
              </p>
            </div>

            <p
              style={{
                margin: 0,
                fontSize: '0.9375rem',
                lineHeight: 1.7,
                color: 'var(--color-text-muted)',
              }}
            >
              Finance Tracker tidak bertanggung jawab atas kerugian finansial langsung maupun tidak langsung,
              kesalahan pencatatan pembukuan, atau keputusan keuangan yang diambil berdasarkan data yang dicatat.
            </p>
          </section>

          {/* 05: Larangan Penggunaan */}
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
                Penggunaan yang Dilarang
              </h2>
            </div>

            <ul
              style={{
                margin: 'var(--space-2) 0 0 var(--space-4)',
                padding: 0,
                fontSize: '0.875rem',
                lineHeight: 1.6,
                color: 'var(--color-text-muted)',
              }}
            >
              <li>Mengunggah berkas berbahaya (malware, skrip berbahaya) atau konten non-keuangan.</li>
              <li>Mencoba membobol, mengeksploitasi, atau mengganggu stabilitas infrastruktur server.</li>
              <li>Melakukan rekayasa balik (reverse engineering) terhadap sistem tanpa izin tertulis.</li>
              <li>Menyalahgunakan layanan untuk tindakan pencucian uang atau penipuan keuangan lainnya.</li>
            </ul>
          </section>

          {/* 06: Kontak & Bantuan */}
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
                Pertanyaan & Kontak
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
              Jika Anda memiliki pertanyaan mengenai Ketentuan Layanan ini, silakan hubungi pengembang di:
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
