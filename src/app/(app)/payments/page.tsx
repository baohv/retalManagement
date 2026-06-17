export const dynamic = "force-dynamic";
import { prisma } from '@/lib/prisma'

import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'

import Link from 'next/link'


export default async function PaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { paymentDate: 'desc' },
    include: {
      invoice: {
        include: { room: true },
      },
    },
  })

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thanh toán</h1>
          <p className="text-gray-500 mt-1">Tổng số: {payments.length} giao dịch</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-500">Tổng thu nhập</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-500">Tiền mặt</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(payments.filter(p => p.paymentMethod === 'cash').reduce((s, p) => s + p.amount, 0))}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-500">Chuyển khoản</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(payments.filter(p => p.paymentMethod === 'transfer').reduce((s, p) => s + p.amount, 0))}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 bg-gray-50">
              <th className="px-6 py-3 font-medium">Phòng</th>
              <th className="px-6 py-3 font-medium">Hóa đơn</th>
              <th className="px-6 py-3 font-medium">Số tiền</th>
              <th className="px-6 py-3 font-medium">Phương thức</th>
              <th className="px-6 py-3 font-medium">Ngày</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link href={`/rooms/${payment.invoice.roomId}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    {payment.invoice.room.name}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <Link href={`/invoices/${payment.invoiceId}`} className="text-sm text-gray-600 hover:text-blue-600">
                    {payment.invoice.invoiceNumber}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-green-600">{formatCurrency(payment.amount)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.paymentMethod)}`}>
                    {getStatusLabel(payment.paymentMethod)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(payment.paymentDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
