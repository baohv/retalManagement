import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const tenants = await prisma.tenant.findMany({
    select: { id: true, fullName: true, phone: true },
    orderBy: { fullName: 'asc' },
  })
  return NextResponse.json(tenants)
}
