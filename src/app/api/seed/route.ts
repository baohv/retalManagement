import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Check if already seeded
    const userCount = await prisma.user.count()
    if (userCount > 0) {
      return NextResponse.json({ message: 'Dữ liệu đã được khởi tạo trước đó' })
    }

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@example.com',
        password: await hashPassword('admin123'),
      },
    })

    // Create rooms
    const roomData = [
      { name: 'P101', floor: 1, area: 25, price: 3000000, deposit: 3000000, status: 'available', amenities: '["Máy lạnh","Tủ lạnh","Giường","Tủ quần áo"]' },
      { name: 'P102', floor: 1, area: 30, price: 3500000, deposit: 3500000, status: 'available', amenities: '["Máy lạnh","Tủ lạnh","Giường","Tủ quần áo","Nóng lạnh"]' },
      { name: 'P103', floor: 1, area: 20, price: 2500000, deposit: 2500000, status: 'maintenance', amenities: '["Giường","Tủ quần áo"]' },
      { name: 'P201', floor: 2, area: 28, price: 3200000, deposit: 3200000, status: 'available', amenities: '["Máy lạnh","Tủ lạnh","Giường","Tủ quần áo","Ban công"]' },
      { name: 'P202', floor: 2, area: 22, price: 2700000, deposit: 2700000, status: 'available', amenities: '["Máy lạnh","Giường","Tủ quần áo"]' },
      { name: 'P203', floor: 2, area: 35, price: 4000000, deposit: 4000000, status: 'available', amenities: '["Máy lạnh","Tủ lạnh","Giường","Tủ quần áo","Nóng lạnh","Ban công"]' },
      { name: 'P301', floor: 3, area: 25, price: 3000000, deposit: 3000000, status: 'available', amenities: '["Máy lạnh","Tủ lạnh","Giường","Tủ quần áo"]' },
      { name: 'P302', floor: 3, area: 30, price: 3500000, deposit: 3500000, status: 'available', amenities: '["Máy lạnh","Tủ lạnh","Giường","Tủ quần áo","Nóng lạnh"]' },
      { name: 'P303', floor: 3, area: 20, price: 2500000, deposit: 2500000, status: 'available', amenities: '["Giường","Tủ quần áo"]' },
      { name: 'P401', floor: 4, area: 25, price: 2800000, deposit: 2800000, status: 'available', amenities: '["Máy lạnh","Giường","Tủ quần áo"]' },
      { name: 'P402', floor: 4, area: 30, price: 3300000, deposit: 3300000, status: 'available', amenities: '["Máy lạnh","Tủ lạnh","Giường","Tủ quần áo","Nóng lạnh"]' },
      { name: 'P403', floor: 4, area: 40, price: 4500000, deposit: 4500000, status: 'available', amenities: '["Máy lạnh","Tủ lạnh","Giường","Tủ quần áo","Nóng lạnh","Ban công","Bếp"]' },
    ]

    for (const room of roomData) {
      await prisma.room.create({ data: room })
    }

    // Create sample tenants and contracts
    const tenants = [
      { fullName: 'Nguyễn Văn An', cccd: '001201012345', phone: '0909123456', email: 'an.nguyen@gmail.com', permanentAddress: 'Hà Nội' },
      { fullName: 'Trần Thị Bình', cccd: '001201023456', phone: '0909234567', email: 'binh.tran@gmail.com', permanentAddress: 'Hải Phòng' },
      { fullName: 'Lê Văn Cường', cccd: '001201034567', phone: '0909345678', email: 'cuong.le@gmail.com', permanentAddress: 'Đà Nẵng' },
    ]

    for (const t of tenants) {
      await prisma.tenant.create({ data: t })
    }

    // Create active contracts
    const contractData = [
      { roomId: 2, tenants: [1], start: '2026-01-01', end: '2026-12-31', rent: 3500000, deposit: 3500000 },
      { roomId: 5, tenants: [2], start: '2026-02-01', end: '2026-11-30', rent: 2700000, deposit: 2700000 },
      { roomId: 6, tenants: [3], start: '2026-03-15', end: '2027-03-14', rent: 4000000, deposit: 4000000 },
    ]

    for (const c of contractData) {
      const contract = await prisma.contract.create({
        data: {
          roomId: c.roomId,
          startDate: new Date(c.start),
          endDate: new Date(c.end),
          rentPrice: c.rent,
          depositAmount: c.deposit,
          deposit_status: 'paid',
          status: 'active',
          contractTenants: {
            create: c.tenants.map(tId => ({
              tenantId: tId,
              isPrimary: true,
            })),
          },
        },
      })
      // Update room status
      await prisma.room.update({
        where: { id: c.roomId },
        data: { status: 'rented' },
      })
    }

    return NextResponse.json({
      message: 'Khởi tạo dữ liệu mẫu thành công!',
      stats: {
        users: 1,
        rooms: roomData.length,
        tenants: tenants.length,
        contracts: contractData.length,
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Có lỗi khi khởi tạo dữ liệu' }, { status: 500 })
  }
}
