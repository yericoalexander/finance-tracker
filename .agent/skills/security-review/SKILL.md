---
name: security-review
description: Dipakai di akhir tiap fase untuk memeriksa keamanan dan privasi sebelum merge.
---
# Security Review
Periksa: tidak ada rahasia di repo, token terenkripsi/di-hash, input divalidasi Zod, rate limit aktif, scope Google minimal, log bebas data sensitif, fitur hapus akun menghapus semua data, header keamanan (CSP, HSTS) aktif. Laporkan temuan sebagai daftar singkat dengan tingkat keparahan.
