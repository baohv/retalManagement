import { cookies } from 'next/headers'
import { destroySession, SESSION_COOKIE } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (token) destroySession(token)
  cookieStore.delete(SESSION_COOKIE)
  return NextResponse.json({ success: true })
}
