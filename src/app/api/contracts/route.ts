import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { validateOrigin } from '@/lib/csrf'

export async function POST(request: Request) {
  try {
    if (!validateOrigin(request)) return NextResponse.json({ error: 'Yêu cầu không hợp lệ' }, { status: 403 })
    const body = await request.json()
    const { tenantIds, ...contractData } = body

    const contract = await prisma.contract.create({
      data: {
        roomId: contractData.roomId,
        startDate: new Date(contractData.startDate),
        endDate: new Date(contractData.endDate),
        rentPrice: parseFloat(contractData.rentPrice),
        depositAmount: parseFloat(contractData.depositAmount) || 0,
        deposit_status: "pending",
        status: 'active',
        terms: contractData.terms || '',
        notes: contractData.notes || '',
        contractTenants: {
          create: (tenantIds || []).map((tenantId: number, idx: number) => ({
            tenantId,
            isPrimary: idx === 0,
          })),
        },
      },
      include: {
        room: true,
        contractTenants: { include: { tenant: true } },
      },
    })

    // Update room status
    await prisma.room.update({
      where: { id: contractData.roomId },
      data: { status: 'rented' },
    })

    return NextResponse.json(contract)
  } catch (error) {
    console.error('Create contract error:', error)
    return NextResponse.json({ error: 'Có lỗi khi tạo hợp đồng' }, { status: 500 })
  }
}
