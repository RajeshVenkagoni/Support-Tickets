import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const priorityConfig = {
  critical: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: '!',
  },
  high: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: '↑',
  },
  medium: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: '→',
  },
  low: {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: '↓',
  },
}

export default function PriorityBadge({ priority, showIcon = true, className }) {
  const normalizedPriority = priority?.toLowerCase() || 'medium'
  const config = priorityConfig[normalizedPriority] || priorityConfig.medium

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      config.bg,
      config.text,
      config.border,
      className
    )}>
      {showIcon && (
        <span className="mr-1 font-bold">{config.icon}</span>
      )}
      {priority?.charAt(0).toUpperCase() + priority?.slice(1) || 'Medium'}
    </span>
  )
}
