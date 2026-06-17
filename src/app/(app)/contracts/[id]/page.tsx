import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ContractActions from './ContractActions'

export default async function ContractDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const contract = await prisma.contract.findUnique({
    where: { id: parseInt(id) },
    include: {
      room: true,
      contractTenants: {
        include: { tenant: true },
      },
      invoices: {
        orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
        take: 12,
        include: {
          _count: { select: { payments: true } },
        },
      },
    },
  })

  if (!contract) notFound()

  const isActive = contract.status === 'active'
  const totalInvoiced = contract.invoices.reduce((sum, i) => sum + i.totalAmount, 0)
  const paidInvoices = contract.invoices.filter(i => i.status === 'paid').length

  return (
    <div>
      <Link href="/contracts" className="text-sm text-blue-600 hover:text-blue-700 mb-4 block">← Quay lại danh sách</Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hợp đồng — Phòng {contract.room.name}
          </h1>
          <p className="text-gray-500 mt-1">ID: #{contract.id}</p>
        </div>
        <span className={`inline-flex px-3 py-1.5 text-sm font-medium rounded-full ${getStatusColor(contract.status)}`}>
          {getStatusLabel(contract.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Thông tin hợp đồng</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-gray-500">Phòng</dt><dd className="font-medium">{contract.room.name}</dd></div>
              <div><dt className="text-gray-500">Giá thuê</dt><dd className="font-medium text-blue-600">{formatCurrency(contract.rentPrice)}/tháng</dd></div>
              <div><dt className="text-gray-500">Ngày bắt đầu</dt><dd className="font-medium">{formatDate(contract.startDate)}</dd></div>
              <div><dt className="text-gray-500">Ngày kết thúc</dt><dd className="font-medium">{formatDate(contract.endDate)}</dd></div>
              <div><dt className="text-gray-500">Tiền cọc</dt><dd className="font-medium">{formatCurrency(contract.depositAmount)}</dd></div>
              <div>
                <dt className="text-gray-500">Trạng thái cọc</dt>
                <dd>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(contract.deposit_status)}`}>
                    {contract.deposit_status === 'paid' ? 'Đã đóng' : contract.deposit_status === 'returned' ? 'Đã hoàn' : 'Chưa đóng'}
                  </span>
                </dd>
              </div>
            </dl>
            {contract.terms && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Điều khoản:</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{contract.terms}</p>
              </div>
            )}
            {contract.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Ghi chú:</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{contract.notes}</p>
              </div>
            )}
          </div>

          {/* Tenants */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Khách thuê</h2>
            <div className="divide-y divide-gray-100">
              {contract.contractTenants.map(ct => (
                <div key={ct.id} className="py-3 flex items-center justify-between">
                  <div>
                    <Link href={`/tenants/${ct.tenant.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                      {ct.tenant.fullName}
                    </Link>
                    <p className="text-xs text-gray-500">{ct.tenant.phone} · {ct.tenant.cccd}</p>
                  </div>
                  {ct.isPrimary && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Chính</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Invoices */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Hóa đơn</h2>
              <Link href={`/invoices/create?contractId=${contract.id}&roomId=${contract.roomId}`}
                className="text-sm text-blue-600 hover:text-blue-700">+ Tạo hóa đơn</Link>
            </div>
            {contract.invoices.length === 0 ? (
              <p className="text-gray-500 text-sm">Chưa có hóa đơn</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {contract.invoices.map(inv => (
                  <div key={inv.id} className="py-3 flex items-center justify-between">
                    <div>
                      <Link href={`/invoices/${inv.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                        {inv.invoiceNumber}
                      </Link>
                      <p className="text-xs text-gray-500">Tháng {inv.periodMonth}/{inv.periodYear}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(inv.totalAmount)}</p>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(inv.status)}`}>
                        {getStatusLabel(inv.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Actions */}
        <div className="space-y-6">
          <ContractActions contract={JSON.parse(JSON.stringify({
            id: contract.id,
            status: contract.status,
            depositStatus: contract.deposit_status,
            roomId: contract.roomId,
            roomName: contract.room.name,
            rentPrice: contract.rentPrice,
            startDate: contract.startDate.toISOString(),
            endDate: contract.endDate.toISOString(),
          }))} />

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Thống kê</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Tổng hóa đơn:</dt>
                <dd className="font-medium">{formatCurrency(totalInvoiced)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Đã thanh toán:</dt>
                <dd className="font-medium text-green-600">{paidInvoices}/{contract.invoices.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Thời hạn còn:</dt>
                <dd className="font-medium">
                  {isActive ? Math.ceil((new Date(contract.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) + ' ngày' : '-'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
