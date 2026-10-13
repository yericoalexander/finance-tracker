# Finance Tracker

Catat pengeluaran dari screenshot iPhone langsung ke Google Sheets milikmu — tanpa App Store.

## Cara Kerja

```
Back Tap → Shortcut iOS → POST /api/capture → model vision → Google Sheets
```

## Prasyarat

- Node.js 20+
- Akun [Neon](https://neon.tech) (Postgres gratis)
- Google Cloud project dengan Sheets API + Drive API aktif
- OAuth Client ID (Web application)

## Mulai Lokal

```bash
# 1. Clone
git clone <repo-url>
cd finance-tracker

# 2. Install dependencies
npm install

# 3. Salin dan isi env
cp .env.example .env.local
# Edit .env.local dengan nilai nyata

# 4. Jalankan dev server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Deskripsi |
|--------|-----------|
| `npm run dev` | Dev server (hot reload) |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit & integration test |
| `npm run db:push` | Push skema ke database |
| `npm run db:studio` | Drizzle Studio (GUI) |

## Struktur Proyek

```
src/
├── app/              # Next.js App Router (routes)
├── features/         # Logic per fitur (auth, capture, dashboard, ...)
├── lib/              # Shared utilities (db, google, crypto, ai, env)
│   ├── db/           # Drizzle client + schema
│   ├── google/       # Google Sheets & OAuth wrappers
│   ├── crypto/       # AES-256-GCM helpers
│   └── env.ts        # Validasi env (satu-satunya tempat baca process.env)
├── components/
│   └── ui/           # shadcn/ui components
└── test/             # Test setup
```

## Fase Pengembangan

- [x] **Fase 0** — Scaffold + tooling + env
- [x] **Fase 1** — Auth Google + pembuatan Sheet otomatis
- [x] **Fase 2** — Pairing perangkat + /api/capture + ekstraksi AI Gemini Vision
- [x] **Fase 3** — Dashboard + antrean "Perlu dicek"
- [ ] **Fase 4** — Onboarding + landing + PWA
- [ ] **Fase 5** — Tes E2E, hardening & panduan Shortcut iOS

## Deploy ke Vercel

1. Push ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Isi semua env dari `.env.example` di dashboard Vercel
4. Set `NEXTAUTH_URL` ke domain produksi
5. Update Redirect URI di Google Cloud Console ke domain produksi
