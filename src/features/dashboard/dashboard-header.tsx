'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Settings,
  HelpCircle,
  MessageSquare,
  LogOut,
  X,
  FileSpreadsheet,
  Smartphone,
  CheckCircle2,
} from 'lucide-react'

import { ThemeToggle } from '@/components/ui/theme-toggle'

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
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeModal, setActiveModal] = useState<'settings' | 'help' | 'feedback' | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedbackText.trim()) return
    setFeedbackSent(true)
    setTimeout(() => {
      setFeedbackSent(false)
      setFeedbackText('')
      setActiveModal(null)
    }, 1500)
  }

  return (
    <>
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
            Halo, {firstName} 👋
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }} ref={menuRef}>
          <ThemeToggle />

          {/* Avatar button with interactive dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              aria-label="Menu akun"
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
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-raised)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Settings size={16} color="var(--color-text-muted)" />
                  Pengaturan
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
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-raised)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <HelpCircle size={16} color="var(--color-text-muted)" />
                  Bantuan
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    setActiveModal('feedback')
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
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-raised)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <MessageSquare size={16} color="var(--color-text-muted)" />
                  Beri masukan
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
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-raised)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LogOut size={16} color="var(--color-error)" />
                    Keluar
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Floating Bantuan Pill Button — Mirip referensi di pojok kanan bawah */}
      <button
        type="button"
        onClick={() => setActiveModal('help')}
        aria-label="Buka bantuan"
        style={{
          position: 'fixed',
          bottom: 'calc(var(--space-5) + env(safe-area-inset-bottom))',
          right: 'var(--space-4)',
          zIndex: 40,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-accent)',
          color: 'var(--color-accent-text)',
          border: 'none',
          boxShadow: 'var(--shadow-lg)',
          fontSize: '0.78rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'transform var(--duration-fast)',
        }}
      >
        <HelpCircle size={14} />
        Bantuan
      </button>

      {/* Modal: Pengaturan */}
      {activeModal === 'settings' && (
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
            zIndex: 60,
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                Pengaturan
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
                <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: 0 }}>Akun Google</p>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', margin: '2px 0 0 0' }}>
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
                    Google Spreadsheet
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
                    Buka Google Sheets Pribadi →
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
                  Shortcut iPhone (Back Tap)
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
                  Hubungkan / Pasang Ulang Shortcut →
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
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal: Bantuan */}
      {activeModal === 'help' && (
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
            zIndex: 60,
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                Bantuan & Panduan
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
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                  ⚡ Cara Catat dengan Back Tap
                </p>
                <p style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                  1. Ambil screenshot bukti transfer/struk di iPhone.<br />
                  2. Ketuk 2x bagian belakang iPhone.<br />
                  3. Transaksi otomatis diekstrak AI dan masuk ke Google Sheets & Dashboard ini!
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
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                  📱 Pasang di Layar Utama (Add to Home Screen)
                </p>
                <p style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                  1. Buka website ini di Safari iPhone.<br />
                  2. Ketuk ikon Bagikan (Share).<br />
                  3. Pilih &quot;Tambah ke Layar Utama&quot; (Add to Home Screen).
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
              Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Modal: Beri Masukan */}
      {activeModal === 'feedback' && (
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
            zIndex: 60,
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                Beri Masukan
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

            {feedbackSent ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: 'var(--space-4) 0',
                  gap: '8px',
                }}
              >
                <CheckCircle2 size={36} color="var(--color-success)" />
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                  Terima kasih atas masukanmu!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Tulis saran atau kendala yang kamu temukan..."
                  rows={4}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                    resize: 'none',
                  }}
                />
                <button
                  type="submit"
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
                  Kirim Masukan
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
