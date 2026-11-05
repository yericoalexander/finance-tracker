import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WalletModal } from './wallet-modal'

describe('WalletModal', () => {
  it('automatically updates card name when selecting a different bank in edit mode', () => {
    const handleSave = vi.fn()
    const handleClose = vi.fn()

    render(
      <WalletModal
        isOpen={true}
        mode="edit"
        initialValues={{
          name: 'SeaBank',
          balanceIdr: 462000,
          themeId: 'seabank',
        }}
        onSave={handleSave}
        onClose={handleClose}
      />,
    )

    // Initially, name input has 'SeaBank'
    const nameInput = screen.getByLabelText(/nama kartu/i) as HTMLInputElement
    expect(nameInput.value).toBe('SeaBank')

    // Click 'Blu by BCA'
    const bluButton = screen.getByRole('button', { name: /blu by bca/i })
    fireEvent.click(bluButton)

    // The name should automatically update to 'Blu by BCA'
    expect(nameInput.value).toBe('Blu by BCA')

    // Click 'Krom'
    const kromButton = screen.getByRole('button', { name: /krom/i })
    fireEvent.click(kromButton)

    // The name should automatically update to 'Krom'
    expect(nameInput.value).toBe('Krom')
  })

  it('automatically updates card name when selecting a bank in add mode', () => {
    const handleSave = vi.fn()
    const handleClose = vi.fn()

    render(
      <WalletModal
        isOpen={true}
        mode="add"
        onSave={handleSave}
        onClose={handleClose}
      />,
    )

    const nameInput = screen.getByLabelText(/nama kartu/i) as HTMLInputElement

    // Switch to Digital & E-Wallet tab
    const digitalTab = screen.getByRole('button', { name: /digital & e-wallet/i })
    fireEvent.click(digitalTab)

    // Click 'SeaBank'
    const seaBankButton = screen.getByRole('button', { name: /seabank/i })
    fireEvent.click(seaBankButton)

    expect(nameInput.value).toBe('SeaBank')
  })
})

