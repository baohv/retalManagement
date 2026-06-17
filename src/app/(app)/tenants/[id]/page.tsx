import { prisma } from '@/lib/prisma'
import { formatDate, formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function TenantDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const tenant = await prisma.tenant.findUnique({
    where: { id: parseInt(id) },
    include: {
      contractTenants: {
        include: {
          contract: {
            include: {
              room: true,
              invoices: {
                orderBy: { createdAt: 'desc' },
                take: 10,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!tenant) notFound()

  const contracts = tenant.contractTenants.map(ct => ct.contract)

  return (
    <div>
      <Link href="/tenants" className="text-sm text-blue-600 hover:text-blue-700 mb-4 block">← Quay lại danh sách</Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tenant.fullName}</h1>
          <p className="text-gray-500 mt-1">CCCD: {tenant.cccd}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Thông tin cá nhân</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Họ tên:</dt>
              <dd className="font-medium">{tenant.fullName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">CCCD:</dt>
              <dd className="font-medium">{tenant.cccd}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Số điện thoại:</dt>
              <dd className="font-medium">{tenant.phone}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Email:</dt>
              <dd className="font-medium">{tenant.email || '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Địa chỉ:</dt>
              <dd className="font-medium text-right max-w-[200px]">{tenant.permanentAddress || '-'}</dd>
            </div>
          </dl>
          {tenant.notes && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Ghi chú:</p>
              <p className="text-sm text-gray-700">{tenant.notes}</p>
            </div>
          )}
        </div>

        {/* Contract History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Lịch sử thuê trọ</h2>
            {contracts.length === 0 ? (
              <p className="text-gray-500 text-sm">Chưa có hợp đồng thuê</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {contracts.map(contract => (
                  <div key={contract.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-blue-600">
                        <Link href={`/rooms/${contract.roomId}`}>Phòng {contract.room.name}</Link>
                      </h3>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        contract.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {contract.status === 'active' ? 'Đang thuê' : contract.status === 'expired' ? 'Hết hạn' : 'Đã chấm dứt'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatDate(contract.startDate)} → {formatDate(contract.endDate)} · {formatCurrency(contract.rentPrice)}/tháng
                    </p>
                    <p className="text-xs text-gray-500">
                      Tiền cọc: {formatCurrency(contract.depositAmount)} · 
                      Trạng thái cọc: {contract.deposit_status === 'returned' ? 'Đã hoàn' : contract.deposit_status === 'paid' ? 'Đã đóng' : 'Chưa đóng'}
                    </p>

                    {/* Invoices for this contract */}
                    {contract.invoices.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Hóa đơn:</p>
                        <div className="flex flex-wrap gap-2">
                          {contract.invoices.map(inv => (
                            <Link key={inv.id} href={`/invoices/${inv.id}`}
                              className="text-xs px-2 py-0.5 rounded bg-gray-50 hover:bg-gray-100">
                              {inv.invoiceNumber}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
