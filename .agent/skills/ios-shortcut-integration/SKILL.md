---
name: ios-shortcut-integration
description: Dipakai saat membuat endpoint pairing/capture dan panduan Shortcut iOS dengan Back Tap.
---
# iOS Shortcut Integration
- Alur pairing: dashboard menampilkan kode 6-8 karakter berlaku 10 menit; Shortcut mengirim kode ke /api/devices/pair; server membalas device token (ditampilkan sekali, simpan hash saja).
- /api/capture: header `Authorization: Bearer <token>`, body multipart field `image`. Balas JSON pendek (`ok`, `amount`, `merchant`, `status`) agar mudah ditampilkan di notifikasi Shortcut.
- Batasi ukuran 8 MB, tipe png/jpeg/heic; rate limit per perangkat.
- Shortcut: Take Screenshot -> Get Contents of URL (POST, Form) -> Show Notification dari hasil.
- Tulis README panduan: cara impor Shortcut via link iCloud, izin Always Allow, dan pengaturan Back Tap.
- Sediakan endpoint cabut perangkat dan pesan error yang ramah untuk token tidak valid.
