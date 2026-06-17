import { getServerSession } from '@/lib/auth'
import { validateOrigin } from '@/lib/csrf'
import { NextResponse } from 'next/server'

export type ApiHandler = (request: Request, session: { userId: number; name: string; role: string }) => Promise<Response>

export function api(handler: ApiHandler, options?: { requireAdmin?: boolean; csrf?: boolean }) {
  return async (request: Request) => {
    try {
      if (options?.csrf !== false) {
        if (!validateOrigin(request)) {
          return NextResponse.json({ error: 'Yêu cầu không hợp lệ' }, { status: 403 })
        }
      }
      const session = await getServerSession()
      if (!session) {
        return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
      }
      if (options?.requireAdmin && session.role !== 'admin') {
        return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 })
      }
      return await handler(request, session)
    } catch (error) {
      console.error('API error:', error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Có lỗi xảy ra' },
        { status: 500 }
      )
    }
  }
}

// Helper: parse JSON body safely
export async function getBody<T>(request: Request): Promise<T | null> {
  try {
    return await request.json() as T
  } catch {
    return null
  }
}
