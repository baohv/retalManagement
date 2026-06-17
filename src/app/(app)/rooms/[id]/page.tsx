import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function RoomDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const room = await prisma.room.findUnique({
    where: { id: parseInt(id) },
    include: {
      contracts: {
        where: { status: 'active' },
        include: {
          contractTenants: {
            include: { tenant: true },
          },
        },
      },
      invoices: {
        orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
        take: 6,
      },
    },
  })

  if (!room) notFound()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/rooms" className="text-sm text-blue-600 hover:text-blue-700 mb-2 block">← Quay lại danh sách</Link>
          <h1 className="text-2xl font-bold text-gray-900">Phòng {room.name}</h1>
        </div>
        <Link
          href={`/rooms/${room.id}/edit`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          Chỉnh sửa
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Room Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Thông tin phòng</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-gray-500">Tên phòng</dt><dd className="font-medium text-gray-900">{room.name}</dd></div>
              <div><dt className="text-gray-500">Tầng</dt><dd className="font-medium text-gray-900">{room.floor}</dd></div>
              <div><dt className="text-gray-500">Diện tích</dt><dd className="font-medium text-gray-900">{room.area}m²</dd></div>
              <div><dt className="text-gray-500">Giá thuê</dt><dd className="font-medium text-blue-600">{formatCurrency(room.price)}/tháng</dd></div>
              <div><dt className="text-gray-500">Tiền cọc</dt><dd className="font-medium text-gray-900">{formatCurrency(room.deposit)}</dd></div>
              <div><dt className="text-gray-500">Trạng thái</dt><dd><span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(room.status)}`}>{getStatusLabel(room.status)}</span></dd></div>
            </dl>
          </div>

          {/* Active Contracts */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Hợp đồng hiện tại</h2>
            {room.contracts.length === 0 ? (
              <p className="text-gray-500 text-sm">Chưa có hợp đồng nào</p>
            ) : (
              room.contracts.map(contract => (
                <div key={contract.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(contract.status)}`}>
                      {getStatusLabel(contract.status)}
                    </span>
                    <span className="text-sm text-gray-500">{formatDate(contract.startDate)} - {formatDate(contract.endDate)}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(contract.rentPrice)}/tháng</p>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Khách thuê:</p>
                    {contract.contractTenants.map(ct => (
                      <p key={ct.id} className="text-sm text-gray-900">{ct.tenant.fullName} ({ct.tenant.phone})</p>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Recent Invoices */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Hóa đơn gần đây</h2>
            {room.invoices.length === 0 ? (
              <p className="text-gray-500 text-sm">Chưa có hóa đơn nào</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {room.invoices.map(invoice => (
                  <div key={invoice.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-gray-500">Tháng {invoice.periodMonth}/{invoice.periodYear}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(invoice.totalAmount)}</p>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                        {getStatusLabel(invoice.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Tiện ích</h2>
            {room.amenities === '[]' ? (
              <p className="text-gray-500 text-sm">Chưa có thông tin</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {JSON.parse(room.amenities).map((a: string) => (
                  <span key={a} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm">{a}</span>
                ))}
              </div>
            )}
          </div>

          {room.description && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Mô tả</h2>
              <p className="text-sm text-gray-600">{room.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
