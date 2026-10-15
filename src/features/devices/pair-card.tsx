'use client'

import { DirectSetupCard } from './direct-setup-card'
import { ShortcutGuideCard } from './shortcut-guide-card'

interface PairCardProps {
  userName?: string
}

export function PairCard({ userName }: PairCardProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* 1. Alur Utama: 1-Klik Hubungkan Langsung dengan Izin Pemilik */}
      <DirectSetupCard userName={userName} />

      {/* 2. Panduan Lengkap Pembuatan Pintasan & Back Tap */}
      <ShortcutGuideCard />
    </div>
  )
}
