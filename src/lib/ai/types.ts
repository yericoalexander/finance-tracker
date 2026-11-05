import { z } from 'zod'

export const CATEGORIES = [
  'Makanan & Minuman',
  'Transportasi',
  'Belanja',
  'Tagihan & Utilitas',
  'Hiburan',
  'Kesehatan',
  'Transfer Antar Bank',
  'Lainnya',
] as const

export type Category = (typeof CATEGORIES)[number]

export const TransactionExtractionSchema = z.object({
  date: z
    .string()
    .describe('Tanggal transaksi dalam format YYYY-MM-DD. Kosongkan jika tidak terbaca.'),
  time: z.string().describe('Waktu transaksi dalam format HH:mm. Kosongkan jika tidak terbaca.'),
  merchant: z.string().min(1).describe('Nama toko, merchant, penerima transfer, atau platform.'),
  amountIdr: z
    .number()
    .int()
    .nonnegative()
    .describe(
      'Total akhir nominal rupiah yang dibayar. Abaikan saldo, diskon, poin, atau cashback.',
    ),
  category: z
    .enum(CATEGORIES)
    .describe('Kategori pengeluaran yang paling sesuai dari daftar pilihan.'),
  paymentMethod: z
    .string()
    .describe('Metode pembayaran (mis. QRIS, GoPay, OVO, DANA, BCA, ShopeePay, Tunai, dll).'),
  note: z
    .string()
    .describe('Catatan ringkas mengenai barang/jasa yang dibeli atau tujuan transfer.'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('Skor keyakinan model terhadap keakuratan pembacaan (0.0 sampai 1.0).'),
  sourceBank: z
    .string()
    .optional()
    .describe('Bank atau e-wallet asal/sumber dana (mis. SeaBank, BCA, Mandiri, Krom, GoPay, dll).'),
  destinationBank: z
    .string()
    .optional()
    .describe('Bank atau e-wallet tujuan jika transaksi berupa transfer antar rekening/bank.'),
  isTransfer: z
    .boolean()
    .optional()
    .describe('Bernilai true jika transaksi merupakan transfer dana antar bank atau antar rekening.'),
})

export type TransactionExtraction = z.infer<typeof TransactionExtractionSchema>

export interface ExtractionProvider {
  extractReceipt(imageBuffer: Buffer, mimeType: string): Promise<TransactionExtraction>
}
