# 🏠 Quản Lý Phòng Trọ

> Hệ thống quản lý phòng trọ toàn diện — Next.js 16 + Prisma + Tailwind CSS

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel)](https://retal-management-bo69dssk0-ewings.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-000?logo=next.js)](https://nextjs.org)
[![Database](https://img.shields.io/badge/DB-PostgreSQL-4169E1?logo=postgresql)](https://neon.tech)

---

## ✨ Tính năng

| Module | Chức năng chính |
|--------|----------------|
| 📊 Dashboard | Tổng quan, alerts, biểu đồ doanh thu |
| 🏠 Phòng trọ | CRUD, quản lý trạng thái, tiện ích |
| 👤 Khách thuê | CRUD, lịch sử thuê trọ, tìm kiếm |
| 📝 Hợp đồng | Tạo, gia hạn, chấm dứt, hoàn cọc |
| 🧾 Hóa đơn | Tạo hàng loạt/cá nhân, điện/nước/internet/rác |
| 💰 Thanh toán | Ghi nhận, tự động cập nhật trạng thái |
| ⚡ Chỉ số | Nhập chỉ số cũ/mới, tự tính tiêu thụ |
| 🔧 Bảo trì | Tạo yêu cầu, theo dõi tiến độ |
| 📈 Báo cáo | Biểu đồ doanh thu, thống kê theo tháng, export CSV |
| 👥 Người dùng | Phân quyền Admin / Staff / Tenant |

## 🛡️ Phân quyền

| Tính năng | 🛡️ Admin | 👤 Staff | 🏠 Tenant |
|-----------|-----------|----------|-----------|
| Dashboard | ✅ | ✅ | ❌ |
| Phòng của tôi | ❌ | ❌ | ✅ |
| Quản lý phòng/khách/HĐ | ✅ Xóa | ✅ Sửa | ❌ |
| Quản lý người dùng | ✅ | ❌ | ❌ |
| Export CSV | ✅ | ❌ | ❌ |

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/baohv/retalManagement.git
cd quan-ly-phong-tro

# Install
npm install

# Setup DB + seed
bash scripts/setup.sh

# Dev
npm run dev
# → http://localhost:3000
```

## 🗄️ Công nghệ

| Layer | Công nghệ |
|-------|-----------|
| Framework | Next.js 16.2 (App Router) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ORM | Prisma 6 |
| UI | Tailwind CSS + Outfit font |
| Auth | HMAC-signed session cookies |
| Charts | Recharts |
| E2E Tests | Playwright |
| Deploy | Vercel |

## 🌐 Deploy

### Production (Vercel)
```bash
# Push lên GitHub → import vào Vercel
# Cần PostgreSQL (Neon) cho production
cp prisma/schema.postgres.prisma prisma/schema.prisma
npx prisma db push
npx prisma generate
node prisma/seed.js
```

### URL
- **Production:** https://retal-management-bo69dssk0-ewings.vercel.app
- **Default login:** `admin@example.com` / `admin123`

## 📁 Project Structure

```
src/
├── app/
│   ├── (app)/          # 22 pages (authenticated)
│   ├── login/          # Đăng nhập
│   ├── register/       # Đăng ký
│   ├── forgot-password/
│   └── api/            # 15 API routes
├── components/         # 7 shared components
└── lib/                # 8 modules (auth, prisma, permissions...)
prisma/schema.prisma    # 10 database models
```

## 📐 BMAD Method

Dự án được phát triển theo phương pháp BMAD:

| Phase | Artifact | Status |
|-------|----------|--------|
| Planning | PRD, UX Design | ✅ |
| Solutioning | Architecture, Epics | ✅ |
| Implementation | Sprint 1 (34/34 pages) | ✅ |
| Testing | 6/6 E2E tests | ✅ |
| Deploy | Vercel + Neon | ✅ |

## 📄 License

MIT
