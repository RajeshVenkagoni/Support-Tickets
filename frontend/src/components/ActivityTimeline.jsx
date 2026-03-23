import { 
  MessageSquare, 
  UserCheck, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  RotateCcw,
  Edit3
} from 'lucide-react'
import { formatDate } from '../utils/format.js'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const activityIcons = {
  comment: MessageSquare,
  assigned: UserCheck,
  resolved: CheckCircle,
  status_changed: AlertCircle,
  priority_changed: AlertCircle,
  created: Clock,
  reopened: RotateCcw,
  edited: Edit3,
}

const activityColors = {
  comment: 'bg-blue-50 text-blue-600',
  assigned: 'bg-purple-50 text-purple-600',
  resolved: 'bg-green-50 text-green-600',
  status_changed: 'bg-amber-50 text-amber-600',
  priority_changed: 'bg-orange-50 text-orange-600',
  created: 'bg-slate-50 text-slate-600',
  reopened: 'bg-red-50 text-red-600',
  edited: 'bg-gray-50 text-gray-600',
}

export default function ActivityTimeline({ activities = [] }) {
  if (!activities.length) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Clock className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm">No activity yet</p>
      </div>
    )
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, index) => {
          const Icon = activityIcons[activity.type] || Clock
          const colorClass = activityColors[activity.type] || activityColors.created
          const isLast = index === activities.length - 1

          return (
            <li key={activity.id || index}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white",
                      colorClass
                    )}>
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-slate-900">
                        <span className="font-medium">{activity.user_name}</span>
                        {' '}{activity.description}
                      </p>
                      {activity.details && (
                        <p className="mt-1 text-sm text-slate-500">
                          {activity.details}
                        </p>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-xs text-slate-400">
                      {formatDate(activity.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
