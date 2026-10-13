'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (stored) {
      setTheme(stored)
      document.documentElement.setAttribute('data-theme', stored)
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
    try {
      localStorage.setItem('theme', nextTheme)
    } catch {
      // Ignore if localStorage is disabled
    }
  }

  // Sebelum mount, render placeholder seukuran tombol agar tidak loncat
  if (!mounted) {
    return (
      <div
        style={{
          width: '44px',
          height: '44px',
        }}
      />
    )
  }

  const isLight = theme === 'light'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? 'Beralih ke mode gelap' : 'Beralih ke mode terang'}
      title={isLight ? 'Mode Gelap' : 'Mode Terang'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '44px',
        minWidth: '44px',
        padding: '0 var(--space-2)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--color-text)',
        cursor: 'pointer',
        transition: 'all var(--duration-fast) var(--ease-default)',
      }}
    >
      {isLight ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  )
}
