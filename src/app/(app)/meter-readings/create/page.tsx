'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface RoomData {
  id: number; name: string; floor: number
  latest: { electricity: { currentReading: number } | null; water: { currentReading: number } | null }
  previous: { electricity: { currentReading: number } | null; water: { currentReading: number } | null }
}

export default function CreateMeterReadingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [rooms, setRooms] = useState<RoomData[]>([])
  const [readings, setReadings] = useState<Record<number, {
    elecPrev: string; elecCurr: string; elecPrice: string
    waterPrev: string; waterCurr: string; waterPrice: string
  }>>({})
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetch('/api/meter-readings/rooms').then(r => r.json()).then(data => {
      setRooms(data.filter((r: any) => r.latest !== undefined))
      const init: Record<number, any> = {}
      data.forEach((room: RoomData) => {
        init[room.id] = {
          elecPrev: room.latest.electricity ? String(room.latest.electricity.currentReading) : '0',
          elecCurr: '',
          elecPrice: '3500',
          waterPrev: room.latest.water ? String(room.latest.water.currentReading) : '0',
          waterCurr: '',
          waterPrice: '15000',
        }
      })
      setReadings(init)
    })
  }, [])

  function updateReading(roomId: number, field: string, value: string) {
    setReadings(prev => ({ ...prev, [roomId]: { ...prev[roomId], [field]: value } }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')

    const payload: any[] = []
    for (const [roomIdStr, r] of Object.entries(readings)) {
      const roomId = parseInt(roomIdStr)
      if (!r.elecCurr && !r.waterCurr) continue

      if (r.elecCurr) {
        const prev = parseFloat(r.elecPrev) || 0
        const curr = parseFloat(r.elecCurr)
        if (curr < prev) {
          setError(`Phòng ${rooms.find(x => x.id === roomId)?.name || roomId}: chỉ số điện hiện tại (${curr}) nhỏ hơn chỉ số cũ (${prev})`)
          setLoading(false); return
        }
        payload.push({ roomId, type: 'electricity', previousReading: prev, currentReading: curr, unitPrice: parseFloat(r.elecPrice) || 3500 })
      }
      if (r.waterCurr) {
        const prev = parseFloat(r.waterPrev) || 0
        const curr = parseFloat(r.waterCurr)
        if (curr < prev) {
          setError(`Phòng ${rooms.find(x => x.id === roomId)?.name || roomId}: chỉ số nước hiện tại (${curr}) nhỏ hơn chỉ số cũ (${prev})`)
          setLoading(false); return
        }
        payload.push({ roomId, type: 'water', previousReading: prev, currentReading: curr, unitPrice: parseFloat(r.waterPrice) || 15000 })
      }
    }

    if (payload.length === 0) { setError('Vui lòng nhập ít nhất một chỉ số'); setLoading(false); return }

    try {
      const res = await fetch('/api/meter-readings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readings: payload }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra')
      setSuccess(`✅ Đã nhập ${data.created} chỉ số thành công!`)
      
      // Reload rooms to update previous values
      const r2 = await fetch('/api/meter-readings/rooms').then(r => r.json())
      setRooms(r2)
      const reset: Record<number, any> = {}
      r2.forEach((room: RoomData) => {
        reset[room.id] = {
          elecPrev: room.latest.electricity ? String(room.latest.electricity.currentReading) : '0',
          elecCurr: '', elecPrice: '3500',
          waterPrev: room.latest.water ? String(room.latest.water.currentReading) : '0',
          waterCurr: '', waterPrice: '15000',
        }
      })
      setReadings(reset)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/meter-readings" className="text-sm text-blue-600 hover:text-blue-700 mb-4 block">← Quay lại</Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nhập chỉ số điện / nước</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tháng {month}/{year}</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={month} onChange={e => setMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>Tháng {m}</option>)}
          </select>
          <input type="number" value={year} onChange={e => setYear(parseInt(e.target.value))}
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm border border-red-200">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm border border-green-200">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                <th className="px-4 py-3" rowSpan={2}>Phòng</th>
                <th className="px-4 py-3 text-center border-b border-gray-100" colSpan={4}>⚡ Điện</th>
                <th className="px-4 py-3 text-center border-b border-gray-100" colSpan={4}>💧 Nước</th>
              </tr>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                <th className="px-2 py-2">Chỉ số cũ</th>
                <th className="px-2 py-2">Chỉ số mới</th>
                <th className="px-2 py-2">Tiêu thụ</th>
                <th className="px-2 py-2">Đơn giá</th>
                <th className="px-2 py-2">Chỉ số cũ</th>
                <th className="px-2 py-2">Chỉ số mới</th>
                <th className="px-2 py-2">Tiêu thụ</th>
                <th className="px-2 py-2">Đơn giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rooms.map(room => {
                const r = readings[room.id]
                if (!r) return null
                const elecConsum = r.elecCurr ? Math.max(0, parseFloat(r.elecCurr) - (parseFloat(r.elecPrev) || 0)) : 0
                const waterConsum = r.waterCurr ? Math.max(0, parseFloat(r.waterCurr) - (parseFloat(r.waterPrev) || 0)) : 0

                return (
                  <tr key={room.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {room.name}
                      <span className="text-gray-400 ml-1 font-normal">T{room.floor}</span>
                    </td>
                    {/* Electricity */}
                    <td className="px-2 py-2">
                      <input type="number" step="0.1"
                        value={r.elecPrev}
                        onChange={e => updateReading(room.id, 'elecPrev', e.target.value)}
                        className="w-24 px-2 py-1.5 border border-gray-300 rounded-lg text-sm bg-gray-50 outline-none" />
                    </td>
                    <td className="px-2 py-2">
                      <input type="number" step="0.1"
                        value={r.elecCurr}
                        onChange={e => updateReading(room.id, 'elecCurr', e.target.value)}
                        placeholder="Nhập..."
                        className="w-24 px-2 py-1.5 border border-blue-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </td>
                    <td className="px-2 py-2 text-sm text-center">
                      {elecConsum > 0 ? (
                        <span className="font-medium text-blue-600">{elecConsum} kWh</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-2 py-2">
                      <input type="number" value={r.elecPrice}
                        onChange={e => updateReading(room.id, 'elecPrice', e.target.value)}
                        className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm outline-none" />
                    </td>
                    {/* Water */}
                    <td className="px-2 py-2">
                      <input type="number" step="0.1"
                        value={r.waterPrev}
                        onChange={e => updateReading(room.id, 'waterPrev', e.target.value)}
                        className="w-24 px-2 py-1.5 border border-gray-300 rounded-lg text-sm bg-gray-50 outline-none" />
                    </td>
                    <td className="px-2 py-2">
                      <input type="number" step="0.1"
                        value={r.waterCurr}
                        onChange={e => updateReading(room.id, 'waterCurr', e.target.value)}
                        placeholder="Nhập..."
                        className="w-24 px-2 py-1.5 border border-blue-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </td>
                    <td className="px-2 py-2 text-sm text-center">
                      {waterConsum > 0 ? (
                        <span className="font-medium text-cyan-600">{waterConsum} m³</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-2 py-2">
                      <input type="number" value={r.waterPrice}
                        onChange={e => updateReading(room.id, 'waterPrice', e.target.value)}
                        className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm outline-none" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <p className="text-sm text-gray-500">Chỉ số cũ được tự động điền từ tháng trước</p>
          <button type="submit" disabled={loading}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 shadow-sm">
            {loading ? '⏳ Đang lưu...' : '💾 Lưu chỉ số'}
          </button>
        </div>
      </form>
    </div>
  )
}
