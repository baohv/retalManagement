'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfileForm({ user }: { user: { name: string; email: string; phone: string; role: string; createdAt: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    if (newPassword && newPassword !== confirmPassword) { setError('Mật khẩu mới không khớp'); setLoading(false); return }
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, ...(newPassword ? { currentPassword, newPassword } : {}) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Có lỗi')
      setSuccess(data.message)
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      router.refresh()
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Có lỗi') }
    finally { setLoading(false) }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4 pb-4 border-b border-gray-100">
          <span className={'inline-flex px-2.5 py-1 text-xs font-medium rounded-full ' + (user.role === 'admin' ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20' : 'bg-gray-50 text-gray-600 ring-1 ring-gray-500/10')}>
            {user.role === 'admin' ? '🛡️ Admin' : '👤 Nhân viên'}
          </span>
          <p className="text-xs text-gray-400 mt-2">Tham gia từ {new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={user.email} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
        <hr className="border-gray-100" />
        <h3 className="font-medium text-gray-900">Đổi mật khẩu</h3>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
          <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
        </div>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 shadow-sm">
          {loading ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
        </button>
      </form>
    </div>
  )
}
