import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { getToken, deleteToken } from '@/lib/reset-tokens'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' }, { status: 400 })
    }

    const entry = getToken(token)
    if (!entry) {
      return NextResponse.json({ error: 'Token không hợp lệ hoặc đã hết hạn' }, { status: 400 })
    }
    if (Date.now() > entry.expiresAt) {
      deleteToken(token)
      return NextResponse.json({ error: 'Token đã hết hạn. Vui lòng yêu cầu lại.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: entry.email } })
    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản' }, { status: 404 })
    }

    await prisma.user.update({
      where: { email: entry.email },
      data: { password: await hashPassword(password) },
    })

    deleteToken(token)
    return NextResponse.json({ message: 'Mật khẩu đã được đặt lại thành công!' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
  }
}
