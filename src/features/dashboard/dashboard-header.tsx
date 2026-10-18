'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import {
  Settings,
  HelpCircle,
  LogOut,
  X,
  FileSpreadsheet,
  Smartphone,
  Languages,
} from 'lucide-react'

import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { useI18n } from '@/lib/i18n/context'

interface DashboardHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  sheetId?: string | null
  onSignOut: () => Promise<void>
}

export function DashboardHeader({ user, sheetId, onSignOut }: DashboardHeaderProps) {
  const { toggleLocale, t } = useI18n()
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeModal, setActiveModal] = useState<'settings' | 'help' | null>(null)
  const [mounted, setMounted] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Lock background scroll when modal is active
  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [activeModal])

  const firstName = user.name?.split(' ')[0] ?? 'Kamu'
  const userInitial = (user.name?.charAt(0) ?? 'U').toUpperCase()

  // Close dropdown menu on outside click or escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        setActiveModal(null)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 'var(--space-2)',
        position: 'relative',
      }}
    >
      <div>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--color-text)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          FINANCE.
        </h1>
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
            marginTop: '4px',
            fontWeight: 500,
          }}
        >
          {t('greeting')}, {firstName} 👋
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }} ref={menuRef}>
        <ThemeToggle />

        <LanguageToggle />

        {/* Avatar button with interactive dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            aria-label={t('accountMenu')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-text)',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
              transition: 'transform var(--duration-fast)',
              boxShadow: menuOpen ? '0 0 0 2px var(--color-accent)' : 'none',
            }}
          >
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? 'avatar'}
                width={40}
                height={40}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            ) : (
              userInitial
            )}
          </button>

          {/* Dropdown Menu — Identik dengan referensi */}
          {menuOpen && (
            <div
              className="animate-scale-in"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '210px',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-lg)',
                padding: '6px',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  setActiveModal('settings')
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color var(--duration-fast)',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = 'var(--color-surface-raised)')
                }
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Settings size={16} color="var(--color-text-muted)" />
                {t('settings')}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  setActiveModal('help')
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color var(--duration-fast)',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = 'var(--color-surface-raised)')
                }
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <HelpCircle size={16} color="var(--color-text-muted)" />
                {t('help')}
              </button>

              <button
                type="button"
                onClick={() => {
                  toggleLocale()
                  setMenuOpen(false)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color var(--duration-fast)',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = 'var(--color-surface-raised)')
                }
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Languages size={16} color="var(--color-text-muted)" />
                {t('switchLangOption')}
              </button>

              <div
                style={{
                  height: '1px',
                  backgroundColor: 'var(--color-border)',
                  margin: '4px 6px',
                }}
              />

              <form action={onSignOut} style={{ width: '100%' }}>
                <button
                  type="submit"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--color-error)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color var(--duration-fast)',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = 'var(--color-surface-raised)')
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <LogOut size={16} color="var(--color-error)" />
                  {t('logout')}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Pengaturan */}
      {mounted &&
        activeModal === 'settings' &&
        createPortal(
          <div
            className="animate-fade-in"
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: 'var(--space-4)',
            }}
            onClick={() => setActiveModal(null)}
          >
            <div
              className="animate-scale-in"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)',
                padding: 'var(--space-5)',
                width: '100%',
                maxWidth: '380px',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <h2
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    margin: 0,
                  }}
                >
                  {t('modalSettingsTitle')}
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div
                  style={{
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--color-surface-raised)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    {t('labelGoogleAccount')}
                  </p>
                  <p
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      margin: '2px 0 0 0',
                    }}
                  >
                    {user.name} ({user.email})
                  </p>
                </div>

                {sheetId && (
                  <div
                    style={{
                      padding: 'var(--space-3)',
                      backgroundColor: 'var(--color-surface-raised)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: 0 }}>
                      {t('labelGoogleSheets')}
                    </p>
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${sheetId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: 'var(--color-success)',
                        textDecoration: 'none',
                        marginTop: '4px',
                      }}
                    >
                      <FileSpreadsheet size={15} />
                      {t('linkOpenSheets')}
                    </a>
                  </div>
                )}

                <div
                  style={{
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--color-surface-raised)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    {t('labelIphoneShortcut')}
                  </p>
                  <Link
                    href="/pair"
                    prefetch={true}
                    onClick={() => setActiveModal(null)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'var(--color-accent)',
                      textDecoration: 'none',
                      marginTop: '4px',
                    }}
                  >
                    <Smartphone size={15} />
                    {t('linkSetupShortcut')}
                  </Link>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{
                  width: '100%',
                  minHeight: '44px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accent-text)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                {t('btnClose')}
              </button>
            </div>
          </div>,
          document.body,
        )}

      {/* Modal: Bantuan */}
      {mounted &&
        activeModal === 'help' &&
        createPortal(
          <div
            className="animate-fade-in"
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: 'var(--space-4)',
            }}
            onClick={() => setActiveModal(null)}
          >
            <div
              className="animate-scale-in"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)',
                padding: 'var(--space-5)',
                width: '100%',
                maxWidth: '390px',
                maxHeight: '85vh',
                overflowY: 'auto',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <h2
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    margin: 0,
                  }}
                >
                  {t('modalHelpTitle')}
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div
                  style={{
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--color-surface-raised)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: 'var(--color-text)',
                      margin: 0,
                    }}
                  >
                    {t('guideBackTapTitle')}
                  </p>
                  <p
                    style={{
                      fontSize: '0.76rem',
                      color: 'var(--color-text-muted)',
                      margin: '4px 0 0 0',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {t('guideBackTapText')}
                  </p>
                </div>

                <div
                  style={{
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--color-surface-raised)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: 'var(--color-text)',
                      margin: 0,
                    }}
                  >
                    {t('guidePwaTitle')}
                  </p>
                  <p
                    style={{
                      fontSize: '0.76rem',
                      color: 'var(--color-text-muted)',
                      margin: '4px 0 0 0',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {t('guidePwaText')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{
                  width: '100%',
                  minHeight: '44px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accent-text)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                {t('btnGotIt')}
              </button>
            </div>
          </div>,
          document.body,
        )}
    </header>
  )
}
