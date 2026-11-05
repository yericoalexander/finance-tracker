'use client'

import { DirectSetupCard } from './direct-setup-card'
import { ShortcutGuideCard } from './shortcut-guide-card'
import { NotificationShortcutGuideCard } from './notification-shortcut-guide-card'

interface PairCardProps {
  userName?: string
}

export function PairCard({ userName }: PairCardProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* 1. Rekomendasi Utama: Auto-Catat Notifikasi Bank & QRIS (< 0.5 detik, Ditaruh di Paling Atas & Di-highlight) */}
      <NotificationShortcutGuideCard />

      {/* 2. Opsi Khusus: Khusus untuk pengguna yang ingin mencatat via Back Tap (Foto Struk Fisik) */}
      <DirectSetupCard userName={userName} />

      {/* 3. Panduan Lengkap Pembuatan Pintasan & Pengaturan Manual */}
      <ShortcutGuideCard />
    </div>
  )
}
