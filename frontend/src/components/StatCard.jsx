import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp, 
  color = 'blue',
  isLive = false 
}) {
  const [pulse, setPulse] = useState(false)
  const [prevValue, setPrevValue] = useState(value)

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  useEffect(() => {
    if (value !== prevValue && isLive) {
      setPulse(true)
      const timer = setTimeout(() => setPulse(false), 500)
      setPrevValue(value)
      return () => clearTimeout(timer)
    }
  }, [value, prevValue, isLive])

  return (
    <div className={cn(
      "card p-6 transition-all duration-300",
      pulse && "animate-pulse-once ring-2 ring-primary-400"
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
          
          {trend !== undefined && (
            <div className="flex items-center mt-2">
              <span className={cn(
                "text-sm font-medium",
                trendUp ? "text-green-600" : "text-red-600"
              )}>
                {trendUp ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
              <span className="text-xs text-slate-400 ml-1">vs last week</span>
            </div>
          )}
        </div>
        
        <div className={cn(
          "p-3 rounded-xl",
          colorClasses[color]
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {isLive && (
        <div className="flex items-center mt-4 text-xs text-slate-400">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live updates
        </div>
      )}
    </div>
  )
}
