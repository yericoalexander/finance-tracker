export const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024 // 8 MB

export type SupportedImageMime = 'image/png' | 'image/jpeg' | 'image/heic'

export interface ImageValidationResult {
  valid: boolean
  mimeType: SupportedImageMime | null
  error?: string
}

/**
 * Validasi buffer gambar berdasarkan magic bytes (bukan Content-Type header yang bisa dipalsukan).
 * Mendukung PNG, JPEG, dan HEIC.
 */
export function validateImageBuffer(buffer: Buffer): ImageValidationResult {
  if (!buffer || buffer.length === 0) {
    return { valid: false, mimeType: null, error: 'File gambar kosong' }
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      mimeType: null,
      error: 'Ukuran gambar melebihi batas maksimal 8 MB',
    }
  }

  // 1. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, mimeType: 'image/png' }
  }

  // 2. JPEG: FF D8 FF
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, mimeType: 'image/jpeg' }
  }

  // 3. HEIC / HEIF: Box ftyp pada byte offset 4..7
  if (buffer.length >= 12) {
    const ftyp = buffer.toString('ascii', 4, 8)
    if (ftyp === 'ftyp') {
      const brand = buffer.toString('ascii', 8, 12).toLowerCase()
      const heicBrands = ['heic', 'mif1', 'msf1', 'heix', 'hevc', 'heim', 'heis']
      if (heicBrands.includes(brand)) {
        return { valid: true, mimeType: 'image/heic' }
      }
    }
  }

  return {
    valid: false,
    mimeType: null,
    error: 'Format gambar tidak didukung. Gunakan PNG, JPEG, atau HEIC.',
  }
}
