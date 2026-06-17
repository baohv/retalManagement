#!/bin/bash
set -e
cd "$(dirname "$0")/.."
echo "📦 Installing dependencies..."
npm install
echo "🗄️ Setting up database..."
DATABASE_URL="file:$(pwd)/dev.db" npx prisma generate
DATABASE_URL="file:$(pwd)/dev.db" npx prisma db push
echo "🌱 Seeding data..."
DATABASE_URL="file:$(pwd)/dev.db" node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();
(async () => {
  const existing = await p.user.findUnique({ where: { email: 'admin@example.com' } });
  if (existing) { console.log('Already seeded.'); await p.\$disconnect(); return; }
  await p.user.create({ data: { name: 'Admin', email: 'admin@example.com', password: bcrypt.hashSync('admin123', 10), role: 'admin' } });
  const rooms = [{name:'P101',floor:1,area:25,price:3000000},{name:'P102',floor:1,area:30,price:3500000},{name:'P103',floor:1,area:20,price:2500000,status:'maintenance'},{name:'P201',floor:2,area:28,price:3200000},{name:'P202',floor:2,area:22,price:2700000},{name:'P203',floor:2,area:35,price:4000000},{name:'P301',floor:3,area:25,price:3000000},{name:'P302',floor:3,area:30,price:3500000},{name:'P303',floor:3,area:20,price:2500000},{name:'P401',floor:4,area:25,price:2800000},{name:'P402',floor:4,area:30,price:3300000},{name:'P403',floor:4,area:40,price:4500000}];
  for (const r of rooms) await p.room.create({ data: r });
  const ts = [{fullName:'Nguyễn Văn An',cccd:'001201012345',phone:'0909123456'},{fullName:'Trần Thị Bình',cccd:'001201023456',phone:'0909234567'},{fullName:'Lê Văn Cường',cccd:'001201034567',phone:'0909345678'}];
  for (const t of ts) await p.tenant.create({ data: t });
  const cData = [{roomId:2,tId:1,start:'2026-01-01',end:'2026-12-31',rent:3500000,dep:3500000},{roomId:5,tId:2,start:'2026-02-01',end:'2026-11-30',rent:2700000,dep:2700000},{roomId:6,tId:3,start:'2026-03-15',end:'2027-03-14',rent:4000000,dep:4000000}];
  for (const c of cData) {
    await p.contract.create({data:{roomId:c.roomId,startDate:new Date(c.start),endDate:new Date(c.end),rentPrice:c.rent,depositAmount:c.dep,deposit_status:'paid',status:'active',contractTenants:{create:{tenantId:c.tId,isPrimary:true}}}});
    await p.room.update({where:{id:c.roomId},data:{status:'rented'}});
  }
  console.log('✅ Seeded! admin@example.com / admin123');
  await p.\$disconnect();
})();
"
echo "✅ Setup complete!"
