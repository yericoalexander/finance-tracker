import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ExpenseModal } from './expense-modal'

const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

const mockCreateManualTransactionAction = vi.fn()
vi.mock('./manual-entry-action', () => ({
  createManualTransactionAction: (...args: unknown[]) => mockCreateManualTransactionAction(...args),
}))

describe('ExpenseModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders modal when isOpen is true with expense-only UI and no income toggle', () => {
    render(<ExpenseModal isOpen={true} onClose={vi.fn()} />)

    // Title exists
    expect(screen.getByRole('heading', { name: /catat pengeluaran/i })).toBeDefined()

    // No "Pemasukan" toggle or option exists
    expect(screen.queryByRole('button', { name: /pemasukan/i })).toBeNull()

    // No "Transfer Antar Bank" category chip exists (since it's only in Dompet transfer)
    expect(screen.queryByRole('button', { name: /transfer antar bank/i })).toBeNull()

    // Standard expense categories exist
    expect(screen.getByRole('button', { name: /makanan & minuman/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /transportasi/i })).toBeDefined()
  })

  it('does not render when isOpen is false', () => {
    const { container } = render(<ExpenseModal isOpen={false} onClose={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('updates amount when typing or tapping quick increment chips', () => {
    render(<ExpenseModal isOpen={true} onClose={vi.fn()} />)

    const amountInput = screen.getByLabelText(/nominal transaksi/i) as HTMLInputElement
    expect(amountInput.value).toBe('')

    // Tap +50.000 chip
    const chip50k = screen.getByRole('button', { name: /\+50\.000/i })
    fireEvent.click(chip50k)
    expect(amountInput.value).toBe('50.000')

    // Tap +25.000 chip -> 50.000 + 25.000 = 75.000
    const chip25k = screen.getByRole('button', { name: /\+25\.000/i })
    fireEvent.click(chip25k)
    expect(amountInput.value).toBe('75.000')
  })

  it('validates required merchant name before submitting', async () => {
    render(<ExpenseModal isOpen={true} onClose={vi.fn()} />)

    const amountInput = screen.getByLabelText(/nominal transaksi/i)
    fireEvent.change(amountInput, { target: { value: '25000' } })

    const submitBtn = screen.getByRole('button', { name: /catat pengeluaran/i })
    fireEvent.click(submitBtn)

    expect(mockCreateManualTransactionAction).not.toHaveBeenCalled()
    expect(screen.getByText(/nama merchant atau tempat transaksi wajib diisi/i)).toBeDefined()
  })

  it('submits successfully with txType expense and triggers onSuccess', async () => {
    mockCreateManualTransactionAction.mockResolvedValueOnce({
      ok: true,
      id: 'tx-123',
    })

    const handleSuccess = vi.fn()
    const handleClose = vi.fn()

    render(<ExpenseModal isOpen={true} onClose={handleClose} onSuccess={handleSuccess} />)

    const amountInput = screen.getByLabelText(/nominal transaksi/i)
    fireEvent.change(amountInput, { target: { value: '35000' } })

    const merchantInput = screen.getByLabelText(/nama tempat \/ merchant/i)
    fireEvent.change(merchantInput, { target: { value: 'Kopi Kenangan' } })

    const submitBtn = screen.getByRole('button', { name: /catat pengeluaran/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockCreateManualTransactionAction).toHaveBeenCalledWith(
        expect.objectContaining({
          merchant: 'Kopi Kenangan',
          amountIdr: 35000,
          txType: 'expense',
        }),
      )
    })

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalled()
      expect(mockRefresh).toHaveBeenCalled()
    })
  })
})

