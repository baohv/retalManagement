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

    const body = await request.json()
    const { fullName, cccd, phone } = body

    // Validate required fields
    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ error: 'Họ tên không được để trống' }, { status: 400 })
    }
    if (!cccd || !cccd.trim()) {
      return NextResponse.json({ error: 'CCCD không được để trống' }, { status: 400 })
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: 'Số điện thoại không được để trống' }, { status: 400 })
    }

    // Check duplicate CCCD
    const existing = await prisma.tenant.findUnique({ where: { cccd: cccd.trim() } })
    if (existing) {
      return NextResponse.json(
        { error: `CCCD ${cccd} đã được đăng ký cho khách thuê "${existing.fullName}"` },
        { status: 409 }
      )
    }

    const tenant = await prisma.tenant.create({
      data: {
        ...body,
        fullName: fullName.trim(),
        cccd: cccd.trim(),
        phone: phone.trim(),
      },
    })
    return NextResponse.json(tenant)
  } catch (error) {
    console.error('Create tenant error:', error)

    // Handle Prisma unique constraint error
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'CCCD này đã tồn tại trong hệ thống' }, { status: 409 })
    }

    const message = error instanceof Error ? error.message : 'Có lỗi khi tạo khách thuê'
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

    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID khách thuê' }, { status: 400 })
    }

    // Check duplicate CCCD if being changed
    if (data.cccd) {
      const existing = await prisma.tenant.findFirst({
        where: { cccd: data.cccd.trim(), NOT: { id } },
      })
      if (existing) {
        return NextResponse.json({ error: `CCCD ${data.cccd} đã thuộc về khách thuê khác` }, { status: 409 })
      }
    }

    const tenant = await prisma.tenant.update({ where: { id }, data })
    return NextResponse.json(tenant)
  } catch (error) {
    console.error('Update tenant error:', error)
    const message = error instanceof Error ? error.message : 'Có lỗi khi cập nhật thông tin'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
