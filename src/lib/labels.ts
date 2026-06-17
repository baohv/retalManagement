// Centralized status labels and colors — single source of truth.
// Every page MUST import from here. Do not duplicate inline.

export const LABELS: Record<string, string> = {
  available: 'Còn trống', rented: 'Đã thuê', maintenance: 'Bảo trì',
  active: 'Đang hoạt động', expired: 'Hết hạn', terminated: 'Đã chấm dứt',
  unpaid: 'Chưa thanh toán', paid: 'Đã thanh toán', partial: 'Một phần',
  overdue: 'Quá hạn', pending: 'Chờ xử lý', in_progress: 'Đang xử lý',
  completed: 'Hoàn thành', cancelled: 'Đã hủy',
  cash: 'Tiền mặt', transfer: 'Chuyển khoản',
  low: 'Thấp', medium: 'Trung bình', high: 'Cao',
  admin: 'Admin', staff: 'Nhân viên',
  active_user: 'Hoạt động', inactive: 'Đã khóa',
}

export const COLOR_MAP: Record<string, string> = {
  available: 'bg-green-50 text-green-700 ring-green-600/20',
  rented: 'bg-blue-50 text-blue-700 ring-blue-700/10',
  maintenance: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  expired: 'bg-gray-50 text-gray-600 ring-gray-500/10',
  terminated: 'bg-red-50 text-red-700 ring-red-600/10',
  unpaid: 'bg-red-50 text-red-700 ring-red-600/20',
  paid: 'bg-green-50 text-green-700 ring-green-600/20',
  partial: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  overdue: 'bg-red-50 text-red-700 ring-red-600/20',
  pending: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  in_progress: 'bg-blue-50 text-blue-700 ring-blue-700/10',
  completed: 'bg-green-50 text-green-700 ring-green-600/20',
  cash: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  transfer: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  low: 'bg-blue-50 text-blue-700 ring-blue-700/10',
  medium: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  high: 'bg-red-50 text-red-700 ring-red-600/20',
  admin: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  staff: 'bg-gray-50 text-gray-600 ring-gray-500/10',
}
