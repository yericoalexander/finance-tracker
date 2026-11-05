import React from 'react'

export interface CardBrandLogoProps {
  iconType: string
  name: string
  textColor: string
  size?: 'sm' | 'md'
  showName?: boolean
}

// 1. Bank Konvensional: BCA
function BcaIcon({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '6px',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
        <path d="M4 10h16v10H4z" fill="#003d79" />
        <path d="M12 3l9 6H3l9-6z" fill="#003d79" />
        <path d="M7 10v7M12 10v7M17 10v7" stroke="#ffffff" strokeWidth="1.5" />
      </svg>
    </div>
  )
}

// 2. Bank Konvensional: Mandiri
function MandiriIcon({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '6px',
        backgroundColor: '#0a2540',
        border: '1.5px solid #fbbf24',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <svg width={size * 0.72} height={size * 0.72} viewBox="0 0 24 24" fill="none">
        {/* Mandiri signature golden ribbon wave */}
        <path
          d="M3 14c4-6 10-6 18-2"
          stroke="#fbbf24"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M4 18c3-3 7-3 12-1"
          stroke="#ffffff"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

// 3. Bank Konvensional: BRI
function BriIcon({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '6px',
        backgroundColor: '#00529c',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontWeight: 900,
        fontSize: size >= 24 ? '11px' : '9px',
        letterSpacing: '-0.5px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        flexShrink: 0,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      BB
    </div>
  )
}

// 4. Bank Konvensional: BNI
function BniIcon({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '6px',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          color: '#005e6a',
          fontWeight: 900,
          fontSize: size >= 24 ? '10px' : '8px',
          letterSpacing: '-0.2px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        BNI
      </span>
      <div
        style={{
          position: 'absolute',
          top: '2px',
          right: '2px',
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: '#f37021',
        }}
      />
    </div>
  )
}

// 5. Bank Konvensional: CIMB Niaga
function CimbIcon({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '6px',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
        <path d="M12 4l9 16H3l9-16z" fill="#780016" />
        <path d="M12 9l5 9H7l5-9z" fill="#ffffff" />
      </svg>
    </div>
  )
}

// 6. Bank Konvensional: OCBC
function OcbcIcon({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#c4121a',
        fontWeight: 900,
        fontSize: size >= 24 ? '15px' : '12px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        flexShrink: 0,
        lineHeight: 1,
      }}
    >
      ✺
    </div>
  )
}

// 7. Bank Konvensional: Danamon
function DanamonIcon({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '6px',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
        {/* Danamon dual orange & yellow interlocking squares */}
        <rect x="3" y="3" width="10" height="10" rx="2" fill="#ea580c" />
        <rect x="11" y="11" width="10" height="10" rx="2" fill="#facc15" />
      </svg>
    </div>
  )
}

// 8. Bank Konvensional: Permata
function PermataIcon({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '6px',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
        {/* Permata multi-faceted diamond flower */}
        <circle cx="12" cy="7" r="3.5" fill="#10b981" />
        <circle cx="17" cy="12" r="3.5" fill="#3b82f6" />
        <circle cx="12" cy="17" r="3.5" fill="#ec4899" />
        <circle cx="7" cy="12" r="3.5" fill="#f59e0b" />
      </svg>
    </div>
  )
}

// 9. Bank Konvensional: BTN
function BtnIcon({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '6px',
        backgroundColor: '#003366',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontWeight: 900,
        fontSize: size >= 24 ? '10px' : '8px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        flexShrink: 0,
        border: '1.2px solid #facc15',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      BTN
    </div>
  )
}

// 10. Bank Konvensional: Maybank
function MaybankIcon({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '6px',
        backgroundColor: '#ffc800',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
        {/* Maybank tiger head silhouette badge */}
        <circle cx="12" cy="12" r="9" fill="#1f1f23" />
        <path d="M8 8l2 3h4l2-3" stroke="#ffc800" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="10" cy="12" r="1.2" fill="#ffc800" />
        <circle cx="14" cy="12" r="1.2" fill="#ffc800" />
        <path d="M10 15h4" stroke="#ffc800" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </div>
  )
}

// 11. Bank Konvensional: Panin Bank
function PaninIcon({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '6px',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
        {/* Panin cross / 4-square geometric emblem */}
        <rect x="5" y="5" width="6" height="6" fill="#005a36" />
        <rect x="13" y="5" width="6" height="6" fill="#007e4c" />
        <rect x="5" y="13" width="6" height="6" fill="#007e4c" />
        <rect x="13" y="13" width="6" height="6" fill="#005a36" />
      </svg>
    </div>
  )
}

// 12. Bank Konvensional: BSI (Bank Syariah Indonesia)
function BsiIcon({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '6px',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
        {/* BSI geometric star motif */}
        <path
          d="M12 2l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 16.3 6.4 19.2l1.1-6.2L3 8.6l6.2-.9L12 2z"
          fill="#008f9c"
        />
        <circle cx="12" cy="11" r="2.5" fill="#f59e0b" />
      </svg>
    </div>
  )
}

// 13. Bank Digital: Krom
function KromIcon({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '7px',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#5b21b6',
        fontWeight: 900,
        fontSize: size >= 24 ? '16px' : '13px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        flexShrink: 0,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        lineHeight: 1,
      }}
    >
      k
    </div>
  )
}

// 14. Bank Digital: Jenius
function JeniusIcon({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#0284c7',
        fontWeight: 900,
        fontSize: size >= 24 ? '14px' : '11px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        flexShrink: 0,
        position: 'relative',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        lineHeight: 1,
      }}
    >
      j
      <div
        style={{
          position: 'absolute',
          top: '3px',
          right: '5px',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          backgroundColor: '#ea580c',
        }}
      />
    </div>
  )
}

// 15. Bank Digital: Bank Jago
function JagoIcon({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '7px',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
        {/* Origami Jago flying bird */}
        <path d="M3 13l7-8v6l9-7-4 12-6-3-6 5v-5z" fill="#ea580c" />
      </svg>
    </div>
  )
}

// 16. Bank Digital: SeaBank
function SeabankIcon({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
        {/* SeaBank double wave */}
        <path
          d="M4 11c3-3 6-3 9 0s6 3 8 0"
          stroke="#f05a22"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M4 15c3-3 6-3 9 0s6 3 8 0"
          stroke="#f05a22"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

// 17. Bank Digital: Blu by BCA
function BluIcon({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '7px',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#0052cc',
        fontWeight: 900,
        fontSize: size >= 24 ? '11px' : '9px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        flexShrink: 0,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      blu
    </div>
  )
}

// 18. Bank Digital: Allo Bank
function AlloIcon({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
        {/* Allo infinity loop */}
        <path
          d="M7.5 9a3.5 3.5 0 100 6c2 0 3-1.5 4.5-3 1.5-1.5 2.5-3 4.5-3a3.5 3.5 0 110 6c-2 0-3-1.5-4.5-3-1.5-1.5-2.5-3-4.5-3z"
          stroke="#6d28d9"
          strokeWidth="2.2"
        />
      </svg>
    </div>
  )
}

// 19. Bank Digital: Superbank
function SuperbankIcon({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '7px',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#059669',
        fontWeight: 900,
        fontSize: size >= 24 ? '13px' : '10px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        flexShrink: 0,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      S✦
    </div>
  )
}

// 20. Bank Digital: Line Bank
function LineBankIcon({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '7px',
        backgroundColor: '#06c755',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontWeight: 900,
        fontSize: size >= 24 ? '8px' : '7px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        flexShrink: 0,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        letterSpacing: '-0.2px',
      }}
    >
      LINE
    </div>
  )
}

// 21. Bank Digital: Bank Raya
function RayaIcon({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '7px',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
        {/* Raya sparkle star */}
        <path
          d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2 2-7z"
          fill="#1d4ed8"
        />
      </svg>
    </div>
  )
}

// 22. E-Wallet: GoPay
function GopayIcon({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: `${size * 0.52}px`,
          height: `${size * 0.52}px`,
          borderRadius: '50%',
          border: '2.5px solid #0081a7',
          backgroundColor: '#00afb9',
        }}
      />
    </div>
  )
}

// 23. E-Wallet: OVO
function OvoIcon({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#4c1d95',
        fontWeight: 900,
        fontSize: size >= 24 ? '8px' : '7px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        flexShrink: 0,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        letterSpacing: '-0.3px',
      }}
    >
      OVO
    </div>
  )
}

// 24. E-Wallet: DANA
function DanaIcon({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '6px',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#118eea',
        fontWeight: 900,
        fontSize: size >= 24 ? '8px' : '7px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        flexShrink: 0,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        letterSpacing: '-0.3px',
      }}
    >
      DANA
    </div>
  )
}

// 25. Bank Digital: N26
function N26Icon({ textColor }: { textColor: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
      <span
        style={{
          fontSize: '1.05rem',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: textColor,
          borderBottom: '2px solid currentColor',
          lineHeight: 1,
          paddingBottom: '2px',
        }}
      >
        N̄
      </span>
      <span style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', color: textColor }}>
        26
      </span>
    </div>
  )
}

// 26. Apple Card
function AppleCardIcon({ textColor, size = 22 }: { textColor: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 170 170" fill={textColor}>
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.85-12.01-14.42-6.53-9.98-11.75-21.28-15.66-33.89-3.91-12.61-5.87-24.35-5.87-35.22 0-14.35 3.48-26.31 10.45-35.89 6.96-9.57 15.65-14.42 26.06-14.55 4.35 0 9.28 1.16 14.79 3.47 5.51 2.32 9.07 3.53 10.68 3.63 2.12-.21 5.92-1.48 11.41-3.8 5.48-2.32 10.25-3.32 14.3-3 10.55.63 19.33 4.58 26.34 11.83-8.28 5.01-12.35 11.96-12.21 20.85.14 7.6 3.04 14.12 8.71 19.55 5.67 5.43 12.39 8.5 20.16 9.22-2.12 6.53-4.57 12.82-7.35 18.88zm-33.82-120.73c0 5.86-2.13 11.51-6.39 16.94-5.05 6.2-11.28 9.94-18.68 11.22-.21-1.27-.32-2.33-.32-3.17 0-5.71 2.33-11.41 6.99-17.1 4.65-5.69 10.6-9.15 17.84-10.37.21 1.05.56 1.88.56 2.48z" />
    </svg>
  )
}

// 27. EMV Smart Chip for Luxury / Custom Metal cards
function EmvSmartChip({ size = 26 }: { size?: number }) {
  const height = Math.round(size * 0.77)
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${height}px`,
        borderRadius: '4px',
        background: 'linear-gradient(135deg, #d4af37 0%, #f9e076 50%, #aa8c2c 100%)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        border: '1px solid rgba(0, 0, 0, 0.2)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '3px',
          border: '1px solid rgba(0, 0, 0, 0.25)',
          borderRadius: '2px',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '1px',
          background: 'rgba(0, 0, 0, 0.25)',
        }}
      />
    </div>
  )
}

export function BankBrandBadge({
  iconType,
  textColor,
  size = 26,
}: {
  iconType: string
  textColor: string
  size?: number
}) {
  switch (iconType) {
    case 'bca':
      return <BcaIcon size={size} />
    case 'mandiri':
      return <MandiriIcon size={size} />
    case 'bri':
      return <BriIcon size={size} />
    case 'bni':
      return <BniIcon size={size} />
    case 'cimb':
      return <CimbIcon size={size} />
    case 'ocbc':
      return <OcbcIcon size={size} />
    case 'danamon':
      return <DanamonIcon size={size} />
    case 'permata':
      return <PermataIcon size={size} />
    case 'btn':
      return <BtnIcon size={size} />
    case 'maybank':
      return <MaybankIcon size={size} />
    case 'panin':
      return <PaninIcon size={size} />
    case 'bsi':
      return <BsiIcon size={size} />
    case 'krom':
      return <KromIcon size={size} />
    case 'jenius':
      return <JeniusIcon size={size} />
    case 'jago':
      return <JagoIcon size={size} />
    case 'seabank':
      return <SeabankIcon size={size} />
    case 'blu':
      return <BluIcon size={size} />
    case 'allo':
      return <AlloIcon size={size} />
    case 'superbank':
      return <SuperbankIcon size={size} />
    case 'linebank':
      return <LineBankIcon size={size} />
    case 'raya':
      return <RayaIcon size={size} />
    case 'gopay':
      return <GopayIcon size={size} />
    case 'ovo':
      return <OvoIcon size={size} />
    case 'dana':
      return <DanaIcon size={size} />
    case 'n26':
      return <N26Icon textColor={textColor} />
    case 'apple':
      return <AppleCardIcon textColor={textColor} size={size} />
    default:
      return <EmvSmartChip size={size} />
  }
}

export function CardBrandLogo({
  iconType,
  name,
  textColor,
  size = 'md',
  showName = true,
}: CardBrandLogoProps) {
  const pixelSize = size === 'sm' ? 20 : 26

  // Special inline typographic cards (N26)
  if (iconType === 'n26') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <N26Icon textColor={textColor} />
        {showName && name && name !== 'N26 Matte' && name !== 'N26' && (
          <span style={{ fontSize: '0.94rem', fontWeight: 800, letterSpacing: '-0.02em', color: textColor }}>
            {name}
          </span>
        )}
      </div>
    )
  }

  // Apple Card with clean fruit logo + name
  if (iconType === 'apple') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <AppleCardIcon textColor={textColor} size={pixelSize} />
        {showName && (
          <span style={{ fontSize: '0.94rem', fontWeight: 700, letterSpacing: '-0.02em', color: textColor }}>
            {name || 'Apple Card'}
          </span>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <BankBrandBadge iconType={iconType} textColor={textColor} size={pixelSize} />
      {showName && (
        <span
          style={{
            fontSize: '0.94rem',
            fontWeight: 800,
            letterSpacing: '0.02em',
            color: textColor,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name}
        </span>
      )}
    </div>
  )
}

