---
name: minimal-mobile-ui
description: Dipakai saat membuat halaman atau komponen UI agar konsisten modern, minimalis, dan nyaman di iPhone.
---
# Minimal Mobile UI
- Mulai dari token desain: warna netral + 1 aksen, skala spacing 4px, radius konsisten, bayangan tipis.
- Gunakan komponen shadcn/ui dan variasikan lewat token, jangan buat gaya sendiri per halaman.
- Perhatikan safe area iPhone (`env(safe-area-inset-*)`) dan `viewport-fit=cover`.
- Satu tujuan per layar, satu tombol utama. Aksi sekunder dibuat visual lebih tenang.
- Daftar transaksi: merchant di kiri, nominal tabular di kanan, kategori sebagai chip kecil.
- Wajib ada skeleton loading, empty state yang mengarahkan aksi, dan pesan error yang bisa ditindaklanjuti.
- Uji di lebar 375px dan mode gelap sebelum selesai.
