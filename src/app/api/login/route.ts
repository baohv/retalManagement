import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createSession, SESSION_COOKIE } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit('login', ip, 5)) {
      return NextResponse.json(
        { error: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 1 phút.' },
        { status: 429 }
      )
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Vui lòng nhập email và mật khẩu' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'Email hoặc mật khẩu không đúng' }, { status: 401 })
    }

    const valid = await verifyPassword(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Email hoặc mật khẩu không đúng' }, { status: 401 })
    }

    const token = await createSession(user.id, user.name, user.role)
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    resetRateLimit('login', ip)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Có lỗi xảy ra khi đăng nhập' }, { status: 500 })
  }
}
