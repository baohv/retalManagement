// Permission system — single source of truth for all role-based access.

export type Role = 'admin' | 'staff' | 'tenant'

export type Permission =
  | 'rooms.read' | 'rooms.create' | 'rooms.edit' | 'rooms.delete'
  | 'tenants.read' | 'tenants.create' | 'tenants.edit' | 'tenants.delete'
  | 'contracts.read' | 'contracts.create' | 'contracts.edit' | 'contracts.delete'
  | 'invoices.read' | 'invoices.create' | 'invoices.edit'
  | 'payments.read' | 'payments.create'
  | 'meter.read' | 'meter.create'
  | 'maintenance.read' | 'maintenance.create' | 'maintenance.edit'
  | 'reports.read'
  | 'users.manage'
  | 'dashboard.read'
  | 'export.data'
  | 'own.invoices.read'    // tenant: only own invoices
  | 'own.contract.read'    // tenant: only own contract
  | 'own.room.read'        // tenant: only own room

const PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    'rooms.read', 'rooms.create', 'rooms.edit', 'rooms.delete',
    'tenants.read', 'tenants.create', 'tenants.edit', 'tenants.delete',
    'contracts.read', 'contracts.create', 'contracts.edit', 'contracts.delete',
    'invoices.read', 'invoices.create', 'invoices.edit',
    'payments.read', 'payments.create',
    'meter.read', 'meter.create',
    'maintenance.read', 'maintenance.create', 'maintenance.edit',
    'reports.read',
    'users.manage',
    'dashboard.read',
    'export.data',
  ],
  staff: [
    'rooms.read', 'rooms.create', 'rooms.edit',
    'tenants.read', 'tenants.create', 'tenants.edit',
    'contracts.read', 'contracts.create', 'contracts.edit',
    'invoices.read', 'invoices.create', 'invoices.edit',
    'payments.read', 'payments.create',
    'meter.read', 'meter.create',
    'maintenance.read', 'maintenance.create', 'maintenance.edit',
    'reports.read',
    'dashboard.read',
    // No delete, no users.manage, no export
  ],
  tenant: [
    'own.invoices.read', 'own.contract.read', 'own.room.read',
    // Tenants can only see their own data
  ],
}

export function hasPermission(role: string | null | undefined, permission: Permission): boolean {
  if (!role) return false
  return (PERMISSIONS[role as Role] || []).includes(permission)
}

export function getNavItems(role: string | null | undefined) {
  if (!role) role = 'staff'  // default to staff if no role found
  const items = [
    { href: '/my-room', label: 'Phòng của tôi', icon: '🏠', perm: 'own.room.read' as Permission },
    { href: '/dashboard', label: 'Tổng quan', icon: '📊', perm: 'dashboard.read' as Permission },
    { href: '/rooms', label: 'Phòng trọ', icon: '🏠', perm: 'rooms.read' as Permission },
    { href: '/tenants', label: 'Khách thuê', icon: '👤', perm: 'tenants.read' as Permission },
    { href: '/contracts', label: 'Hợp đồng', icon: '📝', perm: 'contracts.read' as Permission },
    { href: '/invoices', label: 'Hóa đơn', icon: '🧾', perm: 'invoices.read' as Permission },
    { href: '/payments', label: 'Thanh toán', icon: '💰', perm: 'payments.read' as Permission },
    { href: '/meter-readings', label: 'Chỉ số điện/nước', icon: '⚡', perm: 'meter.read' as Permission },
    { href: '/maintenance', label: 'Bảo trì', icon: '🔧', perm: 'maintenance.read' as Permission },
    { href: '/reports', label: 'Báo cáo', icon: '📈', perm: 'reports.read' as Permission },
  ]

  const adminItems = [
    { href: '/users', label: 'Người dùng', icon: '👥', perm: 'users.manage' as Permission },
  ]

  const allItems = [...items, ...(role === 'admin' ? adminItems : [])]
  return allItems.filter(item => hasPermission(role, item.perm))
}
