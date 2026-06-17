import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import RevenueChart from './RevenueChart'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Báo cáo — Quản Lý Phòng Trọ',
}

async function getReportData() {
  const currentYear = new Date().getFullYear()
  const monthlyRevenue = []
  for (let m = 1; m <= 12; m++) {
    const start = new Date(currentYear, m - 1, 1)
    const end = new Date(currentYear, m, 0)
    const result = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { paymentDate: { gte: start, lte: end } },
    })
    monthlyRevenue.push({ month: m, amount: result._sum.amount ?? 0 })
  }
  const totalRooms = await prisma.room.count()
  const rentedRooms = await prisma.room.count({ where: { status: 'rented' } })
  const occupancyRate = totalRooms > 0 ? Math.round((rentedRooms / totalRooms) * 100) : 0

  const cashPayments = await prisma.payment.aggregate({ _sum: { amount: true }, where: { paymentMethod: 'cash' } })
  const transferPayments = await prisma.payment.aggregate({ _sum: { amount: true }, where: { paymentMethod: 'transfer' } })

  return { currentYear, monthlyRevenue, totalRooms, rentedRooms, occupancyRate, cashTotal: cashPayments._sum.amount ?? 0, transferTotal: transferPayments._sum.amount ?? 0 }
}

export default async function ReportsPage() {
  const data = await getReportData()
  const totalRevenue = data.monthlyRevenue.reduce((s, m) => s + m.amount, 0)
  const monthLabel = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📈 Báo cáo doanh thu</h1>
          <p className="text-sm text-gray-500 mt-0.5">Năm {data.currentYear}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative bg-white rounded-xl border border-gray-200 p-5 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
          <p className="text-sm text-gray-500">Tổng doanh thu năm</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="relative bg-white rounded-xl border border-gray-200 p-5 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600" />
          <p className="text-sm text-gray-500">Tiền mặt</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(data.cashTotal)}</p>
        </div>
        <div className="relative bg-white rounded-xl border border-gray-200 p-5 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-violet-600" />
          <p className="text-sm text-gray-500">Chuyển khoản</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(data.transferTotal)}</p>
        </div>
        <div className="relative bg-white rounded-xl border border-gray-200 p-5 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600" />
          <p className="text-sm text-gray-500">Tỷ lệ lấp đầy</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.occupancyRate}%</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Doanh thu theo tháng</h2>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-500" /> Doanh thu</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-200" /> Trung bình</span>
          </div>
        </div>
        <RevenueChart data={data.monthlyRevenue} />
      </div>

      {/* Monthly Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Chi tiết theo tháng</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                <th className="px-6 py-3">Tháng</th>
                <th className="px-6 py-3 text-right">Doanh thu</th>
                <th className="px-6 py-3 text-right">% tổng năm</th>
                <th className="px-6 py-3 text-right"><div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{width:'60%'}} /></div></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.monthlyRevenue.map(m => {
                const pct = totalRevenue > 0 ? (m.amount / totalRevenue) * 100 : 0
                return (
                  <tr key={m.month} className="hover:bg-gray-50/80">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{monthLabel[m.month - 1]}</td>
                    <td className="px-6 py-3 text-sm text-right font-medium tabular-nums">
                      {m.amount > 0 ? formatCurrency(m.amount) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-6 py-3 text-sm text-right text-gray-500 tabular-nums">{pct.toFixed(1)}%</td>
                    <td className="px-6 py-3">
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
