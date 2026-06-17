'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

interface ContractData {
  id: number
  status: string
  depositStatus: string
  roomId: number
  roomName: string
  rentPrice: number
  startDate: string
  endDate: string
}

export default function ContractActions({ contract }: { contract: ContractData }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showRenew, setShowRenew] = useState(false)
  const [showTerminate, setShowTerminate] = useState(false)
  const [renewEndDate, setRenewEndDate] = useState('')
  const [renewPrice, setRenewPrice] = useState(String(contract.rentPrice))
  const [terminateReason, setTerminateReason] = useState('')

  const isActive = contract.status === 'active'

  async function handleAction(action: string, extra: Record<string, string> = {}) {
    setLoading(action)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/contracts/actions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: contract.id, action, ...extra }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(data.message)
      setShowRenew(false)
      setShowTerminate(false)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      {/* Actions Panel */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Thao tác</h2>

        {error && <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg mb-3 text-xs">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 px-3 py-2 rounded-lg mb-3 text-xs">{success}</div>}

        <div className="space-y-3">
          {isActive && (
            <>
              <button onClick={() => { setShowRenew(true); setShowTerminate(false) }}
                className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                🔄 Gia hạn hợp đồng
              </button>
              <button onClick={() => { setShowTerminate(true); setShowRenew(false) }}
                className="w-full bg-red-50 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition">
                ⛔ Chấm dứt hợp đồng
              </button>
            </>
          )}

          {contract.depositStatus === 'paid' && (
            <button onClick={() => handleAction('return-deposit')}
              disabled={loading === 'return-deposit'}
              className="w-full bg-green-50 text-green-600 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition disabled:opacity-50">
              {loading === 'return-deposit' ? 'Đang xử lý...' : '💵 Hoàn cọc'}
            </button>
          )}
        </div>
      </div>

      {/* Renew Modal */}
      {showRenew && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowRenew(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gia hạn hợp đồng</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc mới *</label>
                <input type="date" value={renewEndDate} onChange={e => setRenewEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá thuê mới</label>
                <input type="number" value={renewPrice} onChange={e => setRenewPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => handleAction('renew', { newEndDate: renewEndDate, newRentPrice: renewPrice })}
                  disabled={loading === 'renew' || !renewEndDate}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50">
                  {loading === 'renew' ? 'Đang xử lý...' : 'Xác nhận gia hạn'}
                </button>
                <button onClick={() => setShowRenew(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50">
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terminate Modal */}
      {showTerminate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowTerminate(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-red-600 mb-4">Chấm dứt hợp đồng</h3>
            <p className="text-sm text-gray-600 mb-3">Phòng {contract.roomName} sẽ được chuyển sang trạng thái "Còn trống".</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do chấm dứt</label>
                <textarea value={terminateReason} onChange={e => setTerminateReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none" rows={3} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleAction('terminate', { reason: terminateReason })}
                  disabled={loading === 'terminate'}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition disabled:opacity-50">
                  {loading === 'terminate' ? 'Đang xử lý...' : 'Xác nhận chấm dứt'}
                </button>
                <button onClick={() => setShowTerminate(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50">
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
