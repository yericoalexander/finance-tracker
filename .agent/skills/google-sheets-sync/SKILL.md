---
name: google-sheets-sync
description: Dipakai saat mengerjakan OAuth Google, pembuatan spreadsheet, dan penulisan transaksi ke Google Sheets.
---
# Google Sheets Sync
- Scope hanya `openid email profile https://www.googleapis.com/auth/drive.file`. Jangan minta scope lebih luas.
- Minta `access_type=offline` dan `prompt=consent` saat pertama untuk mendapat refresh token.
- Enkripsi refresh token dengan AES-256-GCM (kunci dari env), simpan IV dan tag.
- Buat spreadsheet saat pertama login: sheet `Transaksi` (header baku) dan `Ringkasan` (rumus rekap bulanan dan per kategori).
- Tulis baris dengan `values.append` memakai `valueInputOption=USER_ENTERED`, sertakan kolom ID untuk idempotensi.
- Tangani 401 (refresh token), 403 (izin dicabut -> minta login ulang), 429 (backoff eksponensial).
- Bungkus semua pemanggilan Google di satu modul `src/lib/google/` agar mudah di-mock.
