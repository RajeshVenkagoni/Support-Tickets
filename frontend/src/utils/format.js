import { format, formatDistanceToNow, differenceInSeconds, isPast } from 'date-fns'

export function formatDate(dateString) {
  if (!dateString) return '-'
  return format(new Date(dateString), 'MMM d, yyyy h:mm a')
}

export function formatRelativeTime(dateString) {
  if (!dateString) return '-'
  return formatDistanceToNow(new Date(dateString), { addSuffix: true })
}

export function formatShortDate(dateString) {
  if (!dateString) return '-'
  return format(new Date(dateString), 'MMM d')
}

export function formatTime(dateString) {
  if (!dateString) return '-'
  return format(new Date(dateString), 'h:mm a')
}

export function getSLAColor(deadline) {
  if (!deadline) return 'gray'
  
  const deadlineDate = new Date(deadline)
  const now = new Date()
  
  if (isPast(deadlineDate)) return 'red'
  
  const totalSeconds = differenceInSeconds(deadlineDate, now)
  const totalMinutes = Math.floor(totalSeconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  // Assuming 24 hours is typical SLA
  const totalSLASeconds = 24 * 60 * 60
  const usedSeconds = totalSLASeconds - totalSeconds
  const percentUsed = (usedSeconds / totalSLASeconds) * 100
  
  if (percentUsed > 75) return 'red'
  if (percentUsed > 50) return 'amber'
  return 'green'
}

export function formatSLATime(deadline) {
  if (!deadline) return '-'
  
  const deadlineDate = new Date(deadline)
  const now = new Date()
  
  if (isPast(deadlineDate)) {
    const diff = formatDistanceToNow(deadlineDate)
    return `Breached ${diff} ago`
  }
  
  return formatDistanceToNow(deadlineDate, { addSuffix: true })
}

export function formatDuration(minutes) {
  if (!minutes || minutes === 0) return '-'
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function truncate(str, length = 50) {
  if (!str) return ''
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}
