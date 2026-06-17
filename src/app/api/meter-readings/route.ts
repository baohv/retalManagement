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
    const { readings } = body

    if (!readings || !Array.isArray(readings) || readings.length === 0) {
      return NextResponse.json({ error: 'Danh sách chỉ số không hợp lệ' }, { status: 400 })
    }

    const created = []
    const errors = []

    // Collect unique roomIds for batch validation
    const roomIds = [...new Set(readings.map(r => r.roomId))]
    const validRooms = await prisma.room.findMany({
      where: { id: { in: roomIds } },
      select: { id: true, name: true },
    })
    const validRoomIds = new Set(validRooms.map(r => r.id))
    const roomNames = new Map(validRooms.map(r => [r.id, r.name]))

    for (const r of readings) {
      const { roomId, type, previousReading, currentReading, unitPrice, readingDate } = r

      if (!roomId || !type || previousReading == null || currentReading == null) {
        errors.push({ roomId, error: 'Thiếu thông tin: cần roomId, type, previousReading, currentReading' })
        continue
      }
      if (!validRoomIds.has(roomId)) {
        errors.push({ roomId: roomId || 'unknown', error: 'Phòng không tồn tại' })
        continue
      }
      if (!['electricity', 'water'].includes(type)) {
        errors.push({ roomId, error: 'Loại chỉ số không hợp lệ. Chỉ chấp nhận electricity hoặc water' })
        continue
      }
      if (currentReading < 0 || previousReading < 0) {
        errors.push({ roomId, error: 'Chỉ số không được âm' })
        continue
      }
      if (currentReading < previousReading) {
        const rname = roomNames.get(roomId) || `phòng ${roomId}`
        errors.push({ roomId, error: `${rname}: chỉ số mới (${currentReading}) nhỏ hơn chỉ số cũ (${previousReading})` })
        continue
      }

      const consumption = currentReading - previousReading

      try {
        const record = await prisma.meterReading.create({
          data: {
            roomId,
            type,
            readingDate: readingDate ? new Date(readingDate) : new Date(),
            previousReading,
            currentReading,
            consumption,
            unitPrice: unitPrice || (type === 'electricity' ? 3500 : 15000),
          },
          include: { room: true },
        })
        created.push(record)
      } catch (e) {
        errors.push({ roomId, error: e instanceof Error ? e.message : 'Lỗi khi lưu' })
      }
    }

    return NextResponse.json({
      created: created.length,
      errors: errors.length,
      details: { created, errors },
    })
  } catch (error) {
    console.error('Create meter reading error:', error)
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const readings = await prisma.meterReading.findMany({
      orderBy: { readingDate: 'desc' },
      include: { room: true },
      take: 100,
    })
    return NextResponse.json(readings)
  } catch (error) {
    console.error('Get meter readings error:', error)
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    if (!validateOrigin(request)) return NextResponse.json({ error: 'Yêu cầu không hợp lệ' }, { status: 403 })
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

    // Try URL query param first, then fall back to JSON body
    const url = new URL(request.url)
    let idStr = url.searchParams.get('id')

    if (!idStr) {
      try {
        const body = await request.json()
        idStr = body?.id
      } catch {
        // no JSON body — that's fine if query param was used
      }
    }

    const id = parseInt(idStr || "")
    if (!id || isNaN(id)) return NextResponse.json({ error: 'Thiếu ID chỉ số' }, { status: 400 })

    await prisma.meterReading.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete meter reading error:', error)
    return NextResponse.json({ error: 'Có lỗi khi xóa chỉ số' }, { status: 500 })
  }
}
