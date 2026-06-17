interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export default function Card({ children, className = '', hover = false, onClick }: CardProps) {
  const cls = `bg-white rounded-xl border border-gray-200 ${hover ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`
  
  if (onClick) {
    return <button type="button" onClick={onClick} className={`${cls} text-left w-full`}>{children}</button>
  }
  return <div className={cls}>{children}</div>
}
