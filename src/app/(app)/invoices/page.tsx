export const dynamic = "force-dynamic";
import { prisma } from '@/lib/prisma'

import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'

import Link from 'next/link'


export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }, { invoiceNumber: 'desc' }],
    include: { room: true },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hóa đơn</h1>
          <p className="text-gray-500 mt-1">Tổng số: {invoices.length} hóa đơn</p>
        </div>
        <Link href="/invoices/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          + Tạo hóa đơn
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 bg-gray-50">
              <th className="px-6 py-3 font-medium">Số hóa đơn</th>
              <th className="px-6 py-3 font-medium">Phòng</th>
              <th className="px-6 py-3 font-medium">Kỳ</th>
              <th className="px-6 py-3 font-medium">Ngày phát hành</th>
              <th className="px-6 py-3 font-medium">Tổng tiền</th>
              <th className="px-6 py-3 font-medium">Trạng thái</th>
              <th className="px-6 py-3 font-medium">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{invoice.room.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">Tháng {invoice.periodMonth}/{invoice.periodYear}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{formatDate(invoice.issueDate)}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(invoice.totalAmount)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                    {getStatusLabel(invoice.status)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link href={`/invoices/${invoice.id}`} className="text-sm text-blue-600 hover:text-blue-700">Chi tiết</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
