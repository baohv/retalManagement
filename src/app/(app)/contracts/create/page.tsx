'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Room { id: number; name: string; price: number }
interface Tenant { id: number; fullName: string; phone: string }

export default function CreateContractPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rooms, setRooms] = useState<Room[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [form, setForm] = useState({
    roomId: '', startDate: '', endDate: '', rentPrice: '',
    depositAmount: '', terms: '', notes: '',
  })
  const [selectedTenants, setSelectedTenants] = useState<number[]>([])

  useEffect(() => {
    async function loadData() {
      const [roomRes, tenantRes] = await Promise.all([
        fetch('/api/rooms/list-available').then(r => r.json()),
        fetch('/api/tenants/list-all').then(r => r.json()),
      ])
      setRooms(roomRes)
      setTenants(tenantRes)
    }
    loadData()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedTenants.length === 0) { setError('Vui lòng chọn ít nhất một khách thuê'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, roomId: parseInt(form.roomId), tenantIds: selectedTenants }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra')
      router.push('/contracts')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  function toggleTenant(id: number) {
    setSelectedTenants(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/contracts" className="text-sm text-blue-600 hover:text-blue-700 mb-4 block">← Quay lại</Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tạo hợp đồng mới</h1>
      {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phòng *</label>
          <select value={form.roomId} onChange={e => {
            const room = rooms.find(r => r.id === parseInt(e.target.value))
            setForm({ ...form, roomId: e.target.value, rentPrice: room ? String(room.price) : '' })
          }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required>
            <option value="">Chọn phòng</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>{room.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu *</label>
            <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc *</label>
            <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá thuê (VNĐ/tháng) *</label>
            <input type="number" value={form.rentPrice} onChange={e => setForm({ ...form, rentPrice: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiền cọc (VNĐ)</label>
            <input type="number" value={form.depositAmount} onChange={e => setForm({ ...form, depositAmount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Chọn khách thuê *</label>
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
            {tenants.map(tenant => (
              <label key={tenant.id} className={`flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50 ${selectedTenants.includes(tenant.id) ? 'bg-blue-50' : ''}`}>
                <input type="checkbox" checked={selectedTenants.includes(tenant.id)} onChange={() => toggleTenant(tenant.id)} className="mr-3" />
                <span className="text-sm">{tenant.fullName} ({tenant.phone})</span>
              </label>
            ))}
            {tenants.length === 0 && <p className="px-3 py-2 text-sm text-gray-500">Chưa có khách thuê. <Link href="/tenants/create" className="text-blue-600">Thêm khách thuê</Link></p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Điều khoản</label>
          <textarea value={form.terms} onChange={e => setForm({ ...form, terms: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={3} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? 'Đang xử lý...' : 'Tạo hợp đồng'}
          </button>
          <Link href="/contracts" className="px-6 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition">Hủy</Link>
        </div>
      </form>
    </div>
  )
}
