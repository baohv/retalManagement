import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const rooms = await prisma.room.findMany({
    where: { status: { notIn: ['maintenance'] } },
    orderBy: [{ floor: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      floor: true,
      status: true,
      meterReadings: {
        orderBy: { readingDate: 'desc' },
        take: 2,
      },
    },
  })

  const result = rooms.map(room => {
    const elec = room.meterReadings.filter(r => r.type === 'electricity')
    const water = room.meterReadings.filter(r => r.type === 'water')

    return {
      id: room.id,
      name: room.name,
      floor: room.floor,
      status: room.status,  // ← added
      latest: {
        electricity: elec[0] || null,
        water: water[0] || null,
      },
      previous: {
        electricity: elec[1] || elec[0] || null,
        water: water[1] || water[0] || null,
      },
    }
  })

  return NextResponse.json(result)
}
