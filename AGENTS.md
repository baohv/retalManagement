# Quản Lý Phòng Trọ — Agent Instructions

## Project
Full-stack Next.js 16.2 (App Router) room rental management app.
Database: Prisma 6 + SQLite (dev) / PostgreSQL (prod).
UI: Tailwind CSS + Outfit font.

## Key Conventions
- Server components for data fetching, client components for interactivity
- All mutating API routes use CSRF protection (`validateOrigin`)
- Auth via HMAC-signed session cookies (httpOnly)
- Role-based access: admin / staff / tenant
- Use `lib/permissions.ts` for permission checks
- Use `lib/api-helpers.ts` for route handler wrappers

## Routes
- Pages under `(app)/` have sidebar layout
- Public: `/login`, `/register`, `/forgot-password`
- Tenant: `/my-room`
- Admin only: `/users`

## Database
- Dev: `file:./dev.db` (SQLite)
- Prod: `schema.postgres.prisma` → PostgreSQL
- Seed: `bash scripts/setup.sh` or `node prisma/seed.js`

## Build & Test
```bash
npm run dev        # Development
npm run build      # Production build
npx playwright test # E2E tests
```
