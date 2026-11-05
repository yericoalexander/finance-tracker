import { fireEvent, render, screen } from '@testing-library/react'
import { BellRing } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'

import { SetupGateModeCard } from './setup-gate-mode-card'

describe('SetupGateModeCard', () => {
  it('merender judul, badge, deskripsi, dan ikon dengan benar', () => {
    const handleSelect = vi.fn()
    render(
      <SetupGateModeCard
        mode="notification"
        selected={false}
        onSelect={handleSelect}
        icon={<BellRing data-testid="test-icon" />}
        title="Otomatis Notifikasi Bank"
        badge="⚡ Paling Populer"
        description="Setiap transaksi langsung otomatis tercatat."
      />,
    )

    expect(screen.getByText('Otomatis Notifikasi Bank')).toBeInTheDocument()
    expect(screen.getByText('⚡ Paling Populer')).toBeInTheDocument()
    expect(screen.getByText('Setiap transaksi langsung otomatis tercatat.')).toBeInTheDocument()
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('memanggil onSelect dengan mode yang tepat saat diklik', () => {
    const handleSelect = vi.fn()
    render(
      <SetupGateModeCard
        mode="backtap"
        selected={false}
        onSelect={handleSelect}
        icon={<BellRing />}
        title="Back Tap Foto Struk"
        badge="📸 Visual AI"
        description="Ketuk 2x punggung iPhone."
      />,
    )

    const cardBtn = screen.getByRole('radio')
    expect(cardBtn).toHaveAttribute('aria-checked', 'false')

    fireEvent.click(cardBtn)
    expect(handleSelect).toHaveBeenCalledWith('backtap')
  })

  it('menampilkan status aria-checked=true saat kartu dipilih', () => {
    render(
      <SetupGateModeCard
        mode="notification"
        selected={true}
        onSelect={vi.fn()}
        icon={<BellRing />}
        title="Otomatis Notifikasi Bank"
        badge="⚡ Paling Populer"
        description="Deskripsi"
      />,
    )

    const cardBtn = screen.getByRole('radio')
    expect(cardBtn).toHaveAttribute('aria-checked', 'true')
  })
})

