import { prisma } from '@/lib/prisma'
import { hashPassword, getServerSession } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { validateOrigin } from '@/lib/csrf'

async function checkAdmin() {
  const session = await getServerSession()
  return session?.role === 'admin'
}

export async function GET() {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, phone: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(users)
}

export async function POST(request: Request) {
  try {
    if (!validateOrigin(request)) return NextResponse.json({ error: 'Yêu cầu không hợp lệ' }, { status: 403 })
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit('register', ip, 10)) {
      return NextResponse.json({ error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.' }, { status: 429 })
    }
    if (!await checkAdmin()) return NextResponse.json({ error: 'Chỉ admin mới được tạo tài khoản' }, { status: 403 })

    const body = await request.json()
    const { name, email, password, role, phone } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email đã tồn tại' }, { status: 409 })

    const user = await prisma.user.create({
      data: { name, email, password: await hashPassword(password), role: role || 'staff', phone: phone || '' },
      select: { id: true, name: true, email: true, role: true },
    })
    return NextResponse.json(user)
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    if (!validateOrigin(request)) return NextResponse.json({ error: 'Yêu cầu không hợp lệ' }, { status: 403 })
    if (!await checkAdmin()) return NextResponse.json({ error: 'Chỉ admin mới được chỉnh sửa tài khoản' }, { status: 403 })

    const body = await request.json()
    const { id, name, role, phone, isActive, password } = body

    if (!id) return NextResponse.json({ error: 'Thiếu ID người dùng' }, { status: 400 })

    const data: any = {}
    if (name) data.name = name
    if (role) data.role = role
    if (phone !== undefined) data.phone = phone
    if (isActive !== undefined) data.isActive = isActive
    if (password) data.password = await hashPassword(password)

    await prisma.user.update({ where: { id }, data })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    if (!validateOrigin(request)) return NextResponse.json({ error: 'Yêu cầu không hợp lệ' }, { status: 403 })
    if (!await checkAdmin()) return NextResponse.json({ error: 'Chỉ admin mới được xóa tài khoản' }, { status: 403 })

    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: 'Thiếu ID' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 })
    if (user.role === 'admin') return NextResponse.json({ error: 'Không thể xóa admin' }, { status: 409 })

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
  }
}
