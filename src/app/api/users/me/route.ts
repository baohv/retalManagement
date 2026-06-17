import { prisma } from '@/lib/prisma'
import { hashPassword, getServerSession } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, phone: true, role: true },
  })
  if (!user) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 })
  return NextResponse.json(user)
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
    const body = await request.json()
    const { name, phone, currentPassword, newPassword } = body
    const data: any = {}
    if (name) data.name = name
    if (phone !== undefined) data.phone = phone
    if (newPassword) {
      if (!currentPassword) return NextResponse.json({ error: 'Vui lòng nhập mật khẩu hiện tại' }, { status: 400 })
      const user = await prisma.user.findUnique({ where: { id: session.userId } })
      const bcrypt = require('bcryptjs')
      if (!bcrypt.compareSync(currentPassword, user!.password)) return NextResponse.json({ error: 'Mật khẩu hiện tại không đúng' }, { status: 400 })
      if (newPassword.length < 6) return NextResponse.json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' }, { status: 400 })
      data.password = await hashPassword(newPassword)
    }
    await prisma.user.update({ where: { id: session.userId }, data })
    return NextResponse.json({ success: true, message: 'Cập nhật thành công!' })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
  }
}
