# Finance Tracker — Project Brief

> Blueprint: *Finance Tracker (Screenshot to Sheets) untuk Antigravity*

---

## PERAN

Kamu senior full-stack engineer. Bangun aplikasi "Finance Tracker" yang mencatat pengeluaran dari screenshot iPhone ke Google Sheets milik user. Prioritaskan kode bersih, kecil, mudah dirawat, dan UI modern minimalis.

---

## KONTEKS PRODUK

- Pengguna iPhone saja. Alur: Back Tap -> Shortcut iOS mengambil screenshot -> POST ke /api/capture -> server mengekstrak transaksi dengan model vision -> baris ditulis ke Google Sheets user.
- Bahasa UI: Indonesia. Mata uang default: IDR (format Rp 1.250.000, tanpa desimal).
- Sumber screenshot: struk, invoice, bukti transfer bank, e-wallet (GoPay, OVO, DANA, ShopeePay), QRIS, marketplace.

---

## STACK (wajib)

Next.js App Router, TypeScript strict, Tailwind, shadcn/ui, Auth.js (Google), Postgres + Drizzle, Zod, googleapis. Deploy target: Vercel.

---

## FITUR

1. **Landing + onboarding stepper 4 langkah**: Masuk Google -> Pasang Shortcut -> Hubungkan perangkat -> Aktifkan Back Tap (opsional). Sertakan bantuan untuk kasus: shortcut terhapus, akun salah, izin ditolak.
2. **Login Google** dengan scope minimal: openid, email, profile, drive.file. Simpan refresh token terenkripsi (AES-256-GCM). Saat pertama login, buat spreadsheet otomatis dengan header baku + sheet Ringkasan.
3. **Pairing perangkat**: halaman menampilkan kode sekali pakai; Shortcut mengirim kode itu ke /api/devices/pair dan menerima device token. Simpan hanya hash token. Token bisa dicabut dari dashboard.
4. **POST /api/capture** (multipart, Bearer device token): validasi tipe dan ukuran gambar (maks 8 MB), rate limit per perangkat, ekstraksi dengan model vision memakai structured output (skema Zod), hitung hash gambar untuk deteksi duplikat, tulis ke Sheets, balas JSON ringkas untuk notifikasi Shortcut. Gambar TIDAK disimpan.
5. **Ekstraksi**: tanggal, waktu, merchant, nominal (integer rupiah), kategori (daftar tetap), metode bayar, catatan, confidence 0-1. Parsing format angka Indonesia (1.250.000 / 1,25 jt / Rp 50rb). Confidence < 0.7 -> status needs_review.
6. **Dashboard**: total bulan ini, transaksi terbaru, filter kategori, antrian Perlu dicek (edit satu ketukan), tombol Buka Google Sheets, pengaturan perangkat dan hapus akun.
7. **Halaman Ketentuan dan Kebijakan Privasi**.

---

## DESAIN

Mobile-first, modern minimalis, banyak whitespace, satu warna aksen, mode gelap otomatis, tipografi satu keluarga dengan angka tabular, tombol minimal 44px, animasi halus dan singkat, empty/loading/error state lengkap, microcopy Indonesia yang singkat dan ramah. Siapkan juga PWA manifest.

---

## KUALITAS KODE

- Struktur: `src/app` (routes), `src/features/<nama>` (komponen + logic per fitur), `src/lib` (google, ai, crypto, db), `src/components/ui`.
- Validasi semua input dan output eksternal dengan Zod. Tidak ada `any`.
- Fungsi kecil, satu tanggung jawab, nama jelas. Tidak ada duplikasi, tidak ada kode mati.
- Error handling eksplisit dengan tipe error terukur; jangan menelan error.
- Semua rahasia lewat env, divalidasi saat boot (`src/lib/env.ts`). Sediakan `.env.example`.
- Tes: unit test untuk parser nominal/tanggal dan skema ekstraksi, integration test untuk /api/capture dengan model dan Sheets di-mock.
- ESLint + Prettier + typecheck harus lulus sebelum tiap fase dianggap selesai.

---

## KEAMANAN DAN PRIVASI

Scope Google minimal, token terenkripsi, device token di-hash, rate limit, CSRF aman di route web, log tanpa data sensitif, screenshot tidak disimpan, fitur hapus akun menghapus token dan data lokal.

---

## CARA KERJA

Kerjakan per fase dan berhenti di akhir tiap fase untuk review:

| Fase | Deskripsi |
|------|-----------|
| **Fase 0** | Scaffold + tooling + env |
| **Fase 1** | Auth Google + pembuatan Sheet |
| **Fase 2** | Pairing + /api/capture + ekstraksi |
| **Fase 3** | Dashboard + Perlu dicek |
| **Fase 4** | Onboarding + landing + PWA |
| **Fase 5** | Tes, hardening, README deploy, dan panduan Shortcut iOS |

Sebelum menulis kode tiap fase, tulis rencana singkat (file yang akan dibuat/diubah). Jangan menambah fitur di luar daftar ini.

---

## ARSITEKTUR

```
iPhone (Back Tap) → Shortcut: Take Screenshot
  → POST multipart ke /api/capture (Bearer device token)
  → validasi token + rate limit
  → model vision → JSON terstruktur (Zod)
  → cek duplikat → tulis ke Google Sheets (refresh token user)
  → respon ringkas ({ok, amount, merchant}) → notifikasi di Shortcut
```

### Tabel Database (minimal)

| Tabel | Kolom |
|-------|-------|
| `users` | id, email, google_sub, sheet_id, created_at |
| `google_tokens` | user_id, refresh_token_encrypted |
| `devices` | id, user_id, token_hash, label, last_seen_at, revoked_at |
| `captures` | id, user_id, image_hash, status (ok / needs_review / failed), confidence, created_at |

### Kolom Google Sheet

`Tanggal | Waktu | Merchant | Kategori | Nominal | Metode Bayar | Catatan | Sumber | ID`

Tambahkan sheet kedua **Ringkasan** berisi rumus rekap per bulan dan per kategori (SUMIFS/QUERY).

---

## KEPUTUSAN PRODUK

| Area | Rekomendasi | Alasan |
|------|-------------|--------|
| Platform | Web app responsif (PWA) + Shortcut iOS | Tanpa App Store, deploy mudah |
| Penyimpanan | Google Sheets milik user + DB kecil untuk akun dan token | Data transparan, mudah direkap |
| Scope Google | drive.file + openid email profile | Hanya akses file yang dibuat aplikasi, tidak sensitif, lolos verifikasi lebih mudah |
| Ekstraksi | Model vision dengan structured output (schema Zod) | Lebih akurat dari OCR mentah untuk struk, bukti transfer, e-wallet |
| Screenshot | Tidak disimpan, diproses di memori lalu dibuang | Privasi dan biaya storage nol |
| Duplikat | Hash gambar + (nominal, merchant, waktu) | Mencegah tercatat dua kali saat Back Tap tak sengaja |
| Konfirmasi | Notifikasi hasil di Shortcut + halaman "Perlu dicek" untuk confidence rendah | Cepat tapi tetap akurat |
