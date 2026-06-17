import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const contracts = await prisma.contract.findMany({
    where: { status: 'active' },
    select: {
      id: true,
      roomId: true,
      rentPrice: true,
      room: { select: { id: true, name: true } },
    },
  })
  return NextResponse.json(contracts)
}
