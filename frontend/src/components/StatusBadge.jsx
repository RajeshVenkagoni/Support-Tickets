import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const statusConfig = {
  open: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  'in_progress': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  'waiting_on_customer': {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    dot: 'bg-yellow-500',
  },
  resolved: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    dot: 'bg-green-500',
  },
  closed: {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
}

export default function StatusBadge({ status, showDot = true, className }) {
  const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '_') || 'open'
  const config = statusConfig[normalizedStatus] || statusConfig.open

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      config.bg,
      config.text,
      config.border,
      className
    )}>
      {showDot && (
        <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", config.dot)} />
      )}
      {status?.replace(/_/g, ' ') || 'Open'}
    </span>
  )
}
