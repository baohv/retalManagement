import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import PaymentForm from './PaymentForm'

export default async function InvoiceDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const invoice = await prisma.invoice.findUnique({
    where: { id: parseInt(id) },
    include: {
      room: true,
      contract: {
        include: {
          contractTenants: {
            include: { tenant: true },
          },
        },
      },
      items: true,
      payments: { orderBy: { paymentDate: 'desc' } },
    },
  })

  if (!invoice) notFound()

  const remaining = invoice.totalAmount - invoice.payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div>
      <Link href="/invoices" className="text-sm text-blue-600 hover:text-blue-700 mb-4 block">← Quay lại danh sách</Link>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hóa đơn {invoice.invoiceNumber}</h1>
          <p className="text-gray-500 mt-1">Phòng {invoice.room.name} - Tháng {invoice.periodMonth}/{invoice.periodYear}</p>
        </div>
        <span className={`inline-flex px-3 py-1.5 text-sm font-medium rounded-full ${getStatusColor(invoice.status)}`}>
          {getStatusLabel(invoice.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Chi tiết hóa đơn</h2>
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500">
                  <th className="pb-2 font-medium">Khoản mục</th>
                  <th className="pb-2 font-medium text-right">Số lượng</th>
                  <th className="pb-2 font-medium text-right">Đơn giá</th>
                  <th className="pb-2 font-medium text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 text-sm text-gray-900">{item.label}</td>
                    <td className="py-3 text-sm text-gray-600 text-right">{item.quantity}</td>
                    <td className="py-3 text-sm text-gray-600 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="pt-3 text-sm font-semibold text-gray-900 text-right">Tổng cộng:</td>
                  <td className="pt-3 text-sm font-bold text-gray-900 text-right">{formatCurrency(invoice.totalAmount)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="text-sm text-gray-500 text-right">Còn lại:</td>
                  <td className={`text-sm font-bold text-right ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(remaining)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payments */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Lịch sử thanh toán</h2>
            {invoice.payments.length === 0 ? (
              <p className="text-gray-500 text-sm">Chưa có thanh toán nào</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-900">{formatDate(payment.paymentDate)}</p>
                      <p className="text-xs text-gray-500">
                        {getStatusLabel(payment.paymentMethod)}
                        {payment.reference && ` - ${payment.reference}`}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-green-600">{formatCurrency(payment.amount)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Thông tin hợp đồng</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Phòng:</dt>
                <dd className="font-medium">{invoice.room.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Khách thuê:</dt>
                <dd className="font-medium text-right">
                  {invoice.contract.contractTenants.map(ct => ct.tenant.fullName).join(', ')}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Ngày phát hành:</dt>
                <dd className="font-medium">{formatDate(invoice.issueDate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Hạn thanh toán:</dt>
                <dd className="font-medium">{formatDate(invoice.dueDate)}</dd>
              </div>
            </dl>
          </div>

          {/* Payment Form */}
          {invoice.status !== 'paid' && (
            <PaymentForm invoiceId={invoice.id} remaining={remaining} />
          )}
        </div>
      </div>
    </div>
  )
}
