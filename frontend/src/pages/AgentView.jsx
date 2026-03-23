import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Ticket, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  ArrowRight,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import StatusBadge from '../components/StatusBadge.jsx'
import PriorityBadge from '../components/PriorityBadge.jsx'
import SLAIndicator from '../components/SLAIndicator.jsx'
import { agentsAPI } from '../api/axios.js'
import { formatDate, formatDuration } from '../utils/format.js'

export default function AgentView() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        agentsAPI.getMyStats(),
        agentsAPI.getMyTickets(),
      ])
      setStats(statsRes.data)
      setTickets(ticketsRes.data)
    } catch (error) {
      toast.error('Failed to load your tickets')
    } finally {
      setLoading(false)
    }
  }

  const filterTicketsByStatus = (status) => {
    return tickets.filter(t => t.status === status)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const openTickets = filterTicketsByStatus('open')
  const inProgressTickets = filterTicketsByStatus('in_progress')
  const waitingTickets = filterTicketsByStatus('waiting_on_customer')

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Tickets</h1>
        <p className="text-slate-500 mt-1">Manage your assigned tickets and workload</p>
      </div>

      {/* Workload Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Assigned</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {stats?.total_assigned || tickets.length}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Ticket className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Open</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">
                {openTickets.length}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">In Progress</p>
              <p className="text-3xl font-bold text-primary-600 mt-1">
                {inProgressTickets.length}
              </p>
            </div>
            <div className="p-3 bg-primary-50 rounded-xl">
              <TrendingUp className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Resolved Today</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {stats?.resolved_today || 0}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Performance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-900">
              {stats?.avg_resolution_time ? formatDuration(stats.avg_resolution_time) : '-'}
            </p>
            <p className="text-sm text-slate-500 mt-1">Avg Resolution Time</p>
          </div>
          <div className="text-center sm:border-x sm:border-slate-200">
            <p className="text-3xl font-bold text-slate-900">
              {stats?.sla_compliance || 100}%
            </p>
            <p className="text-sm text-slate-500 mt-1">SLA Compliance</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-900">
              {stats?.customer_satisfaction || '-'}/5
            </p>
            <p className="text-sm text-slate-500 mt-1">Customer Satisfaction</p>
          </div>
        </div>
      </div>

      {/* Tickets by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Tickets */}
        <div className="card">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">
              Open Tickets ({openTickets.length})
            </h3>
            <button
              onClick={() => navigate('/tickets?status=open')}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
            >
              View all
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {openTickets.length === 0 ? (
              <p className="p-4 text-center text-slate-500 text-sm">No open tickets</p>
            ) : (
              openTickets.slice(0, 5).map(ticket => (
                <div 
                  key={ticket.id} 
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                  className="p-4 hover:bg-slate-50 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-900">#{ticket.ticket_number}</p>
                      <p className="text-sm text-slate-600 mt-0.5 truncate max-w-xs">{ticket.subject}</p>
                    </div>
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <SLAIndicator deadline={ticket.sla_deadline} />
                    <span className="text-xs text-slate-400">
                      {formatDate(ticket.created_at)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* In Progress Tickets */}
        <div className="card">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">
              In Progress ({inProgressTickets.length})
            </h3>
            <button
              onClick={() => navigate('/tickets?status=in_progress')}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
            >
              View all
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {inProgressTickets.length === 0 ? (
              <p className="p-4 text-center text-slate-500 text-sm">No tickets in progress</p>
            ) : (
              inProgressTickets.slice(0, 5).map(ticket => (
                <div 
                  key={ticket.id} 
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                  className="p-4 hover:bg-slate-50 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-900">#{ticket.ticket_number}</p>
                      <p className="text-sm text-slate-600 mt-0.5 truncate max-w-xs">{ticket.subject}</p>
                    </div>
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <SLAIndicator deadline={ticket.sla_deadline} />
                    <span className="text-xs text-slate-400">
                      {formatDate(ticket.created_at)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* All My Tickets Table */}
      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">All My Tickets</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Ticket#
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Subject
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  SLA
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No tickets assigned to you
                  </td>
                </tr>
              ) : (
                tickets.map(ticket => (
                  <tr 
                    key={ticket.id}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className="hover:bg-slate-50 cursor-pointer"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-primary-600">
                      #{ticket.ticket_number}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 max-w-xs truncate">
                      {ticket.subject}
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 py-3">
                      <SLAIndicator deadline={ticket.sla_deadline} />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {formatDate(ticket.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
