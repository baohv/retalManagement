import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import Link from 'next/link'
import Badge from '@/components/Badge'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Bảo trì — Quản Lý Phòng Trọ',
}

export default async function MaintenancePage() {
  const requests = await prisma.maintenanceRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { room: true },
  })

  const pending = requests.filter(r => r.status === 'pending').length
  const inProgress = requests.filter(r => r.status === 'in_progress').length
  const totalCost = requests.reduce((s, r) => s + r.actualCost, 0)

  return (
    <div>
      <PageHeader
        title="🔧 Bảo trì"
        description={`${requests.length} yêu cầu`}
        action={
          <Link href="/maintenance/create"
            className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Tạo yêu cầu
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative bg-white rounded-xl border border-gray-200 p-5">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-yellow-600" />
          <p className="text-sm text-gray-500">Chờ xử lý</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{pending}</p>
        </div>
        <div className="relative bg-white rounded-xl border border-gray-200 p-5">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
          <p className="text-sm text-gray-500">Đang xử lý</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{inProgress}</p>
        </div>
        <div className="relative bg-white rounded-xl border border-gray-200 p-5">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600" />
          <p className="text-sm text-gray-500">Tổng chi phí</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalCost)}</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <EmptyState icon="🔧" title="Chưa có yêu cầu bảo trì" description="Tạo yêu cầu bảo trì khi phòng cần sửa chữa" actionLabel="Tạo yêu cầu" actionHref="/maintenance/create" />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                  <th className="px-6 py-3">Phòng</th>
                  <th className="px-6 py-3">Tiêu đề</th>
                  <th className="px-6 py-3">Ưu tiên</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3 text-right">Chi phí</th>
                  <th className="px-6 py-3">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {requests.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/80">
                    <td className="px-6 py-3 text-sm font-medium">{r.room.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-700 max-w-xs truncate">{r.title}</td>
                    <td className="px-6 py-3"><Badge status={r.priority} /></td>
                    <td className="px-6 py-3"><Badge status={r.status} /></td>
                    <td className="px-6 py-3 text-sm text-right font-medium tabular-nums">
                      {r.actualCost > 0 ? formatCurrency(r.actualCost) : r.estimatedCost > 0 ? formatCurrency(r.estimatedCost) : '-'}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">{formatDate(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
