import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const session = await getServerSession()
  if (!session) redirect('/login')
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, phone: true, role: true, createdAt: true },
  })
  if (!user) redirect('/login')
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">👤 Thông tin tài khoản</h1>
      <ProfileForm user={JSON.parse(JSON.stringify(user))} />
    </div>
  )
}
