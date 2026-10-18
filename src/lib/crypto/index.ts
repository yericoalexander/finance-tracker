import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

import { env } from '@/lib/env'

// IV: 12 byte (96 bit) — direkomendasikan untuk AES-256-GCM
const IV_LENGTH = 12
// Auth tag: 16 byte (128 bit) — default GCM
const AUTH_TAG_LENGTH = 16

function getKey(): Buffer {
  return Buffer.from(env.ENCRYPTION_KEY, 'hex')
}

export interface EncryptedPayload {
  ciphertext: string // hex
  iv: string // hex
  authTag: string // hex
}

/**
 * Enkripsi string dengan AES-256-GCM.
 * IV acak per enkripsi — jangan pernah reuse IV dengan kunci yang sama.
 */
export function encrypt(plaintext: string): EncryptedPayload {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv, {
    authTagLength: AUTH_TAG_LENGTH,
  })

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])

  return {
    ciphertext: encrypted.toString('hex'),
    iv: iv.toString('hex'),
    authTag: cipher.getAuthTag().toString('hex'),
  }
}

/**
 * Dekripsi payload AES-256-GCM.
 * Melempar error jika auth tag tidak valid (data dimanipulasi).
 */
export function decrypt(payload: EncryptedPayload): string {
  const decipher = createDecipheriv('aes-256-gcm', getKey(), Buffer.from(payload.iv, 'hex'), {
    authTagLength: AUTH_TAG_LENGTH,
  })
  decipher.setAuthTag(Buffer.from(payload.authTag, 'hex'))

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, 'hex')),
    decipher.final(),
  ])

  return decrypted.toString('utf8')
}
