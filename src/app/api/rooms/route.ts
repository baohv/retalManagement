import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { validateOrigin } from '@/lib/csrf'
import { getServerSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    if (!validateOrigin(request)) return NextResponse.json({ error: 'Yêu cầu không hợp lệ' }, { status: 403 })
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
    }
    const currentUser = await prisma.user.findUnique({ where: { id: session.userId } })
    if (currentUser?.role !== 'admin') return NextResponse.json({ error: 'Chỉ admin mới có quyền xóa' }, { status: 403 })

    const body = await request.json()
    const { name, price, area } = body

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Tên phòng không được để trống' }, { status: 400 })
    }
    if (!price || price <= 0) {
      return NextResponse.json({ error: 'Giá thuê phải lớn hơn 0' }, { status: 400 })
    }
    if (!area || area <= 0) {
      return NextResponse.json({ error: 'Diện tích phải lớn hơn 0' }, { status: 400 })
    }

    // Check duplicate room name
    const existing = await prisma.room.findFirst({ where: { name: name.trim() } })
    if (existing) {
      return NextResponse.json({ error: `Phòng "${name}" đã tồn tại` }, { status: 409 })
    }

    const room = await prisma.room.create({
      data: {
        ...body,
        name: name.trim(),
        price: parseFloat(price),
        area: parseFloat(area),
        floor: parseInt(body.floor) || 1,
        deposit: parseFloat(body.deposit) || 0,
      },
    })
    return NextResponse.json(room)
  } catch (error) {
    console.error('Create room error:', error)
    const message = error instanceof Error ? error.message : 'Có lỗi khi tạo phòng'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    if (!validateOrigin(request)) return NextResponse.json({ error: 'Yêu cầu không hợp lệ' }, { status: 403 })
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
    }
    const currentUser = await prisma.user.findUnique({ where: { id: session.userId } })
    if (currentUser?.role !== 'admin') return NextResponse.json({ error: 'Chỉ admin mới có quyền xóa' }, { status: 403 })

    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID phòng' }, { status: 400 })
    }

    // Check duplicate name if name is being changed
    if (data.name) {
      const existing = await prisma.room.findFirst({
        where: { name: data.name.trim(), NOT: { id } },
      })
      if (existing) {
        return NextResponse.json({ error: `Phòng "${data.name}" đã tồn tại` }, { status: 409 })
      }
    }

    const room = await prisma.room.update({
      where: { id },
      data: {
        ...data,
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.price ? { price: parseFloat(data.price) } : {}),
        ...(data.area ? { area: parseFloat(data.area) } : {}),
      },
    })
    return NextResponse.json(room)
  } catch (error) {
    console.error('Update room error:', error)
    const message = error instanceof Error ? error.message : 'Có lỗi khi cập nhật phòng'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    if (!validateOrigin(request)) return NextResponse.json({ error: 'Yêu cầu không hợp lệ' }, { status: 403 })
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
    }
    const currentUser = await prisma.user.findUnique({ where: { id: session.userId } })
    if (currentUser?.role !== 'admin') return NextResponse.json({ error: 'Chỉ admin mới có quyền xóa' }, { status: 403 })

    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID phòng' }, { status: 400 })
    }

    // Check for active contracts
    const activeContract = await prisma.contract.findFirst({
      where: { roomId: id, status: 'active' },
    })
    if (activeContract) {
      return NextResponse.json(
        { error: 'Không thể xóa phòng đang có hợp đồng hoạt động' },
        { status: 409 }
      )
    }

    await prisma.room.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete room error:', error)
    const message = error instanceof Error ? error.message : 'Có lỗi khi xóa phòng'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
