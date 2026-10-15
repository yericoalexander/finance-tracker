import { render, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SplashScreenCoordinator } from './splash-screen'

describe('SplashScreenCoordinator', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    document.getElementById('app-splash')?.remove()
  })

  it('menambahkan kelas fade-out dan menghapus splash screen dari DOM', () => {
    const splash = document.createElement('div')
    splash.id = 'app-splash'
    document.body.appendChild(splash)

    render(<SplashScreenCoordinator />)

    expect(splash.classList.contains('app-splash-fade-out')).toBe(false)

    // Majukan timer melewati delay dismiss (200ms)
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(splash.classList.contains('app-splash-fade-out')).toBe(true)

    // Majukan timer melewati durasi transisi (240ms)
    act(() => {
      vi.advanceTimersByTime(240)
    })
    expect(document.getElementById('app-splash')).toBeNull()
  })

  it('tidak error jika elemen #app-splash tidak ditemukan', () => {
    expect(() => {
      render(<SplashScreenCoordinator />)
      act(() => {
        vi.advanceTimersByTime(500)
      })
    }).not.toThrow()
  })
})
