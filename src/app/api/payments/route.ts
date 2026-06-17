import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { api, getBody } from '@/lib/api-helpers'

export const POST = api(async (request, session) => {
  const body = await getBody<{
    invoiceId: number; amount: number; paymentDate: string
    paymentMethod: string; reference?: string
  }>(request)

  if (!body || !body.invoiceId || !body.amount || !body.paymentDate || !body.paymentMethod) {
    return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
  }
  if (!['cash', 'transfer'].includes(body.paymentMethod)) {
    return NextResponse.json({ error: 'Phương thức thanh toán không hợp lệ' }, { status: 400 })
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: body.invoiceId },
    include: { payments: true },
  })
  if (!invoice) return NextResponse.json({ error: 'Không tìm thấy hóa đơn' }, { status: 404 })

  const totalPaid = invoice.payments.reduce((s, p) => s + p.amount, 0)
  const remaining = invoice.totalAmount - totalPaid

  if (body.amount > remaining) {
    return NextResponse.json({
      error: `Số tiền thanh toán (${body.amount.toLocaleString()}đ) vượt quá số còn lại (${remaining.toLocaleString()}đ)`
    }, { status: 400 })
  }

  const payment = await prisma.payment.create({
    data: {
      invoiceId: body.invoiceId,
      amount: body.amount,
      paymentDate: new Date(body.paymentDate),
      paymentMethod: body.paymentMethod,
      reference: body.reference || '',
    },
  })

  const newTotal = totalPaid + body.amount
  const status = newTotal >= invoice.totalAmount ? 'paid' : newTotal > 0 ? 'partial' : 'unpaid'
  await prisma.invoice.update({ where: { id: body.invoiceId }, data: { status } })

  return NextResponse.json(payment)
})
