export const dynamic = "force-dynamic";
import { prisma } from '@/lib/prisma'

import { formatCurrency, formatDate } from '@/lib/utils'

import Link from 'next/link'

import Badge from '@/components/Badge'

import Card from '@/components/Card'

import PageHeader from '@/components/PageHeader'

import EmptyState from '@/components/EmptyState'


export default async function RoomsPage() {
  const rooms = await prisma.room.findMany({
    orderBy: [{ floor: 'asc' }, { name: 'asc' }],
    include: {
      _count: { select: { contracts: { where: { status: 'active' } } } },
    },
  })

  return (
    <div>
      <PageHeader
        title="Quản lý phòng"
        description={`Tổng số: ${rooms.length} phòng`}
        action={
          <Link href="/rooms/create"
            className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Thêm phòng
          </Link>
        }
      />

      {rooms.length === 0 ? (
        <EmptyState icon="🏠" title="Chưa có phòng nào" description="Thêm phòng trọ đầu tiên để bắt đầu" actionLabel="Thêm phòng" actionHref="/rooms/create" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <Link key={room.id} href={`/rooms/${room.id}`}>
              <Card hover className="p-5 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                    <p className="text-sm text-gray-500">Tầng {room.floor} · {room.area}m²</p>
                  </div>
                  <Badge status={room.status} />
                </div>

                <div className="mt-auto space-y-2">
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(room.price)}<span className="text-sm font-normal text-gray-400">/th</span></p>
                  
                  {room._count.contracts > 0 && (
                    <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Đang có hợp đồng
                    </p>
                  )}
                </div>

                {room.amenities !== '[]' && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {JSON.parse(room.amenities).slice(0, 4).map((a: string) => (
                      <span key={a} className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded-md text-xs ring-1 ring-gray-200">
                        {a}
                      </span>
                    ))}
                    {JSON.parse(room.amenities).length > 4 && (
                      <span className="text-gray-400 text-xs px-2 py-0.5">+{JSON.parse(room.amenities).length - 4}</span>
                    )}
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
