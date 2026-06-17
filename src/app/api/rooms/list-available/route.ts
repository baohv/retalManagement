import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const rooms = await prisma.room.findMany({
    where: { status: 'available' },
    select: { id: true, name: true, price: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(rooms)
}
