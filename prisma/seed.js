const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('🌱 Seeding database...');
  
  const p = new PrismaClient();

  // Skip if already seeded
  const existing = await p.user.findUnique({ where: { email: 'admin@example.com' } });
  if (existing) {
    console.log('   Database already seeded. Skipping.');
    await p.$disconnect();
    return;
  }

  // Admin user
  await p.user.create({
    data: { name: 'Admin', email: 'admin@example.com', password: bcrypt.hashSync('admin123', 10), role: 'admin' }
  });
  console.log('  ✅ Admin: admin@example.com / admin123');

  // Rooms
  const rooms = [
    { name: 'P101', floor: 1, area: 25, price: 3000000, amenities: JSON.stringify(['Máy lạnh','Tủ lạnh','Giường','Tủ quần áo']) },
    { name: 'P102', floor: 1, area: 30, price: 3500000, amenities: JSON.stringify(['Máy lạnh','Tủ lạnh','Giường','Tủ quần áo','Nóng lạnh']) },
    { name: 'P103', floor: 1, area: 20, price: 2500000, status: 'maintenance' },
    { name: 'P201', floor: 2, area: 28, price: 3200000, amenities: JSON.stringify(['Máy lạnh','Tủ lạnh','Giường','Tủ quần áo','Ban công']) },
    { name: 'P202', floor: 2, area: 22, price: 2700000 },
    { name: 'P203', floor: 2, area: 35, price: 4000000, amenities: JSON.stringify(['Máy lạnh','Tủ lạnh','Giường','Tủ quần áo','Nóng lạnh','Ban công']) },
    { name: 'P301', floor: 3, area: 25, price: 3000000 },
    { name: 'P302', floor: 3, area: 30, price: 3500000, amenities: JSON.stringify(['Máy lạnh','Tủ lạnh','Giường','Tủ quần áo','Nóng lạnh']) },
    { name: 'P303', floor: 3, area: 20, price: 2500000 },
    { name: 'P401', floor: 4, area: 25, price: 2800000 },
    { name: 'P402', floor: 4, area: 30, price: 3300000, amenities: JSON.stringify(['Máy lạnh','Tủ lạnh','Giường','Tủ quần áo','Nóng lạnh']) },
    { name: 'P403', floor: 4, area: 40, price: 4500000, amenities: JSON.stringify(['Máy lạnh','Tủ lạnh','Giường','Tủ quần áo','Nóng lạnh','Ban công','Bếp']) },
  ];
  for (const r of rooms) await p.room.create({ data: r });
  console.log(`  ✅ ${rooms.length} rooms`);

  // Tenants
  const ts = [
    { fullName: 'Nguyễn Văn An', cccd: '001201012345', phone: '0909123456', email: 'an.nguyen@gmail.com' },
    { fullName: 'Trần Thị Bình', cccd: '001201023456', phone: '0909234567', email: 'binh.tran@gmail.com' },
    { fullName: 'Lê Văn Cường', cccd: '001201034567', phone: '0909345678', email: 'cuong.le@gmail.com' },
  ];
  for (const t of ts) await p.tenant.create({ data: t });
  console.log(`  ✅ ${ts.length} tenants`);

  // Contracts
  const cData = [
    { roomId: 2, tId: 1, start: '2026-01-01', end: '2026-12-31', rent: 3500000, dep: 3500000 },
    { roomId: 5, tId: 2, start: '2026-02-01', end: '2026-11-30', rent: 2700000, dep: 2700000 },
    { roomId: 6, tId: 3, start: '2026-03-15', end: '2027-03-14', rent: 4000000, dep: 4000000 },
  ];
  for (const c of cData) {
    await p.contract.create({
      data: {
        roomId: c.roomId, startDate: new Date(c.start), endDate: new Date(c.end),
        rentPrice: c.rent, depositAmount: c.dep, deposit_status: 'paid', status: 'active',
        contractTenants: { create: { tenantId: c.tId, isPrimary: true } },
      },
    });
    await p.room.update({ where: { id: c.roomId }, data: { status: 'rented' } });
  }
  console.log(`  ✅ ${cData.length} contracts`);

  // Meter readings (so charts have data)
  const now = new Date();
  for (let m = 1; m <= 6; m++) {
    for (let rid = 1; rid <= 12; rid++) {
      await p.meterReading.create({
        data: {
          roomId: rid, type: 'electricity', readingDate: new Date(now.getFullYear(), m - 1, 15),
          previousReading: (rid * 50) + ((m - 1) * 30), currentReading: (rid * 50) + (m * 30),
          consumption: 30, unitPrice: 3500,
        },
      });
      await p.meterReading.create({
        data: {
          roomId: rid, type: 'water', readingDate: new Date(now.getFullYear(), m - 1, 15),
          previousReading: (rid * 5) + ((m - 1) * 3), currentReading: (rid * 5) + (m * 3),
          consumption: 3, unitPrice: 15000,
        },
      });
    }
  }

  // Sample invoices with payments (for chart data)
  for (let m = 1; m <= 6; m++) {
    const inv = await p.invoice.create({
      data: {
        contractId: 1, roomId: 2,
        invoiceNumber: `HD-${now.getFullYear()}${String(m).padStart(2, '0')}-001`,
        periodYear: now.getFullYear(), periodMonth: m,
        issueDate: new Date(now.getFullYear(), m - 1, 1),
        dueDate: new Date(now.getFullYear(), m - 1, 15),
        totalAmount: 3500000 + 30 * 3500 + 3 * 15000 + 150000 + 50000,
        status: 'paid',
        items: {
          create: [
            { type: 'rent', label: `Tiền thuê tháng ${m}/${now.getFullYear()}`, quantity: 1, unitPrice: 3500000, amount: 3500000 },
            { type: 'electricity', label: 'Tiền điện', quantity: 30, unitPrice: 3500, amount: 105000 },
            { type: 'water', label: 'Tiền nước', quantity: 3, unitPrice: 15000, amount: 45000 },
            { type: 'internet', label: 'Internet', quantity: 1, unitPrice: 150000, amount: 150000 },
            { type: 'garbage', label: 'Phí rác', quantity: 1, unitPrice: 50000, amount: 50000 },
          ],
        },
      },
    });
    await p.payment.create({
      data: { invoiceId: inv.id, amount: inv.totalAmount, paymentDate: new Date(now.getFullYear(), m - 1, 10), paymentMethod: 'transfer' },
    });
  }

  console.log('  ✅ 6 months of sample data');
  console.log('\n🎉 Seed complete!');
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
