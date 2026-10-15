import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Ketentuan Layanan',
  description: 'Syarat dan ketentuan penggunaan aplikasi Finance Tracker.',
}

export default function TermsPage() {
  return (
    <main
      style={{
        minHeight: '100svh',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)',
        padding: 'var(--space-6)',
        paddingBottom: 'calc(var(--space-8) + env(safe-area-inset-bottom))',
      }}
    >
      <div
        style={{
          maxWidth: '640px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
        }}
      >
        {/* Tombol Kembali */}
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
            width: 'fit-content',
            minHeight: '44px',
          }}
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Halaman Masuk</span>
        </Link>

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-lg, 12px)',
              backgroundColor: 'var(--color-accent-subtle, rgba(59, 130, 246, 0.1))',
              color: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={22} />
          </div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Ketentuan Layanan
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>
            Terakhir diperbarui: 15 Oktober 2026
          </p>
        </div>

        {/* Konten Ketentuan */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-5)',
            fontSize: '0.9375rem',
            lineHeight: 1.65,
            color: 'var(--color-text)',
          }}
        >
          <section>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
              1. Penerimaan Ketentuan
            </h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
              Dengan mengakses atau menggunakan aplikasi Finance Tracker (&ldquo;Layanan&rdquo;), Anda setuju
              untuk terikat dengan Ketentuan Layanan ini. Jika Anda tidak menyetujui ketentuan ini, Anda tidak
              diperkenankan menggunakan Layanan.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
              2. Deskripsi Layanan
            </h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
              Finance Tracker adalah alat bantu produktivitas keuangan pribadi yang memungkinkan pengguna
              mencatat pengeluaran secara otomatis dari tangkapan layar transaksi (struk, mutasi bank, e-wallet)
              langsung ke Google Spreadsheet pribadi pengguna melalui integrasi AI vision dan Google Sheets API.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
              3. Akun Pengguna & Keamanan
            </h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
              Anda bertanggung jawab menjaga kerahasiaan perangkat dan akun Google Anda. Seluruh aktivitas yang
              dilakukan melalui akun Anda menjadi tanggung jawab Anda sepenuhnya.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
              4. Penggunaan yang Diperbolehkan
            </h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
              Anda setuju untuk tidak menyalahgunakan Layanan, termasuk namun tidak terbatas pada mengirimkan berkas
              berbahaya, melakukan rekayasa balik (reverse engineering), atau mencoba mengakses akun atau data pengguna lain.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
              5. Batasan Tanggung Jawab
            </h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
              Layanan ekstraksi otomatis menggunakan model AI yang beroperasi dengan tingkat akurasi tinggi namun
              tidak menjamin 100% bebas kesalahan. Anda disarankan untuk memeriksa data transaksi yang tercatat
              pada spreadsheet Anda secara berkala. Finance Tracker tidak bertanggung jawab atas kerugian finansial
              akibat ketidaksesuaian pencatatan data.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
              6. Perubahan Layanan & Kontak
            </h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
              Kami berhak memperbarui ketentuan ini dari waktu ke waktu. Pertanyaan terkait ketentuan ini dapat dikirimkan ke:{' '}
              <a
                href="mailto:yericoalexander12@gmail.com"
                style={{ color: 'var(--color-accent)', fontWeight: 500 }}
              >
                yericoalexander12@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
