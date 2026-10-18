'use client'

import { AlertTriangle, Smartphone, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { revokeDeviceAction } from './actions'
import { useI18n } from '@/lib/i18n/context'

interface DeviceListItemProps {
  devices: Array<{
    id: string
    label: string
    lastSeenAt: string | null
    revokedAt: string | null
    createdAt: string
  }>
}

export function DeviceList({ devices }: DeviceListItemProps) {
  const router = useRouter()
  const { t, locale } = useI18n()
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleRevoke(deviceId: string) {
    if (!confirm(t('confirmRevoke'))) return

    setRevokingId(deviceId)
    setError(null)
    try {
      const res = await revokeDeviceAction(deviceId)
      if (!res.ok) {
        setError(res.error ?? t('errRevokeDevice'))
      } else {
        router.refresh()
      }
    } catch {
      setError(t('errNetworkRevoke'))
    } finally {
      setRevokingId(null)
    }
  }

  const activeDevices = devices.filter((d) => !d.revokedAt)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        padding: 'var(--space-5)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <Smartphone size={20} style={{ color: 'var(--color-accent)' }} />
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            margin: 0,
            color: 'var(--color-text)',
          }}
        >
          {t('connectedDevicesTitle', { count: activeDevices.length })}
        </h2>
      </div>

      {error && (
        <p style={{ color: 'var(--color-error)', fontSize: '0.8rem', margin: 0 }}>{error}</p>
      )}

      {activeDevices.length === 0 ? (
        <p
          style={{
            fontSize: '0.84rem',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            padding: 'var(--space-4) 0',
            margin: 0,
          }}
        >
          {t('noDevicesConnected')}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {activeDevices.map((device) => (
            <div
              key={device.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--color-surface-raised)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    color: 'var(--color-text)',
                  }}
                >
                  {device.label}
                </p>
                <p
                  style={{
                    margin: 'var(--space-1) 0 0 0',
                    fontSize: '0.75rem',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {device.lastSeenAt
                    ? `${t('lastActive')} ${new Date(device.lastSeenAt).toLocaleString(locale === 'id' ? 'id-ID' : 'en-US')}`
                    : `${t('connectedAt')} ${new Date(device.createdAt).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US')}`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleRevoke(device.id)}
                disabled={revokingId === device.id}
                aria-label={t('revokeAriaLabel', { label: device.label })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                  minHeight: '44px',
                  minWidth: '44px',
                  padding: `var(--space-2) var(--space-3)`,
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-error)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: revokingId === device.id ? 'not-allowed' : 'pointer',
                  opacity: revokingId === device.id ? 0.6 : 1,
                }}
              >
                {revokingId === device.id ? <AlertTriangle size={14} /> : <Trash2 size={14} />}
                <span>{t('btnRevoke')}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
