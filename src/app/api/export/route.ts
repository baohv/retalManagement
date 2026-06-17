import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

    const url = new URL(request.url)
    const type = url.searchParams.get('type') || 'revenue'
    const year = parseInt(url.searchParams.get('year') || String(new Date().getFullYear()))

    let csv = ''
    let filename = ''

    if (type === 'revenue') {
      csv = 'Tháng,Doanh thu,Tiền mặt,Chuyển khoản\n'
      for (let m = 1; m <= 12; m++) {
        const start = new Date(year, m - 1, 1)
        const end = new Date(year, m, 0)
        const total = await prisma.payment.aggregate({ _sum: { amount: true }, where: { paymentDate: { gte: start, lte: end } } })
        const cash = await prisma.payment.aggregate({ _sum: { amount: true }, where: { paymentDate: { gte: start, lte: end }, paymentMethod: 'cash' } })
        const transfer = await prisma.payment.aggregate({ _sum: { amount: true }, where: { paymentDate: { gte: start, lte: end }, paymentMethod: 'transfer' } })
        csv += `Tháng ${m},${total._sum.amount ?? 0},${cash._sum.amount ?? 0},${transfer._sum.amount ?? 0}\n`
      }
      filename = `doanh-thu-${year}.csv`
    } else if (type === 'invoices') {
      csv = 'Số HD,Phòng,Kỳ,Tổng tiền,Trạng thái,Ngày phát hành\n'
      const invoices = await prisma.invoice.findMany({
        orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
        include: { room: true },
      })
      for (const inv of invoices) {
        csv += `${inv.invoiceNumber},${inv.room.name},Tháng ${inv.periodMonth}/${inv.periodYear},${inv.totalAmount},${inv.status},${inv.issueDate.toISOString().split('T')[0]}\n`
      }
      filename = `hoa-don-${year}.csv`
    } else if (type === 'rooms') {
      csv = 'Phòng,Tầng,Diện tích,Giá thuê,Trạng thái\n'
      const rooms = await prisma.room.findMany({ orderBy: [{ floor: 'asc' }, { name: 'asc' }] })
      for (const r of rooms) csv += `${r.name},${r.floor},${r.area},${r.price},${r.status}\n`
      filename = `phong-tro.csv`
    }

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Có lỗi khi xuất dữ liệu' }, { status: 500 })
  }
}
