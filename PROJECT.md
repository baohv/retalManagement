# 🏠 Quản Lý Phòng Trọ

Hệ thống quản lý phòng trọ toàn diện — Next.js + Prisma + SQLite/PostgreSQL

## Công nghệ

| Layer | Công nghệ |
|-------|-----------|
| Framework | Next.js 16.2 (App Router) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ORM | Prisma 6 |
| UI | Tailwind CSS + Outfit font |
| Auth | HMAC-signed session cookies |
| Charts | Recharts |

## Yêu cầu

- Node.js 20+
- npm

## Cài đặt

```bash
npm install
cp .env.example .env
# Sửa DATABASE_URL nếu cần
bash scripts/setup.sh
npm run dev
```

## Deploy lên Vercel

### Bước 1: Push lên GitHub
```bash
cd ..
git init
git add .
git commit -m "Initial commit"
gh repo create quan-ly-phong-tro --public --push
# hoặc: git remote add origin <url> && git push -u origin main
```

### Bước 2: Import vào Vercel
1. Vào https://vercel.com/new
2. Import GitHub repo
3. Set Framework = Next.js
4. Build Command = `npx prisma generate && npx next build`
5. Add Environment Variables:
   - `DATABASE_URL` = PostgreSQL URL (từ Vercel Postgres / Neon)
   - `SESSION_SECRET` = chuỗi bí mật bất kỳ

### Bước 3: Database (PostgreSQL)
Vercel không hỗ trợ SQLite. Cần dùng PostgreSQL:
- **Option A:** Vercel Postgres (trong Vercel dashboard → Storage → Create → Postgres)
- **Option B:** Neon (https://neon.tech — free tier 10GB)
- **Option C:** Railway (https://railway.app)

Sau khi có PostgreSQL URL, chạy:
```bash
npx prisma db push
npx prisma generate
```

### Hoặc deploy lên Railway (dễ hơn — hỗ trợ SQLite)
Railway hỗ trợ persistent volumes, có thể chạy SQLite:
1. Fork repo
2. Vào https://railway.app/new
3. Chọn GitHub repo
4. Add volume cho thư mục `prisma/`
5. Build: `npm install && npx prisma generate && npx next build`
6. Start: `npx next start`

## Tài khoản mặc định

- **Admin:** admin@example.com / admin123

## Routes

- `/login` — Đăng nhập
- `/register` — Đăng ký
- `/dashboard` — Tổng quan
- `/rooms` — Quản lý phòng
- `/tenants` — Khách thuê
- `/contracts` — Hợp đồng
- `/invoices` — Hóa đơn
- `/payments` — Thanh toán
- `/meter-readings` — Chỉ số điện/nước
- `/maintenance` — Bảo trì
- `/reports` — Báo cáo
- `/users` — Quản lý người dùng (admin)
- `/my-room` — Cổng tenant
- `/profile` — Thông tin tài khoản
