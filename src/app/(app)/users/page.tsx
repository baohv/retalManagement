import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { formatDate } from '@/lib/utils'
import { redirect } from 'next/navigation'
import UserManager from './UserManager'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Quản lý người dùng — Quản Lý Phòng Trọ',
}

export default async function UsersPage() {
  const session = await getServerSession()
  if (!session) redirect('/login')
  
  if (session.role !== 'admin') redirect('/unauthorized')

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, phone: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">👥 Quản lý người dùng</h1>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} tài khoản</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <UserManager users={JSON.parse(JSON.stringify(users))} currentUserId={session.userId} />
      </div>
    </div>
  )
}
