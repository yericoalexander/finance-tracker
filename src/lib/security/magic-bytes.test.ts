import { describe, expect, it } from 'vitest'

import { MAX_FILE_SIZE_BYTES, validateImageBuffer } from './magic-bytes'

describe('validateImageBuffer', () => {
  it('mengenali file PNG valid', () => {
    // Magic bytes PNG: 89 50 4E 47 0D 0A 1A 0A
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00])
    const res = validateImageBuffer(pngBuffer)
    expect(res.valid).toBe(true)
    expect(res.mimeType).toBe('image/png')
  })

  it('mengenali file JPEG valid', () => {
    // Magic bytes JPEG: FF D8 FF
    const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10])
    const res = validateImageBuffer(jpegBuffer)
    expect(res.valid).toBe(true)
    expect(res.mimeType).toBe('image/jpeg')
  })

  it('mengenali file HEIC valid', () => {
    // Box ftyp heic
    const header = Buffer.alloc(16)
    header.write('ftyp', 4, 'ascii')
    header.write('heic', 8, 'ascii')

    const res = validateImageBuffer(header)
    expect(res.valid).toBe(true)
    expect(res.mimeType).toBe('image/heic')
  })

  it('menolak file yang melebihi batas 8 MB', () => {
    const hugeBuffer = Buffer.alloc(MAX_FILE_SIZE_BYTES + 10)
    hugeBuffer[0] = 0xff
    hugeBuffer[1] = 0xd8
    hugeBuffer[2] = 0xff

    const res = validateImageBuffer(hugeBuffer)
    expect(res.valid).toBe(false)
    expect(res.error).toContain('8 MB')
  })

  it('menolak buffer kosong atau format tidak didukung', () => {
    expect(validateImageBuffer(Buffer.alloc(0)).valid).toBe(false)
    expect(validateImageBuffer(Buffer.from('Bukan gambar sama sekali')).valid).toBe(false)
  })
})
