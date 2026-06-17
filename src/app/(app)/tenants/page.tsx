export const dynamic = "force-dynamic";
import { prisma } from '@/lib/prisma'

import { formatDate } from '@/lib/utils'

import Link from 'next/link'

import PageHeader from '@/components/PageHeader'

import Table from '@/components/Table'

import EmptyState from '@/components/EmptyState'


export default async function TenantsPage() {
  const tenants = await prisma.tenant.findMany({
    orderBy: { fullName: 'asc' },
    include: {
      _count: { select: { contractTenants: true } },
    },
  })

  return (
    <div>
      <PageHeader
        title="Khách thuê"
        description={`Tổng số: ${tenants.length} khách thuê`}
        action={
          <Link href="/tenants/create"
            className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Thêm khách thuê
          </Link>
        }
      />

      {tenants.length === 0 ? (
        <EmptyState icon="👤" title="Chưa có khách thuê nào" actionLabel="Thêm khách thuê" actionHref="/tenants/create" />
      ) : (
        <Table
          columns={[
            { key: 'fullName', header: 'Họ tên', render: (t) => <Link href={`/tenants/${t.id}`} className="font-medium text-blue-600 hover:text-blue-700">{t.fullName}</Link> },
            { key: 'cccd', header: 'CCCD' },
            { key: 'phone', header: 'Số điện thoại' },
            { key: 'email', header: 'Email', render: (t) => t.email || <span className="text-gray-300">-</span> },
            { key: 'contracts', header: 'Hợp đồng', render: (t: any) => t._count.contractTenants, className: 'text-center' },
            { key: 'createdAt', header: 'Ngày thêm', render: (t) => formatDate(t.createdAt), className: 'text-gray-400' },
          ]}
          data={tenants}
          emptyMessage="Chưa có khách thuê"
        />
      )}
    </div>
  )
}
