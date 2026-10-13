---
name: receipt-extraction
description: Dipakai saat membuat atau mengubah logic ekstraksi transaksi dari screenshot (struk, invoice, bukti transfer, e-wallet) dengan model vision dan structured output.
---
# Receipt Extraction
1. Definisikan skema Zod `TransactionExtraction`: date, time, merchant, amountIdr (integer), category (enum tetap), paymentMethod, note, confidence (0-1).
2. Prompt model: instruksikan membaca TOTAL akhir yang dibayar, bukan subtotal; abaikan saldo, poin, dan promo.
3. Normalisasi angka Indonesia di fungsi terpisah dan teruji: `1.250.000`, `Rp50rb`, `1,2 jt`.
4. Jika tanggal tidak terbaca, pakai waktu server (zona Asia/Jakarta) dan turunkan confidence.
5. Validasi output dengan Zod; jika gagal, retry sekali, lalu tandai needs_review.
6. Hitung hash gambar (SHA-256) untuk deteksi duplikat sebelum menulis ke Sheets.
7. Jangan simpan gambar. Jangan log isi gambar atau nominal lengkap.
8. Sediakan fixture uji untuk bank, e-wallet, QRIS, dan marketplace.
