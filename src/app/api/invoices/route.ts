import { prisma } from '@/lib/prisma'
import { generateInvoiceNumber } from '@/lib/utils'
import { NextResponse } from 'next/server'
import { validateOrigin } from '@/lib/csrf'

function getProRataFactor(startDate: Date, year: number, month: number): number {
  // Calculate how many days the contract was active in the given month
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 0) // last day of month

  // If contract started after this month's start, use start date; otherwise use month start
  const effectiveStart = startDate > monthStart ? startDate : monthStart
  // If contract ends before this month's end, use end date; otherwise use month end
  // (contract endDate is exclusive check, but we treat it as inclusive of month)

  if (effectiveStart > monthEnd) return 0 // contract hasn't started yet this month

  const daysInMonth = monthEnd.getDate()
  const activeDays = monthEnd.getDate() - effectiveStart.getDate() + 1

  if (activeDays >= daysInMonth) return 1 // full month

  // Pro-rata: count actual days active / days in month
  return Math.round((activeDays / daysInMonth) * 100) / 100
}

export async function POST(request: Request) {
  try {
    if (!validateOrigin(request)) return NextResponse.json({ error: 'Yêu cầu không hợp lệ' }, { status: 403 })
    const body = await request.json()
    const { year, month, readings } = body
    const defaultInternet = 150000
    const defaultGarbage = 50000

    if (!year || !month || month < 1 || month > 12) {
      return NextResponse.json({ error: 'Tháng và năm không hợp lệ' }, { status: 400 })
    }

    // Get all active contracts
    const contracts = await prisma.contract.findMany({
      where: { status: 'active' },
      include: { room: true },
    })

    if (contracts.length === 0) {
      return NextResponse.json({ error: 'Không có hợp đồng đang hoạt động' }, { status: 400 })
    }

    const createdInvoices = []
    const skippedInvoices = []
    const errors = []

    for (const contract of contracts) {
      const invoiceNumber = generateInvoiceNumber(year, month, contract.roomId)

      // Check if invoice already exists
      const existing = await prisma.invoice.findUnique({ where: { invoiceNumber } })
      if (existing) {
        skippedInvoices.push(contract.room.name)
        continue
      }

      // Calculate pro-rata factor
      const prorata = getProRataFactor(contract.startDate, year, month)
      if (prorata <= 0) {
        skippedInvoices.push(`${contract.room.name} (chưa bắt đầu trong tháng)`)
        continue
      }

      // Calculate amounts
      const rentAmount = Math.round(contract.rentPrice * prorata)
      const reading = readings?.find((r: { roomId: number }) => r.roomId === contract.roomId)
      const electricityKwh = reading?.electricity || 0
      const electricityPrice = reading?.electricityPrice || 3500
      const waterM3 = reading?.water || 0
      const waterPrice = reading?.waterPrice || 15000
      const electricityAmount = Math.round(electricityKwh * electricityPrice)
      const waterAmount = Math.round(waterM3 * waterPrice)
      const internetAmount = reading?.internetFee ?? defaultInternet
      const garbageAmount = reading?.garbageFee ?? defaultGarbage

      const totalAmount = rentAmount + electricityAmount + waterAmount + internetAmount + garbageAmount

      if (totalAmount <= 0) {
        skippedInvoices.push(`${contract.room.name} (tổng tiền = 0)`)
        continue
      }

      try {
        const invoice = await prisma.invoice.create({
          data: {
            contractId: contract.id,
            roomId: contract.roomId,
            invoiceNumber,
            periodYear: year,
            periodMonth: month,
            issueDate: new Date(),
            dueDate: new Date(year, month, 15),
            totalAmount,
            status: 'unpaid',
            items: {
              create: [
                { type: 'rent', label: `Tiền thuê tháng ${month}/${year}${prorata < 1 ? ` (${Math.round(prorata * 100)}%)` : ''}`, quantity: 1, unitPrice: rentAmount, amount: rentAmount },
                ...(electricityKwh > 0 ? [{ type: 'electricity' as const, label: 'Tiền điện', quantity: electricityKwh, unitPrice: electricityPrice, amount: electricityAmount }] : []),
                ...(waterM3 > 0 ? [{ type: 'water' as const, label: 'Tiền nước', quantity: waterM3, unitPrice: waterPrice, amount: waterAmount }] : []),
                { type: 'internet' as const, label: 'Internet', quantity: 1, unitPrice: internetAmount, amount: internetAmount },
                { type: 'garbage' as const, label: 'Phí rác', quantity: 1, unitPrice: garbageAmount, amount: garbageAmount },
              ],
            },
          },
        })
        createdInvoices.push(invoice)

        // Save meter readings
        if (reading && (electricityKwh > 0 || waterM3 > 0)) {
          const readingEntries = []
          if (electricityKwh > 0) {
            readingEntries.push({
              roomId: contract.roomId,
              type: 'electricity',
              readingDate: new Date(),
              previousReading: 0,
              currentReading: electricityKwh,
              consumption: electricityKwh,
              unitPrice: electricityPrice,
            })
          }
          if (waterM3 > 0) {
            readingEntries.push({
              roomId: contract.roomId,
              type: 'water',
              readingDate: new Date(),
              previousReading: 0,
              currentReading: waterM3,
              consumption: waterM3,
              unitPrice: waterPrice,
            })
          }
          for (const entry of readingEntries) {
            await prisma.meterReading.create({ data: entry })
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        errors.push(`${contract.room.name}: ${message}`)
      }
    }

    return NextResponse.json({
      created: createdInvoices.length,
      skipped: skippedInvoices.length,
      errors: errors.length,
      details: {
        created_rooms: createdInvoices.map(i => ({ room: i.invoiceNumber })),
        skipped_rooms: skippedInvoices,
        error_details: errors,
      },
    })
  } catch (error) {
    console.error('Create invoices error:', error)
    return NextResponse.json({ error: 'Có lỗi khi tạo hóa đơn: ' + (error instanceof Error ? error.message : 'Lỗi không xác định') }, { status: 500 })
  }
}
