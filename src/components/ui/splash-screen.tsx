'use client'

import { useEffect } from 'react'

const DISMISS_DELAY_MS = 200
const TRANSITION_DURATION_MS = 240

export function SplashScreenCoordinator() {
  useEffect(() => {
    const splash = document.getElementById('app-splash')
    if (!splash) return

    // Allow a subtle minimum frame duration so the animation doesn't jarringly blink
    const timer = setTimeout(() => {
      splash.classList.add('app-splash-fade-out')

      const removeTimer = setTimeout(() => {
        splash.remove()
      }, TRANSITION_DURATION_MS)

      return () => clearTimeout(removeTimer)
    }, DISMISS_DELAY_MS)

    return () => clearTimeout(timer)
  }, [])

  return null
}
