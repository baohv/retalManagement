import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { formatCurrency, formatDate } from '@/lib/utils'
import Badge from '@/components/Badge'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function MyRoomPage() {
  const session = await getServerSession()
  if (!session) redirect('/login')
  if (session.role !== 'tenant') redirect('/dashboard')

  // Find tenant record linked to this user
  // For simplicity: find by email (tenant's email matches user email)
  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) redirect('/login')

  const tenant = await prisma.tenant.findFirst({ where: { email: user.email } })
  if (!tenant) {
    return <div className="p-8 text-center text-gray-500">Chưa liên kết thông tin khách thuê. Vui lòng liên hệ chủ trọ.</div>
  }

  const contractTenant = await prisma.contractTenant.findFirst({
    where: { tenantId: tenant.id },
    include: {
      contract: {
        include: {
          room: true,
          invoices: { orderBy: { createdAt: 'desc' }, take: 12 },
          contractTenants: { include: { tenant: true } },
        },
      },
    },
  })

  if (!contractTenant) {
    return <div className="p-8 text-center text-gray-500">Chưa có hợp đồng thuê.</div>
  }

  const contract = contractTenant.contract
  const room = contract.room
  const invoices = contract.invoices

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">🏠 Phòng của tôi</h1>
      <p className="text-gray-500 mb-6">Xin chào, {tenant.fullName}</p>

      {/* Room info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Phòng {room.name}</h2>
            <p className="text-sm text-gray-500">Tầng {room.floor} · {room.area}m²</p>
          </div>
          <Badge status={room.status} />
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Giá thuê</p>
            <p className="font-semibold text-gray-900">{formatCurrency(contract.rentPrice)}/tháng</p>
          </div>
          <div>
            <p className="text-gray-500">Tiền cọc</p>
            <p className="font-semibold text-gray-900">{formatCurrency(contract.depositAmount)}</p>
          </div>
          <div>
            <p className="text-gray-500">Hợp đồng</p>
            <p className="font-semibold text-gray-900">{formatDate(contract.startDate)} → {formatDate(contract.endDate)}</p>
          </div>
          <div>
            <p className="text-gray-500">Trạng thái hợp đồng</p>
            <Badge status={contract.status} />
          </div>
        </div>
        {room.amenities !== '[]' && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Tiện ích:</p>
            <div className="flex flex-wrap gap-2">
              {JSON.parse(room.amenities).map((a: string) => (
                <span key={a} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs">{a}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Invoices */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">🧾 Hóa đơn của tôi</h2>
        </div>
        {invoices.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">Chưa có hóa đơn</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {invoices.map(inv => (
              <div key={inv.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{inv.invoiceNumber}</p>
                  <p className="text-xs text-gray-500">Tháng {inv.periodMonth}/{inv.periodYear}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(inv.totalAmount)}</p>
                  <Badge status={inv.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 text-center">
        <p className="text-sm text-blue-800">Mọi thắc mắc vui lòng liên hệ chủ trọ</p>
      </div>
    </div>
  )
}
