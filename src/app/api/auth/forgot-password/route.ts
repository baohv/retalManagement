import { prisma } from '@/lib/prisma'
import { setToken } from '@/lib/reset-tokens'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Vui lòng nhập email' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ message: 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.' })
    }

    const token = crypto.randomUUID()
    setToken(token, email)

    console.log(`[PASSWORD RESET] ${email} → ${token}`)

    return NextResponse.json({
      message: 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.',
      ...(process.env.NODE_ENV === 'development' ? { token } : {}),
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
  }
}
