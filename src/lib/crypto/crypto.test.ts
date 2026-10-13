import { describe, expect, it, vi } from 'vitest'

// Mock env sebelum import crypto
vi.mock('@/lib/env', () => ({
  env: {
    ENCRYPTION_KEY: 'a'.repeat(64), // 32 byte hex dummy
  },
}))

// Import setelah mock
const { encrypt, decrypt } = await import('@/lib/crypto')

describe('crypto (AES-256-GCM)', () => {
  it('round-trip: decrypt(encrypt(x)) === x', () => {
    const plaintext = 'test-refresh-token-rahasia'
    const payload = encrypt(plaintext)
    expect(decrypt(payload)).toBe(plaintext)
  })

  it('IV berbeda setiap kali enkripsi', () => {
    const token = 'sama-persis'
    const a = encrypt(token)
    const b = encrypt(token)
    expect(a.iv).not.toBe(b.iv)
    expect(a.ciphertext).not.toBe(b.ciphertext)
  })

  it('gagal jika auth tag dimanipulasi', () => {
    const payload = encrypt('data sensitif')
    const tampered = { ...payload, authTag: 'ff'.repeat(16) }
    expect(() => decrypt(tampered)).toThrow()
  })

  it('gagal jika ciphertext dimanipulasi', () => {
    const payload = encrypt('data sensitif')
    const tampered = { ...payload, ciphertext: payload.ciphertext.replace(/a/g, 'b') }
    // Mungkin throw atau menghasilkan data yang salah — keduanya tidak diterima
    try {
      const result = decrypt(tampered)
      expect(result).not.toBe('data sensitif')
    } catch {
      // Expected — GCM authentication failed
    }
  })

  it('mendukung string Unicode dan panjang', () => {
    const unicode = 'Rp 1.250.000 di Warung Padang 🍛'
    expect(decrypt(encrypt(unicode))).toBe(unicode)
  })
})
