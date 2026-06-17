# Quản Lý Phòng Trọ

## Tech Stack
- **Framework:** Next.js 16.2 (App Router, Turbopack)
- **Database:** Prisma 6 + SQLite (dev) / PostgreSQL (prod)
- **UI:** Tailwind CSS + Outfit font (next/font/google)
- **Auth:** HMAC-signed httpOnly session cookies
- **Charts:** Recharts
- **Tests:** Playwright (6 E2E tests)

## Architecture
- `src/app/(app)/` — 22 authenticated pages with shared sidebar layout
- `src/app/login/`, `register/`, `forgot-password/` — public pages
- `src/app/api/` — 15 REST API routes (CSRF protected)
- `src/components/` — 7 shared components (Badge, Card, Table, StatsCard, EmptyState, LoadingSkeleton, PageHeader)
- `src/lib/` — 8 modules (prisma, auth, permissions, labels, csrf, rate-limit, reset-tokens, api-helpers)

## Roles & Permissions
- 3 roles: `admin`, `staff`, `tenant` — defined in `src/lib/permissions.ts`
- Admin: full access including user management + delete
- Staff: CRUD but no delete, no user mgmt, no export
- Tenant: only `/my-room` (own invoices, contract, room info)
- Role encoded in session token during login

## Database Models (10)
User, Room, Tenant, Contract, ContractTenant, Invoice, InvoiceItem, Payment, MeterReading, MaintenanceRequest

## Key Patterns
- Server components fetch data via Prisma directly
- Client components use `fetch('/api/...')` or `useEffect`
- All mutations go through API routes with CSRF + auth guards
- Session cookie: base64url(HMAC(payload)), httpOnly, 7 day expiry
- Rate limiting: namespace-based in `lib/rate-limit.ts`

## Build & Deploy
- Dev: `npm run dev` (SQLite at `file:./dev.db`)
- Build: `npx next build`
- Prod DB: PostgreSQL via Neon (swap to `schema.postgres.prisma`)
- Deploy: Vercel (`vercel --prod`)
- Seed: `bash scripts/setup.sh` or `node prisma/seed.js`

## Common Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npx playwright test  # E2E tests
npx prisma db push   # Sync schema to DB
npx prisma generate  # Regenerate client
node prisma/seed.js  # Seed sample data
```
