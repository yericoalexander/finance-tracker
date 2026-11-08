import { asc, eq } from 'drizzle-orm'
import { formatRupiah } from '@/lib/ai/currency'
import { db } from '@/lib/db/client'
import { wallets, type WalletRecord } from '@/lib/db/schema'

export interface ApplyWalletTransactionInput {
  amountIdr: number
  category?: string
  paymentMethod?: string
  merchant?: string
  sourceBank?: string
  destinationBank?: string
  isTransfer?: boolean
  txType?: 'expense' | 'income'
}

export interface WalletMutationDetail {
  id: string
  name: string
  deltaIdr: number
  oldBalance: number
  newBalance: number
}

export interface ApplyWalletTransactionResult {
  applied: boolean
  isTransfer: boolean
  sourceWallet?: WalletMutationDetail
  destWallet?: WalletMutationDetail
  summaryMessage: string
}

/**
 * Ambil daftar dompet milik pengguna dari database.
 * Sesuai prinsip kontrol pengguna: TIDAK pernah membuat dompet otomatis/dummy.
 * Pengguna bebas kustom kartu/dompet mereka sendiri lewat tombol Tambah Kartu.
 */
export async function getUserWallets(userId: string): Promise<WalletRecord[]> {
  if (!db?.query?.wallets?.findMany) {
    return []
  }

  const existing = await db.query.wallets
    .findMany({
      where: eq(wallets.userId, userId),
      orderBy: asc(wallets.order),
    })
    .catch(() => [])

  return Array.isArray(existing) ? existing.filter(Boolean) : []
}

export const ensureUserWallets = getUserWallets

/**
 * Cari dompet yang cocok berdasarkan nama bank/e-wallet.
 */
export function findMatchingWallet(
  walletsList: WalletRecord[],
  query?: string | null,
): WalletRecord | undefined {
  if (!query || !Array.isArray(walletsList) || walletsList.length === 0) return undefined
  const q = query.trim().toLowerCase()
  if (!q) return undefined

  // 1. Cocokkan persis nama kartu atau themeId
  const exact = walletsList.find(
    (w) =>
      Boolean(w?.name && w.name.toLowerCase() === q) ||
      Boolean(w?.themeId && w.themeId.toLowerCase() === q),
  )
  if (exact) return exact

  // 2. Cocokkan karakter alphanumeric bersih
  const cleanQ = q.replace(/[^a-z0-9]/g, '')
  const cleanMatch = walletsList.find((w) => {
    const cleanName = (w?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '')
    const cleanTheme = (w?.themeId || '').toLowerCase().replace(/[^a-z0-9]/g, '')
    return (cleanName && cleanName === cleanQ) || (cleanTheme && cleanTheme === cleanQ)
  })
  if (cleanMatch) return cleanMatch

  // 3. Cocokkan alias bank atau e-wallet populer
  const aliases: Array<{ key: RegExp; target: RegExp }> = [
    { key: /seabank/i, target: /seabank/i },
    { key: /krom/i, target: /krom/i },
    { key: /bca|m-bca/i, target: /bca/i },
    { key: /mandiri|livin/i, target: /mandiri/i },
    { key: /bri|brimo/i, target: /bri/i },
    { key: /bni|wondr/i, target: /bni/i },
    { key: /ocbc/i, target: /ocbc/i },
    { key: /cimb/i, target: /cimb/i },
    { key: /superbank/i, target: /superbank/i },
    { key: /gopay/i, target: /gopay/i },
    { key: /ovo/i, target: /ovo/i },
    { key: /dana/i, target: /dana/i },
    { key: /apple/i, target: /apple/i },
  ]

  for (const alias of aliases) {
    if (alias.key.test(q)) {
      const matched = walletsList.find(
        (w) =>
          Boolean(w?.name && alias.target.test(w.name)) ||
          Boolean(w?.themeId && alias.target.test(w.themeId)),
      )
      if (matched) return matched
    }
  }

  return undefined
}

/**
 * Terapkan mutasi saldo transfer antar dompet (misal: SeaBank -> Krom).
 */
async function applyTransferMutation(
  userId: string,
  walletsList: WalletRecord[],
  amountIdr: number,
  sourceQuery?: string,
  destQuery?: string,
): Promise<ApplyWalletTransactionResult> {
  const source = findMatchingWallet(walletsList, sourceQuery)
  const dest = findMatchingWallet(walletsList, destQuery)

  if (source && dest && source.id !== dest.id) {
    const newSourceBal = Math.max(0, source.balanceIdr - amountIdr)
    const newDestBal = dest.balanceIdr + amountIdr

    await Promise.all([
      db
        .update(wallets)
        .set({ balanceIdr: newSourceBal, updatedAt: new Date() })
        .where(eq(wallets.id, source.id)),
      db
        .update(wallets)
        .set({ balanceIdr: newDestBal, updatedAt: new Date() })
        .where(eq(wallets.id, dest.id)),
    ])

    return {
      applied: true,
      isTransfer: true,
      sourceWallet: {
        id: source.id,
        name: source.name,
        deltaIdr: -amountIdr,
        oldBalance: source.balanceIdr,
        newBalance: newSourceBal,
      },
      destWallet: {
        id: dest.id,
        name: dest.name,
        deltaIdr: amountIdr,
        oldBalance: dest.balanceIdr,
        newBalance: newDestBal,
      },
      summaryMessage: `${source.name} (-${formatRupiah(amountIdr)}) ➔ ${dest.name} (+${formatRupiah(amountIdr)})`,
    }
  }

  // Jika hanya dompet asal yang cocok (misal transfer ke rekening bank luar)
  if (source) {
    const newBal = Math.max(0, source.balanceIdr - amountIdr)
    await db
      .update(wallets)
      .set({ balanceIdr: newBal, updatedAt: new Date() })
      .where(eq(wallets.id, source.id))

    return {
      applied: true,
      isTransfer: true,
      sourceWallet: {
        id: source.id,
        name: source.name,
        deltaIdr: -amountIdr,
        oldBalance: source.balanceIdr,
        newBalance: newBal,
      },
      summaryMessage: `${source.name} (-${formatRupiah(amountIdr)})`,
    }
  }

  // Jika hanya dompet tujuan yang cocok (misal menerima dana dari luar)
  if (dest) {
    const newBal = dest.balanceIdr + amountIdr
    await db
      .update(wallets)
      .set({ balanceIdr: newBal, updatedAt: new Date() })
      .where(eq(wallets.id, dest.id))

    return {
      applied: true,
      isTransfer: true,
      destWallet: {
        id: dest.id,
        name: dest.name,
        deltaIdr: amountIdr,
        oldBalance: dest.balanceIdr,
        newBalance: newBal,
      },
      summaryMessage: `${dest.name} (+${formatRupiah(amountIdr)})`,
    }
  }

  return {
    applied: false,
    isTransfer: true,
    summaryMessage: 'Dompet tujuan/sumber tidak ditemukan',
  }
}

/**
 * Terapkan transaksi pengeluaran atau pemasukan biasa ke dompet yang bersangkutan.
 */
async function applyStandardMutation(
  walletsList: WalletRecord[],
  amountIdr: number,
  txType: 'expense' | 'income',
  targetQuery?: string,
): Promise<ApplyWalletTransactionResult> {
  const target = findMatchingWallet(walletsList, targetQuery)
  if (!target) {
    return { applied: false, isTransfer: false, summaryMessage: 'Dompet tidak terhubung' }
  }

  const isIncome = txType === 'income'
  const delta = isIncome ? amountIdr : -amountIdr
  const newBalance = Math.max(0, target.balanceIdr + delta)

  await db
    .update(wallets)
    .set({ balanceIdr: newBalance, updatedAt: new Date() })
    .where(eq(wallets.id, target.id))

  const sign = isIncome ? '+' : '-'
  return {
    applied: true,
    isTransfer: false,
    sourceWallet: isIncome
      ? undefined
      : {
          id: target.id,
          name: target.name,
          deltaIdr: delta,
          oldBalance: target.balanceIdr,
          newBalance,
        },
    destWallet: isIncome
      ? {
          id: target.id,
          name: target.name,
          deltaIdr: delta,
          oldBalance: target.balanceIdr,
          newBalance,
        }
      : undefined,
    summaryMessage: `${target.name} (${sign}${formatRupiah(amountIdr)})`,
  }
}

/**
 * Entry point utama sinkronisasi mutasi transaksi ke sistem dompet.
 */
export async function applyTransactionToWallets(
  userId: string,
  input: ApplyWalletTransactionInput,
): Promise<ApplyWalletTransactionResult> {
  if (input.amountIdr <= 0) {
    return { applied: false, isTransfer: false, summaryMessage: 'Nominal 0' }
  }

  const userWallets = await ensureUserWallets(userId)
  const isTransfer = Boolean(input.isTransfer && input.category === 'Transfer Antar Bank')

  if (userWallets.length === 0) {
    return {
      applied: false,
      isTransfer,
      summaryMessage: 'Belum ada dompet kustom yang terdaftar',
    }
  }

  if (isTransfer) {
    const sourceQuery = input.sourceBank || input.paymentMethod
    const destQuery = input.destinationBank || input.merchant
    return applyTransferMutation(userId, userWallets, input.amountIdr, sourceQuery, destQuery)
  }

  const txType = input.txType ?? 'expense'
  const targetQuery =
    txType === 'income'
      ? input.destinationBank || input.sourceBank || input.paymentMethod
      : input.sourceBank || input.paymentMethod || input.merchant

  return applyStandardMutation(userWallets, input.amountIdr, txType, targetQuery)
}
