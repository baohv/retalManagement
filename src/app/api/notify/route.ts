import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

    const body = await request.json()
    const { invoiceIds } = body

    const where = invoiceIds && Array.isArray(invoiceIds) && invoiceIds.length > 0
      ? { id: { in: invoiceIds } }
      : { status: { in: ['unpaid', 'overdue'] } }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        room: true,
        contract: {
          include: { contractTenants: { include: { tenant: true } } },
        },
      },
    })

    const notifications = invoices.map(inv => {
      const dueDate = inv.dueDate.toLocaleDateString('vi-VN')
      const tenants = inv.contract.contractTenants.map(ct => ({
        name: ct.tenant.fullName,
        phone: ct.tenant.phone,
      }))
      return {
        invoiceNumber: inv.invoiceNumber,
        room: inv.room.name,
        totalAmount: formatCurrency(inv.totalAmount),
        dueDate,
        tenants,
        message: `[QLPT] Nhắc nhở: Hóa đơn ${inv.invoiceNumber} - ${inv.room.name} - ${formatCurrency(inv.totalAmount)} - đến hạn ${dueDate}.`,
      }
    })

    return NextResponse.json({
      sent: invoices.length,
      notifications,
      message: `✅ Đã gửi nhắc nợ cho ${invoices.length} hóa đơn`,
    })
  } catch (error) {
    console.error('Notify error:', error)
    return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
  }
}
