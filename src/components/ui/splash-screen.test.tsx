import { render, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AppSplashScreen } from './splash-screen'

describe('AppSplashScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('merender splash screen lalu menerapkan fade-out dan unmount secara aman lewat React', () => {
    render(<AppSplashScreen />)

    const splash = document.getElementById('app-splash')
    expect(splash).not.toBeNull()
    expect(splash?.classList.contains('app-splash-fade-out')).toBe(false)

    // Majukan timer melewati delay dismiss (200ms)
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(splash?.classList.contains('app-splash-fade-out')).toBe(true)

    // Majukan timer melewati durasi transisi (240ms)
    act(() => {
      vi.advanceTimersByTime(240)
    })
    expect(document.getElementById('app-splash')).toBeNull()
  })
})
