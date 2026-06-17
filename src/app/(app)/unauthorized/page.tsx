import Link from 'next/link'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function UnauthorizedPage() {
  const session = await getServerSession()
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  })

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6">🚫</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Không có quyền truy cập</h1>
        <p className="text-gray-500 mb-2">
          Bạn không có quyền truy cập trang này.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          Vai trò hiện tại: <span className="font-medium text-gray-600">
            {user?.role === 'admin' ? '🛡️ Admin' : '👤 Nhân viên'}
          </span>
          {user?.role !== 'admin' && (
            <span className="block mt-1">Trang này yêu cầu quyền Admin.</span>
          )}
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard"
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm">
            ← Về trang chủ
          </Link>
          <Link href="/profile"
            className="px-6 py-2.5 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
            Thông tin tài khoản
          </Link>
        </div>
      </div>
    </div>
  )
}
