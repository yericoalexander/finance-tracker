import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description: 'Kebijakan privasi dan perlindungan data pengguna Finance Tracker.',
}

export default function PrivacyPage() {
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
            <Shield size={22} />
          </div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Kebijakan Privasi
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>
            Terakhir diperbarui: 15 Oktober 2026
          </p>
        </div>

        {/* Konten Kebijakan */}
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
              1. Pendahuluan
            </h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
              Finance Tracker (&ldquo;kami&rdquo;) menghormati dan berkomitmen melindungi privasi data Anda.
              Kebijakan Privasi ini menjelaskan bagaimana data Anda dikumpulkan, digunakan, dan dilindungi saat
              menggunakan aplikasi Finance Tracker.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
              2. Data yang Kami Kumpulkan
            </h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
              Saat Anda masuk menggunakan Akun Google, kami meminta izin untuk mengakses informasi berikut:
            </p>
            <ul
              style={{
                margin: 'var(--space-2) 0 0 var(--space-4)',
                padding: 0,
                color: 'var(--color-text-muted)',
              }}
            >
              <li>
                <strong>Informasi Profil Dasar:</strong> Nama, alamat email, dan foto profil untuk identifikasi akun.
              </li>
              <li>
                <strong>Akses Google Drive & Google Sheets:</strong> Izin terbatas (<code>drive.file</code>) untuk
                membuat dan memperbarui spreadsheet &ldquo;Finance Tracker — Transaksi&rdquo; di akun Google Drive pribadi Anda.
              </li>
              <li>
                <strong>Data Transaksi:</strong> Gambar struk/bukti transfer yang Anda kirimkan untuk diekstraksi
                menjadi data pengeluaran (nominal, merchant, kategori, dan tanggal).
              </li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
              3. Cara Kami Menggunakan Data Anda
            </h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
              Data Anda digunakan semata-mata untuk fungsi inti aplikasi:
            </p>
            <ul
              style={{
                margin: 'var(--space-2) 0 0 var(--space-4)',
                padding: 0,
                color: 'var(--color-text-muted)',
              }}
            >
              <li>Mengekstrak rincian pengeluaran dari tangkapan layar transaksi Anda.</li>
              <li>Mencatat hasil ekstraksi langsung ke Google Spreadsheet pribadi milik Anda.</li>
              <li>Menampilkan ringkasan keuangan bulanan di dashboard aplikasi Anda.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
              4. Kepatuhan Kebijakan Data Pengguna Google API
            </h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
              Penggunaan dan transfer informasi yang diterima dari Google API oleh Finance Tracker ke aplikasi lain
              mematuhi <strong>Google API Services User Data Policy</strong>, termasuk persyaratan Penggunaan Terbatas
              (<em>Limited Use requirements</em>).
            </p>
            <p style={{ marginTop: 'var(--space-2)', color: 'var(--color-text-muted)' }}>
              Kami <strong>tidak pernah</strong> menjual data Anda, tidak menggunakannya untuk iklan, dan tidak
              mengakses file lain di Google Drive Anda selain spreadsheet yang dibuat oleh aplikasi ini.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
              5. Keamanan & Retensi Data
            </h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
              Token otorisasi Google Anda disimpan dengan enkripsi tingkat militer (AES-256-GCM). Gambar struk yang
              diproses tidak disimpan secara permanen di server kami setelah proses pencatatan selesai. Seluruh riwayat
              keuangan tersimpan aman di Google Drive akun Anda sendiri.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
              6. Pencabutan Izin & Penghapusan Akun
            </h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
              Anda berhak mencabut izin akses Finance Tracker kapan saja melalui halaman{' '}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}
              >
                Pengaturan Izin Akun Google
              </a>
              . Anda juga dapat menghapus data perangkat tertaut melalui menu dashboard aplikasi.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
              7. Kontak Pengembang
            </h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
              Jika Anda memiliki pertanyaan seputar Kebijakan Privasi ini, silakan hubungi kami melalui email di:{' '}
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
