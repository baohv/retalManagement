import { LABELS, COLOR_MAP } from '@/lib/labels'

interface BadgeProps {
  status: string
  label?: string
  size?: 'sm' | 'md'
}

export default function Badge({ status, label, size = 'sm' }: BadgeProps) {
  const cls = COLOR_MAP[status] || 'bg-gray-50 text-gray-700 ring-gray-500/10'
  const text = label || LABELS[status] || status
  const sz = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
  return (
    <span className={`inline-flex items-center font-medium rounded-full ring-1 ring-inset ${cls} ${sz}`}>
      {text}
    </span>
  )
}
