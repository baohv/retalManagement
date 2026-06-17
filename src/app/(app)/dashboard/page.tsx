export const dynamic = "force-dynamic";
import { prisma } from '@/lib/prisma'

import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'

import Link from 'next/link'


async function getDashboardData() {
  const [
    totalRooms,
    rentedRooms,
    availableRooms,
    maintenanceRooms,
    totalTenants,
    activeContracts,
    totalInvoices,
    expiredContracts,
    paidInvoices,
    overdueInvoices,
    monthlyRevenue,
    recentPayments,
    expiringContracts,
    longEmptyRooms,
  ] = await Promise.all([
    prisma.room.count(),
    prisma.room.count({ where: { status: 'rented' } }),
    prisma.room.count({ where: { status: 'available' } }),
    prisma.room.count({ where: { status: 'maintenance' } }),
    prisma.tenant.count(),
    prisma.contract.count({ where: { status: 'active' } }),
    prisma.invoice.count(),
    prisma.invoice.count({ where: { status: 'paid' } }),
    prisma.invoice.count({ where: { status: 'overdue' } }),
    prisma.contract.count({ where: { status: 'active', endDate: { lte: new Date() } } }),
    prisma.invoice.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: 'paid',
        periodYear: new Date().getFullYear(),
        periodMonth: new Date().getMonth() + 1,
      },
    }),
    prisma.payment.findMany({
      take: 5,
      orderBy: { paymentDate: 'desc' },
      include: {
        invoice: {
          include: { room: true },
        },
      },
    }),
    // Contracts expiring in the next 30 days
    prisma.contract.findMany({
      where: {
        status: 'active',
        endDate: { gte: new Date(), lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      },
      include: { room: true, contractTenants: { include: { tenant: true }, take: 1 } },
      orderBy: { endDate: 'asc' },
    }),
    // Rooms empty for more than 30 days
    prisma.room.findMany({
      where: { status: 'available', updatedAt: { lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      orderBy: { updatedAt: 'asc' },
      take: 5,
    }),
  ])

  return {
    stats: {
      totalRooms,
      rentedRooms,
      availableRooms,
      maintenanceRooms,
      occupancyRate: totalRooms > 0 ? Math.round((rentedRooms / totalRooms) * 100) : 0,
      totalTenants,
      activeContracts,
      totalInvoices,
    expiredContracts,
      paidInvoices,
      overdueInvoices,
      monthlyRevenue: monthlyRevenue._sum.totalAmount ?? 0,
      expiringContracts, longEmptyRooms,
    },
    recentPayments,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()
  const { stats } = data
  const now = new Date()
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
          <p className="text-gray-500 mt-1">
            {monthNames[now.getMonth()]} năm {now.getFullYear()}
          </p>
        </div>
      </div>

      {/* Stats Grid — Redesigned */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="relative bg-white rounded-xl border border-gray-200 p-6 overflow-hidden group hover:shadow-md transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Tổng phòng</p>
              <p className="text-3xl font-bold text-gray-900 tracking-tight">{stats.totalRooms}</p>
            </div>
            <div className="text-3xl opacity-80">🏠</div>
          </div>
          <div className="mt-3 flex gap-3 text-xs">
            <span className="text-emerald-600 font-medium">● {stats.availableRooms} trống</span>
            <span className="text-blue-600 font-medium">● {stats.rentedRooms} đã thuê</span>
            <span className="text-yellow-600 font-medium">● {stats.maintenanceRooms} bảo trì</span>
          </div>
        </div>

        <div className="relative bg-white rounded-xl border border-gray-200 p-6 overflow-hidden group hover:shadow-md transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-violet-600" />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Tỷ lệ lấp đầy</p>
              <p className="text-3xl font-bold text-gray-900 tracking-tight">{stats.occupancyRate}%</p>
            </div>
            <div className="text-3xl opacity-80">📈</div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-500 to-violet-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${stats.occupancyRate}%` }} />
            </div>
          </div>
        </div>

        <div className="relative bg-white rounded-xl border border-gray-200 p-6 overflow-hidden group hover:shadow-md transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600" />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Doanh thu tháng này</p>
              <p className="text-3xl font-bold text-gray-900 tracking-tight">{formatCurrency(stats.monthlyRevenue)}</p>
            </div>
            <div className="text-3xl opacity-80">💰</div>
          </div>
        </div>

        <div className="relative bg-white rounded-xl border border-gray-200 p-6 overflow-hidden group hover:shadow-md transition-all duration-200">
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stats.overdueInvoices > 0 ? 'from-red-500 to-red-600' : 'from-gray-300 to-gray-400'}`} />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Hóa đơn quá hạn</p>
              <p className={`text-3xl font-bold tracking-tight ${stats.overdueInvoices > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {stats.overdueInvoices}
              </p>
            </div>
            <div className="text-3xl opacity-80">⚠️</div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            {stats.paidInvoices}/{stats.totalInvoices} đã thanh toán
            <span className="ml-2 text-gray-400">· {stats.totalInvoices - stats.paidInvoices} chờ</span>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="space-y-3 mb-6">
        {stats.expiredContracts > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div className="flex-1">
                <p className="font-medium text-red-800">
                  <strong>{stats.expiredContracts}</strong> hợp đồng đã hết hạn!
                </p>
                <p className="text-sm text-red-600 mt-0.5">Vui lòng gia hạn hoặc cập nhật trạng thái phòng.</p>
              </div>
              <a href="/contracts" className="text-sm font-medium text-red-700 hover:text-red-800 bg-red-100 px-3 py-1.5 rounded-lg whitespace-nowrap">
                Xem →
              </a>
            </div>
          </div>
        )}

        {stats.expiringContracts?.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xl">⏰</span>
              <div className="flex-1">
                <p className="font-medium text-amber-800">
                  <strong>{stats.expiringContracts.length}</strong> hợp đồng sắp hết hạn (30 ngày tới)
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {stats.expiringContracts.slice(0, 3).map((c: any) => (
                    <span key={c.id} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      {c.room.name} — {new Date(c.endDate).toLocaleDateString('vi-VN')}
                    </span>
                  ))}
                  {stats.expiringContracts.length > 3 && (
                    <span className="text-xs text-amber-500">+{stats.expiringContracts.length - 3}</span>
                  )}
                </div>
              </div>
              <a href="/contracts" className="text-sm font-medium text-amber-700 hover:text-amber-800 bg-amber-100 px-3 py-1.5 rounded-lg whitespace-nowrap">
                Xem →
              </a>
            </div>
          </div>
        )}

        {stats.longEmptyRooms?.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xl">🏠</span>
              <div className="flex-1">
                <p className="font-medium text-blue-800">
                  <strong>{stats.longEmptyRooms.length}</strong> phòng trống hơn 30 ngày
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {stats.longEmptyRooms.slice(0, 5).map((r: any) => (
                    <span key={r.id} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {r.name} — từ {new Date(r.updatedAt).toLocaleDateString('vi-VN')}
                    </span>
                  ))}
                </div>
              </div>
              <a href="/rooms" className="text-sm font-medium text-blue-700 hover:text-blue-800 bg-blue-100 px-3 py-1.5 rounded-lg whitespace-nowrap">
                Xem →
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">💳 Thanh toán gần đây</h2>
          <Link href="/payments" className="text-sm text-blue-600 hover:text-blue-700">Xem tất cả</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500">
                <th className="px-6 py-3 font-medium">Phòng</th>
                <th className="px-6 py-3 font-medium">Số tiền</th>
                <th className="px-6 py-3 font-medium">Phương thức</th>
                <th className="px-6 py-3 font-medium">Ngày</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.recentPayments.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Chưa có thanh toán nào</td></tr>
              )}
              {data.recentPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{payment.invoice.room.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-900">{formatCurrency(payment.amount)}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.paymentMethod)}`}>
                      {getStatusLabel(payment.paymentMethod)}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">{formatDate(payment.paymentDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
