'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, Check, AlertCircle, Loader2 } from 'lucide-react'

import { updateReminderSettingsAction } from './reminder-actions'
import { formatRupiah } from '@/lib/ai/currency'
import { useI18n } from '@/lib/i18n/context'
import type { ReminderSetting } from '@/lib/db/schema'

interface BudgetModalProps {
  isOpen: boolean
  onClose: () => void
  currentSetting?: ReminderSetting | null
  currentTotal: number
  onSaved: (saved: ReminderSetting) => void
}

const PRESET_LIMITS = [1000000, 1500000, 2000000, 3000000]

export function BudgetModal({
  isOpen,
  onClose,
  currentSetting,
  currentTotal,
  onSaved,
}: BudgetModalProps) {
  const { t } = useI18n()
  const [mounted, setMounted] = useState(false)
  const [isEnabled, setIsEnabled] = useState(currentSetting?.isEnabled ?? true)
  const [limitInput, setLimitInput] = useState(
    currentSetting?.monthlyLimitIdr ? String(currentSetting.monthlyLimitIdr) : '1500000',
  )
  const [customMsg, setCustomMsg] = useState(currentSetting?.customMessage ?? '')
  const [warningThreshold, setWarningThreshold] = useState<number>(() => {
    if (currentSetting?.warningThresholdPercent !== undefined) {
      return currentSetting.warningThresholdPercent
    }
    return currentSetting?.earlyWarningEnabled !== false ? 90 : 0
  })
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const wasOpenRef = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Inisialisasi hanya saat modal dibuka dari tertutup (mencegah reset ke default saat memilih opsi chip)
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setIsEnabled(currentSetting?.isEnabled ?? true)
      setLimitInput(currentSetting?.monthlyLimitIdr ? String(currentSetting.monthlyLimitIdr) : '1500000')
      setCustomMsg(currentSetting?.customMessage ?? '')
      const initialThreshold =
        currentSetting?.warningThresholdPercent !== undefined
          ? currentSetting.warningThresholdPercent
          : currentSetting?.earlyWarningEnabled !== false
            ? 90
            : 0
      setWarningThreshold(initialThreshold)
      setErrorMsg(null)
      setSuccessMsg(null)
    }
    wasOpenRef.current = isOpen
  }, [isOpen, currentSetting])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!mounted || !isOpen) return null

  const numericLimit = parseInt(limitInput.replace(/\D/g, ''), 10) || 0

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (isEnabled && (!numericLimit || numericLimit < 10000)) {
      setErrorMsg(t('budgetMinLimitError'))
      return
    }

    setIsSaving(true)
    try {
      const res = await updateReminderSettingsAction({
        monthlyLimitIdr: isEnabled ? numericLimit : null,
        customMessage: customMsg.trim() || null,
        warningThresholdPercent: warningThreshold,
        earlyWarningEnabled: warningThreshold > 0 && warningThreshold < 100,
        isEnabled,
      })

      if (!res.ok || !res.data) {
        setErrorMsg(res.error ?? 'Gagal menyimpan pengaturan')
        return
      }

      setSuccessMsg(t('budgetSavedSuccess'))
      onSaved(res.data)
      setTimeout(() => {
        onClose()
      }, 600)
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan saat menyimpan')
    } finally {
      setIsSaving(false)
    }
  }

  return createPortal(
    <div
      className="animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 'var(--space-4)',
      }}
      onClick={onClose}
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
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal: Rapi, Ringkas, dan Informatif */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
              {t('budgetModalTitle')}
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              {t('budgetCurrentExpenses')}{' '}
              <strong style={{ color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>
                {formatRupiah(currentTotal)}
              </strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            style={{
              width: '36px',
              height: '36px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-md)',
              margin: '-4px -4px 0 0',
            }}
          >
            <X size={19} />
          </button>
        </div>

        {/* Feedback Alert */}
        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: 'var(--color-error-bg)',
              color: 'var(--color-error)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.78rem',
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.78rem',
            }}
          >
            <Check size={15} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {/* Toggle Utama: Sakelar Aktifkan */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
            }}
          >
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-text)' }}>
              {t('budgetActiveToggle')}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isEnabled}
              onClick={() => setIsEnabled(!isEnabled)}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isEnabled ? 'var(--color-accent)' : 'var(--color-border)',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background-color 200ms ease',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  display: 'block',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  position: 'absolute',
                  top: '3px',
                  left: isEnabled ? '23px' : '3px',
                  transition: 'left 200ms ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              />
            </button>
          </div>

          {isEnabled && (
            <>
              {/* Input Batas Pengeluaran */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label
                  htmlFor="budget-limit-input"
                  style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}
                >
                  {t('budgetLimitLabel')}
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 12px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    minHeight: '44px',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-muted)', marginRight: '6px' }}>
                    Rp
                  </span>
                  <input
                    id="budget-limit-input"
                    type="text"
                    inputMode="numeric"
                    placeholder="1.500.000"
                    value={numericLimit > 0 ? numericLimit.toLocaleString('id-ID') : ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '')
                      setLimitInput(raw)
                    }}
                    style={{
                      border: 'none',
                      outline: 'none',
                      backgroundColor: 'transparent',
                      width: '100%',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: 'var(--color-text)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  />
                </div>

                {/* Preset Chips Rapi (1 baris) */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                  {PRESET_LIMITS.map((amount) => {
                    const isSelected = numericLimit === amount
                    const label = `${amount / 1000000} Jt`
                    return (
                      <button
                        key={amount}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setLimitInput(String(amount))
                        }}
                        style={{
                          flex: 1,
                          padding: '7px 0',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '1px solid var(--color-text)' : '1px solid var(--color-border)',
                          backgroundColor: isSelected ? 'var(--color-text)' : 'var(--color-surface-raised)',
                          color: isSelected ? 'var(--color-surface)' : 'var(--color-text-muted)',
                          fontSize: '0.78rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 150ms ease',
                          textAlign: 'center',
                        }}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Ambang Peringatan Slider (Gaya iOS Limit Charge) */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  padding: '12px 14px',
                  backgroundColor: 'var(--color-surface-raised)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {/* Baris Atas: Label & Nilai Persentase */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)' }}>
                      {t('budgetWarningThresholdLabel')}
                    </p>
                    <p
                      style={{
                        margin: '2px 0 0',
                        fontSize: '0.72rem',
                        color: 'var(--color-text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {warningThreshold === 0
                        ? t('budgetWarningThresholdOff')
                        : warningThreshold === 100
                          ? t('budgetWarningThreshold100', {
                              amount: formatRupiah(numericLimit),
                            })
                          : t('budgetWarningThresholdDesc', {
                              percent: warningThreshold,
                              amount: formatRupiah(Math.round((numericLimit * warningThreshold) / 100)),
                            })}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                      backgroundColor: warningThreshold === 0 ? 'var(--color-border)' : 'var(--color-accent)',
                      color: warningThreshold === 0 ? 'var(--color-text-muted)' : 'var(--color-accent-text)',
                      transition: 'all 150ms ease',
                      flexShrink: 0,
                    }}
                  >
                    {warningThreshold === 0 ? 'Mati' : `${warningThreshold}%`}
                  </div>
                </div>

                {/* Slider Range Track */}
                <div style={{ position: 'relative', width: '100%', padding: '2px 0' }}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={warningThreshold}
                    onChange={(e) => setWarningThreshold(Number(e.target.value))}
                    className="ios-range-slider"
                    style={{
                      background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${warningThreshold}%, var(--color-border) ${warningThreshold}%, var(--color-border) 100%)`,
                    }}
                    aria-label="Peringatan Pengeluaran"
                  />
                </div>

                {/* Quick Presets / Snap Ticks (Khas iPhone) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.68rem',
                    color: 'var(--color-text-muted)',
                    fontVariantNumeric: 'tabular-nums',
                    padding: '0 2px',
                  }}
                >
                  {[
                    { val: 0, label: 'Mati' },
                    { val: 50, label: '50%' },
                    { val: 75, label: '75%' },
                    { val: 90, label: '90%' },
                    { val: 100, label: '100%' },
                  ].map((tick) => {
                    const isCurrent = warningThreshold === tick.val
                    return (
                      <button
                        key={tick.val}
                        type="button"
                        onClick={() => setWarningThreshold(tick.val)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '4px 6px',
                          fontSize: 'inherit',
                          cursor: 'pointer',
                          color: isCurrent ? 'var(--color-accent)' : 'var(--color-text-muted)',
                          fontWeight: isCurrent ? 700 : 500,
                          fontFamily: 'inherit',
                          transition: 'color 150ms ease',
                          minHeight: '28px',
                        }}
                      >
                        {tick.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Input Pesan Kustom (Sederhana & Ringkas) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label
                    htmlFor="custom-msg-input"
                    style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}
                  >
                    {t('budgetCustomMsgLabel')}
                  </label>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    (Opsional)
                  </span>
                </div>
                <input
                  id="custom-msg-input"
                  type="text"
                  maxLength={100}
                  value={customMsg}
                  placeholder={t('budgetCustomMsgPlaceholder')}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    fontSize: '0.82rem',
                    color: 'var(--color-text)',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
                <p style={{ margin: '2px 0 0', fontSize: '0.71rem', color: 'var(--color-text-muted)' }}>
                  {t('budgetCustomMsgHint')}
                </p>
              </div>
            </>
          )}

          {/* Tombol Simpan (Selalu Terlihat & Nyaman) */}
          <button
            type="submit"
            disabled={isSaving}
            style={{
              width: '100%',
              minHeight: '44px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-text)',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'opacity 150ms ease',
              marginTop: '4px',
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {t('budgetSavingBtn')}
              </>
            ) : (
              t('budgetSaveBtn')
            )}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  )
}
