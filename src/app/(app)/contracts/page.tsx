export const dynamic = "force-dynamic";
import { prisma } from '@/lib/prisma'

import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'

import Link from 'next/link'


export default async function ContractsPage() {
  const contracts = await prisma.contract.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      room: true,
      contractTenants: {
        include: { tenant: true },
      },
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📝 Hợp đồng</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tổng số: {contracts.length} hợp đồng</p>
        </div>
        <Link href="/contracts/create"
          className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Tạo hợp đồng
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
              <th className="px-6 py-3 font-medium">Phòng</th>
              <th className="px-6 py-3 font-medium">Khách thuê</th>
              <th className="px-6 py-3 font-medium">Thời hạn</th>
              <th className="px-6 py-3 font-medium">Giá thuê</th>
              <th className="px-6 py-3 font-medium">Tiền cọc</th>
              <th className="px-6 py-3 font-medium">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contracts.map((contract) => (
              <tr key={contract.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link href={`/contracts/${contract.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    {contract.room.name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {contract.contractTenants.map(ct => ct.tenant.fullName).join(', ')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {formatCurrency(contract.rentPrice)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatCurrency(contract.depositAmount)}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(contract.status)}`}>
                    {getStatusLabel(contract.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
