'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getNavItems } from '@/lib/permissions'


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [navItems, setNavItems] = useState<any[]>([])

  useEffect(() => {
    // Fetch role from API (cookie is httpOnly, can't read via document.cookie)
    fetch('/api/users/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.role) {
          setUserRole(data.role)
          setNavItems(getNavItems(data.role))
        }
      })
      .catch(() => {
        // Fallback: try reading from cookie directly (non-httpOnly fallback)
        try {
          const cookies = document.cookie.split(';').map(c => c.trim())
          const sessionCookie = cookies.find(c => c.startsWith('session='))
          if (sessionCookie) {
            const base64 = sessionCookie.slice(8).replace(/-/g, '+').replace(/_/g, '/')
            const decoded = atob(base64)
            const parts = decoded.split('.')[0].split(':')
            const role = parts[2] || 'staff'
            setUserRole(role)
            setNavItems(getNavItems(role))
          }
        } catch { /* ignore */ }
      })
  }, [pathname])

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-30 h-screen w-64 bg-slate-900 border-r border-slate-800 
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /><h1 className="text-xl font-bold text-white">Quản Lý Phòng Trọ</h1></div>
          <p className="text-sm text-slate-400 mt-1">Hệ thống quản lý</p>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-blue-600/20 text-blue-300 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-0.5'
                  }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/20 w-full transition"
          >
            <span>🚪</span>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen bg-gray-50">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="font-semibold text-gray-900">Quản Lý Phòng Trọ</h2>
          <div className="w-10" />
        </div>

        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
