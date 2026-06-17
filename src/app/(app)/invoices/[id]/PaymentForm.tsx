'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

export default function PaymentForm({ invoiceId, remaining }: { invoiceId: number; remaining: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [amount, setAmount] = useState(String(remaining))
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [reference, setReference] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId,
          amount: parseFloat(amount),
          paymentDate: new Date().toISOString(),
          paymentMethod,
          reference,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Ghi nhận thanh toán</h2>
      {error && <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg mb-3 text-xs">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Số tiền (tối đa {formatCurrency(remaining)})</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
            max={remaining} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Phương thức</label>
          <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="cash">Tiền mặt</option>
            <option value="transfer">Chuyển khoản</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Tham chiếu (nếu có)</label>
          <input type="text" value={reference} onChange={e => setReference(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50">
          {loading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
        </button>
      </form>
    </div>
  )
}
