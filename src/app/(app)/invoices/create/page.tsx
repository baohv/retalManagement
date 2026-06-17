'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface ContractData {
  id: number; roomId: number; rentPrice: number
  room: { id: number; name: string }
}

interface RoomReading {
  electricity: string; water: string
  elecPrice: string; waterPrice: string
  internetFee: string; garbageFee: string
}

function InvoiceCreateForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [mode, setMode] = useState<'batch' | 'single'>('batch')
  const [contracts, setContracts] = useState<ContractData[]>([])
  const [readings, setReadings] = useState<Record<number, RoomReading>>({})
  const [selectedRoom, setSelectedRoom] = useState(searchParams.get('roomId') || '')
  const [singleElec, setSingleElec] = useState('')
  const [singleWater, setSingleWater] = useState('')
  const [singleElecPrice, setSingleElecPrice] = useState('3500')
  const [singleWaterPrice, setSingleWaterPrice] = useState('15000')
  const [singleInternet, setSingleInternet] = useState('150000')
  const [singleGarbage, setSingleGarbage] = useState('50000')
  const selectedContract = contracts.find((c: any) => String(c.roomId) === selectedRoom)

  useEffect(() => {
    fetch('/api/invoices/active-contracts').then(r => r.json()).then(data => {
      setContracts(data)
      const init: Record<number, RoomReading> = {}
      data.forEach((c: ContractData) => {
        init[c.roomId] = {
          electricity: '', water: '',
          elecPrice: '3500', waterPrice: '15000',
          internetFee: '150000', garbageFee: '50000',
        }
      })
      setReadings(init)
    })
    if (searchParams.get('roomId')) {
      setMode('single')
      setSelectedRoom(searchParams.get('roomId')!)
    }
  }, [searchParams])

  function updateReading(roomId: number, field: keyof RoomReading, value: string) {
    setReadings(prev => ({
      ...prev,
      [roomId]: { ...prev[roomId], [field]: value },
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    try {
      let readingsPayload: any[] = []

      if (mode === 'single') {
        if (!selectedRoom) { setError('Vui lòng chọn phòng'); setLoading(false); return }
        readingsPayload = [{
          roomId: parseInt(selectedRoom),
          electricity: parseFloat(singleElec) || 0,
          water: parseFloat(singleWater) || 0,
          electricityPrice: parseFloat(singleElecPrice) || 3500,
          waterPrice: parseFloat(singleWaterPrice) || 15000,
          internetFee: parseFloat(singleInternet) || 150000,
          garbageFee: parseFloat(singleGarbage) || 50000,
        }]
      } else {
        // Batch: collect readings from React state
        for (const [roomIdStr, r] of Object.entries(readings)) {
          const roomId = parseInt(roomIdStr)
          readingsPayload.push({
            roomId,
            electricity: parseFloat(r.electricity) || 0,
            water: parseFloat(r.water) || 0,
            electricityPrice: parseFloat(r.elecPrice) || 3500,
            waterPrice: parseFloat(r.waterPrice) || 15000,
            internetFee: parseFloat(r.internetFee) || 150000,
            garbageFee: parseFloat(r.garbageFee) || 50000,
          })
        }
      }

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, readings: readingsPayload }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra')
      setSuccess(`✅ Đã tạo ${data.created} hóa đơn!${data.skipped > 0 ? ` (${data.skipped} đã tồn tại)` : ''}`)
      if (data.created > 0) {
        setTimeout(() => router.push('/invoices'), 1500)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/invoices" className="text-sm text-blue-600 hover:text-blue-700 mb-4 block">← Quay lại</Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tạo hóa đơn</h1>
      {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm border border-red-200">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm border border-green-200">{success}</div>}

      {/* Mode selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex gap-3">
        <button onClick={() => setMode('batch')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'batch' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          📋 Tạo hàng loạt (tất cả phòng)
        </button>
        <button onClick={() => setMode('single')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'single' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          🏠 Tạo cho 1 phòng
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Period */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Kỳ hóa đơn:</span>
          <select value={month} onChange={e => setMonth(parseInt(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>Tháng {m}</option>
            ))}
          </select>
          <input type="number" value={year} onChange={e => setYear(parseInt(e.target.value))}
            className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none" />
        </div>

        {/* Single mode */}
        {mode === 'single' && (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chọn phòng</label>
              <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)}
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Chọn phòng</option>
                {contracts.map(c => (
                  <option key={c.roomId} value={c.roomId}>{c.room.name} ({formatCurrency(c.rentPrice)})</option>
                ))}
              </select>
            </div>

            {selectedContract && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Điện (kWh)</label>
                  <input type="number" step="0.1" value={singleElec} onChange={e => setSingleElec(e.target.value)}
                    placeholder="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Giá điện (đ/kWh)</label>
                  <input type="number" value={singleElecPrice} onChange={e => setSingleElecPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nước (m³)</label>
                  <input type="number" step="0.1" value={singleWater} onChange={e => setSingleWater(e.target.value)}
                    placeholder="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Giá nước (đ/m³)</label>
                  <input type="number" value={singleWaterPrice} onChange={e => setSingleWaterPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Internet (đ)</label>
                  <input type="number" value={singleInternet} onChange={e => setSingleInternet(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phí rác (đ)</label>
                  <input type="number" value={singleGarbage} onChange={e => setSingleGarbage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Batch mode */}
        {mode === 'batch' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                  <th className="px-3 py-3">Phòng</th>
                  <th className="px-3 py-3">Giá thuê</th>
                  <th className="px-3 py-3">⚡ Điện (kWh)</th>
                  <th className="px-3 py-3">Giá điện</th>
                  <th className="px-3 py-3">💧 Nước (m³)</th>
                  <th className="px-3 py-3">Giá nước</th>
                  <th className="px-3 py-3">🌐 Internet</th>
                  <th className="px-3 py-3">🗑️ Rác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contracts.map(c => {
                  const r = readings[c.roomId]
                  if (!r) return null
                  return (
                    <tr key={c.roomId} className="hover:bg-gray-50/50">
                      <td className="px-3 py-2 text-sm font-medium">{c.room.name}</td>
                      <td className="px-3 py-2 text-sm text-gray-600">{formatCurrency(c.rentPrice)}</td>
                      <td className="px-3 py-2">
                        <input type="number" step="0.1" value={r.electricity}
                          onChange={e => updateReading(c.roomId, 'electricity', e.target.value)}
                          className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={r.elecPrice}
                          onChange={e => updateReading(c.roomId, 'elecPrice', e.target.value)}
                          className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm outline-none" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" step="0.1" value={r.water}
                          onChange={e => updateReading(c.roomId, 'water', e.target.value)}
                          className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={r.waterPrice}
                          onChange={e => updateReading(c.roomId, 'waterPrice', e.target.value)}
                          className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm outline-none" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={r.internetFee}
                          onChange={e => updateReading(c.roomId, 'internetFee', e.target.value)}
                          className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm outline-none" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={r.garbageFee}
                          onChange={e => updateReading(c.roomId, 'garbageFee', e.target.value)}
                          className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm outline-none" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Submit */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {mode === 'batch'
              ? 'Nhập chỉ số cho từng phòng — điện, nước, internet, rác đều có thể điều chỉnh'
              : 'Nhập chỉ số và phí dịch vụ cho phòng được chọn'}
          </p>
          <button type="submit" disabled={loading || (mode === 'single' && !selectedRoom)}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 shadow-sm">
            {loading ? '⏳ Đang tạo...' : '🧾 Tạo hóa đơn'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function InvoiceCreatePage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-gray-500">Đang tải...</div>}>
      <InvoiceCreateForm />
    </Suspense>
  )
}
