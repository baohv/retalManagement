export const dynamic = "force-dynamic";
import { prisma } from '@/lib/prisma'

import { formatDate } from '@/lib/utils'

import Link from 'next/link'


export default async function MeterReadingsPage() {
  const readings = await prisma.meterReading.findMany({
    orderBy: { readingDate: 'desc' },
    include: { room: true },
    take: 50,
  })

  // Group by type
  const electricityReadings = readings.filter(r => r.type === 'electricity').slice(0, 20)
  const waterReadings = readings.filter(r => r.type === 'water').slice(0, 20)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chỉ số điện / nước</h1>
          <p className="text-gray-500 mt-1">Lịch sử nhập chỉ số</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Electricity Readings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">⚡ Chỉ số điện</h2>
          {electricityReadings.length === 0 ? (
            <p className="text-gray-500 text-sm">Chưa có dữ liệu</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500">
                  <th className="pb-2 font-medium">Phòng</th>
                  <th className="pb-2 font-medium text-right">Chỉ số</th>
                  <th className="pb-2 font-medium text-right">Tiêu thụ (kWh)</th>
                  <th className="pb-2 font-medium text-right">Ngày</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {electricityReadings.map(r => (
                  <tr key={r.id}>
                    <td className="py-2 text-sm font-medium">{r.room.name}</td>
                    <td className="py-2 text-sm text-right">{r.currentReading}</td>
                    <td className="py-2 text-sm text-right">{r.consumption}</td>
                    <td className="py-2 text-sm text-right text-gray-500">{formatDate(r.readingDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Water Readings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">💧 Chỉ số nước</h2>
          {waterReadings.length === 0 ? (
            <p className="text-gray-500 text-sm">Chưa có dữ liệu</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500">
                  <th className="pb-2 font-medium">Phòng</th>
                  <th className="pb-2 font-medium text-right">Chỉ số</th>
                  <th className="pb-2 font-medium text-right">Tiêu thụ (m³)</th>
                  <th className="pb-2 font-medium text-right">Ngày</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {waterReadings.map(r => (
                  <tr key={r.id}>
                    <td className="py-2 text-sm font-medium">{r.room.name}</td>
                    <td className="py-2 text-sm text-right">{r.currentReading}</td>
                    <td className="py-2 text-sm text-right">{r.consumption}</td>
                    <td className="py-2 text-sm text-right text-gray-500">{formatDate(r.readingDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
