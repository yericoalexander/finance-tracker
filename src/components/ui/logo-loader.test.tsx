import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { LogoLoader } from './logo-loader'

describe('LogoLoader', () => {
  it('menampilkan status memuat dan teks label default', () => {
    render(<LogoLoader />)

    const statusEl = screen.getByRole('status')
    expect(statusEl).toBeInTheDocument()
    expect(screen.getByText('Finance Tracker')).toBeInTheDocument()
    expect(screen.getByText('Memuat...')).toBeInTheDocument()
  })

  it('mendukung custom label dalam Bahasa Indonesia', () => {
    render(<LogoLoader label="Menyiapkan data keuangan..." />)

    expect(screen.getByText('Menyiapkan data keuangan...')).toBeInTheDocument()
  })

  it('merender dengan mode inline saat fullscreen=false', () => {
    const { container } = render(<LogoLoader fullscreen={false} />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    // Tidak ada wrapper fixed fullscreen
    const fixedWrapper = container.querySelector('div[style*="position: fixed"]')
    expect(fixedWrapper).toBeNull()
  })
})
