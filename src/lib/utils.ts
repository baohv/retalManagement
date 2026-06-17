export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    available: 'bg-green-100 text-green-800',
    rented: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    expired: 'bg-gray-100 text-gray-800',
    terminated: 'bg-red-100 text-red-800',
    unpaid: 'bg-red-100 text-red-800',
    paid: 'bg-green-100 text-green-800',
    partial: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
  }
  return colors[status] ?? 'bg-gray-100 text-gray-800'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    available: 'Còn trống',
    rented: 'Đã thuê',
    maintenance: 'Bảo trì',
    active: 'Đang hoạt động',
    expired: 'Hết hạn',
    terminated: 'Đã chấm dứt',
    unpaid: 'Chưa thanh toán',
    paid: 'Đã thanh toán',
    partial: 'Thanh toán một phần',
    overdue: 'Quá hạn',
    pending: 'Chờ xử lý',
    in_progress: 'Đang xử lý',
    completed: 'Hoàn thành',
    low: 'Thấp',
    medium: 'Trung bình',
    high: 'Cao',
    cash: 'Tiền mặt',
    transfer: 'Chuyển khoản',
  }
  return labels[status] ?? status
}

export function generateInvoiceNumber(year: number, month: number, roomId: number): string {
  return `HD-${year}${String(month).padStart(2, '0')}-${String(roomId).padStart(3, '0')}`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value)
}
