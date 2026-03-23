import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { formatSLATime, getSLAColor } from '../utils/format.js'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export default function SLAIndicator({ deadline, className }) {
  const [timeLeft, setTimeLeft] = useState(formatSLATime(deadline))
  const [color, setColor] = useState(getSLAColor(deadline))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(formatSLATime(deadline))
      setColor(getSLAColor(deadline))
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [deadline])

  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      icon: 'text-green-500',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: 'text-amber-500',
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: 'text-red-500',
    },
    gray: {
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-200',
      icon: 'text-slate-400',
    },
  }

  const config = colorClasses[color] || colorClasses.gray

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium",
      config.bg,
      config.text,
      config.border,
      className
    )}>
      <Clock className={cn("w-3.5 h-3.5", config.icon)} />
      <span>{timeLeft}</span>
    </div>
  )
}
