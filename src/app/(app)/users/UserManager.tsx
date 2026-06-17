'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface User { id: number; name: string; email: string; role: string; phone: string; isActive: boolean; createdAt: string }

export default function UserManager({ users: initialUsers, currentUserId }: { users: User[]; currentUserId: number }) {
  const router = useRouter()
  const [users, setUsers] = useState(initialUsers)
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'staff' })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Có lỗi')
      setShowCreate(false)
      setForm({ name: '', email: '', password: '', phone: '', role: 'staff' })
      setUsers([...users, data])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally { setLoading(false) }
  }

  async function toggleActive(user: User) {
    if (user.id === currentUserId) return
    const res = await fetch('/api/users', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, isActive: !user.isActive }),
    })
    if (res.ok) setUsers(users.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u))
  }

  async function toggleRole(user: User) {
    if (user.id === currentUserId) return
    const newRole = user.role === 'admin' ? 'staff' : user.role === 'tenant' ? 'staff' : 'admin'
    const res = await fetch('/api/users', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, role: newRole }),
    })
    if (res.ok) setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u))
  }

  return (
    <div>
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Danh sách tài khoản</h2>
        <button onClick={() => setShowCreate(!showCreate)}
          className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          {showCreate ? 'Đóng' : '+ Thêm người dùng'}
        </button>
      </div>

      {showCreate && (
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-3">Tạo tài khoản mới</h3>
          {error && <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg mb-3 text-sm">{error}</div>}
          <form onSubmit={handleCreate} className="grid grid-cols-5 gap-3">
            <input type="text" placeholder="Họ tên" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" required />
            <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" required />
            <input type="password" placeholder="Mật khẩu" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" required />
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none">
              <option value="staff">Nhân viên</option>
              <option value="admin">Admin</option>
              <option value="tenant">Khách thuê</option>
            </select>
            <button type="submit" disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? '⏳' : 'Tạo'}
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
              <th className="px-6 py-3">Tên</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Vai trò</th>
              <th className="px-6 py-3">Trạng thái</th>
              <th className="px-6 py-3">Ngày tạo</th>
              <th className="px-6 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50/80">
                <td className="px-6 py-3 text-sm font-medium text-gray-900">
                  {user.name}
                  {user.id === currentUserId && <span className="text-xs text-blue-500 ml-2">(Bạn)</span>}
                </td>
                <td className="px-6 py-3 text-sm text-gray-600">{user.email}</td>
                <td className="px-6 py-3">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20' : 'bg-gray-50 text-gray-600 ring-1 ring-gray-500/10'}`}>
                    {user.role === 'admin' ? 'Admin' : 'Nhân viên'}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs ${user.isActive ? 'text-green-600' : 'text-red-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-400'}`} />
                    {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                <td className="px-6 py-3">
                  <div className="flex gap-2">
                    {user.id !== currentUserId && (
                      <>
                        <button onClick={() => toggleRole(user)}
                          className="text-xs px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 text-gray-600 transition"
                          title="Đổi vai trò">
                          {user.role === 'admin' ? '🔽 Nhân viên' : user.role === 'tenant' ? '🔼 Nhân viên' : '🔼 Admin'}
                        </button>
                        <button onClick={() => toggleActive(user)}
                          className="text-xs px-2 py-1 rounded hover:bg-gray-100 transition"
                          title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa'}>
                          {user.isActive ? '🔴 Khóa' : '🟢 Mở'}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
