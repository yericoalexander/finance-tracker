---
trigger: always_on
---
# Standar Kode
- TypeScript strict, dilarang `any`; gunakan `unknown` + Zod untuk data eksternal.
- Satu file satu tanggung jawab; fungsi maksimal ~40 baris.
- Struktur feature-based: src/features/<nama>, logic bersama di src/lib.
- Tanpa kode mati, komentar usang, atau duplikasi. Komentar hanya untuk "kenapa".
- Semua env divalidasi di src/lib/env.ts. Jangan baca process.env langsung di tempat lain.
- Teks UI Bahasa Indonesia. Nama kode dan komentar teknis Bahasa Inggris.
- Jalankan lint, typecheck, dan test sebelum menyatakan tugas selesai.
