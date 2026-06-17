interface StatsCardProps {
  title: string
  value: string | number
  icon: string
  accent?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
  subtitle?: string
}

const accentMap = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-emerald-500 to-emerald-600',
  red: 'from-red-500 to-red-600',
  yellow: 'from-yellow-500 to-yellow-600',
  purple: 'from-violet-500 to-violet-600',
}

export default function StatsCard({ title, value, icon, accent = 'blue', subtitle }: StatsCardProps) {
  return (
    <div className="relative bg-white rounded-xl border border-gray-200 p-6 overflow-hidden group hover:shadow-md transition-all duration-200">
      {/* Accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accentMap[accent]}`} />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
        <div className="text-3xl opacity-80">{icon}</div>
      </div>
    </div>
  )
}
