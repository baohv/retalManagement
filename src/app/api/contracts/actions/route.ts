import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { validateOrigin } from '@/lib/csrf'
import { getServerSession } from '@/lib/auth'

export async function PUT(request: Request) {
  try {
    if (!validateOrigin(request)) return NextResponse.json({ error: 'Yêu cầu không hợp lệ' }, { status: 403 })
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

    const body = await request.json()
    const { id, action } = body

    if (!id || !action) {
      return NextResponse.json({ error: 'Thiếu thông tin hợp đồng hoặc hành động' }, { status: 400 })
    }

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: { room: true },
    })
    if (!contract) {
      return NextResponse.json({ error: 'Không tìm thấy hợp đồng' }, { status: 404 })
    }

    if (action === 'terminate') {
      const { reason } = body
      await prisma.contract.update({
        where: { id },
        data: {
          status: 'terminated',
          notes: reason ? `${contract.notes}\n[Chấm dứt: ${new Date().toLocaleDateString('vi-VN')}] ${reason}` : contract.notes,
        },
      })
      // Free the room
      await prisma.room.update({
        where: { id: contract.roomId },
        data: { status: 'available' },
      })
      return NextResponse.json({ success: true, message: 'Đã chấm dứt hợp đồng' })
    }

    if (action === 'renew') {
      const { newEndDate, newRentPrice } = body
      if (!newEndDate) {
        return NextResponse.json({ error: 'Thiếu ngày kết thúc mới' }, { status: 400 })
      }

      const updated = await prisma.contract.update({
        where: { id },
        data: {
          endDate: new Date(newEndDate),
          ...(newRentPrice ? { rentPrice: parseFloat(newRentPrice) } : {}),
          status: 'active',
        },
      })
      return NextResponse.json({ success: true, message: 'Đã gia hạn hợp đồng', contract: updated })
    }

    if (action === 'return-deposit') {
      await prisma.contract.update({
        where: { id },
        data: { deposit_status: 'returned' },
      })
      return NextResponse.json({ success: true, message: 'Đã hoàn cọc' })
    }

    return NextResponse.json({ error: 'Hành động không hợp lệ' }, { status: 400 })
  } catch (error) {
    console.error('Contract action error:', error)
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
  }
}
