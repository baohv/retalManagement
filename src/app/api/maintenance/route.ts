import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { validateOrigin } from '@/lib/csrf'
import { getServerSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    if (!validateOrigin(request)) return NextResponse.json({ error: 'Yêu cầu không hợp lệ' }, { status: 403 })
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

    const body = await request.json()
    const { roomId, title, description, priority } = body

    if (!roomId || !title) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
    }

    const room = await prisma.room.findUnique({ where: { id: roomId } })
    if (!room) return NextResponse.json({ error: 'Phòng không tồn tại' }, { status: 404 })

    const req = await prisma.maintenanceRequest.create({
      data: {
        roomId, title, description: description || '',
        priority: priority || 'medium',
        status: 'pending',
      },
      include: { room: true },
    })
    return NextResponse.json(req)
  } catch (error) {
    console.error('Create maintenance error:', error)
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    if (!validateOrigin(request)) return NextResponse.json({ error: 'Yêu cầu không hợp lệ' }, { status: 403 })
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

    const body = await request.json()
    const { id, status, actualCost, notes } = body

    const data: any = {}
    if (status) data.status = status
    if (actualCost !== undefined) data.actualCost = parseFloat(actualCost)
    if (notes !== undefined) data.notes = notes
    if (status === 'completed') data.completedAt = new Date()

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data,
      include: { room: true },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update maintenance error:', error)
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
  }
}

export async function GET() {
  const requests = await prisma.maintenanceRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { room: true },
  })
  return NextResponse.json(requests)
}
