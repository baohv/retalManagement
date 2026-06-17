'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface RoomData {
  id: number; name: string; floor: number; area: number
  price: number; deposit: number; status: string
  description: string; amenities: string
}

export default function EditRoomForm({ room }: { room: RoomData }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const existingAmenities = room.amenities !== '[]' ? JSON.parse(room.amenities).join(', ') : ''
  const [form, setForm] = useState({
    name: room.name, floor: String(room.floor), area: String(room.area),
    price: String(room.price), deposit: String(room.deposit),
    status: room.status, description: room.description, amenities: existingAmenities,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/rooms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: room.id, ...form,
          floor: parseInt(form.floor) || 1,
          area: parseFloat(form.area), price: parseFloat(form.price),
          deposit: parseFloat(form.deposit) || 0,
          amenities: form.amenities ? JSON.stringify(form.amenities.split(',').map((a: string) => a.trim()).filter(Boolean)) : '[]',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra')
      router.push(`/rooms/${room.id}`)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Link href={`/rooms/${room.id}`} className="text-sm text-blue-600 hover:text-blue-700 mb-4 block">← Quay lại</Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Chỉnh sửa phòng {room.name}</h1>
      {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên phòng *</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tầng</label>
            <input type="number" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích (m²) *</label>
            <input type="number" step="0.1" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá thuê (VNĐ) *</label>
            <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiền cọc (VNĐ)</label>
            <input type="number" value={form.deposit} onChange={e => setForm({ ...form, deposit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="available">Còn trống</option>
              <option value="rented">Đã thuê</option>
              <option value="maintenance">Bảo trì</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tiện ích</label>
          <input type="text" value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Máy lạnh, Tủ lạnh, Giường" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={3} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? 'Đang xử lý...' : 'Lưu thay đổi'}
          </button>
          <Link href={`/rooms/${room.id}`}
            className="px-6 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition">Hủy</Link>
        </div>
      </form>
    </div>
  )
}
