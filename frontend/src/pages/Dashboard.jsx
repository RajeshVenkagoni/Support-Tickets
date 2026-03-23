import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Ticket, 
  Clock, 
  Target, 
  UserX, 
  AlertTriangle,
  Plus,
  ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import StatCard from '../components/StatCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import PriorityBadge from '../components/PriorityBadge.jsx'
import SLAIndicator from '../components/SLAIndicator.jsx'
import { StatCardSkeleton } from '../components/Skeleton.jsx'
import { dashboardAPI, ticketsAPI } from '../api/axios.js'
import { useWebSocket } from '../contexts/WebSocketContext.jsx'
import { formatDate } from '../utils/format.js'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts'

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#6b7280']

export default function Dashboard() {
  const navigate = useNavigate()
  const { subscribe } = useWebSocket()
  const [stats, setStats] = useState(null)
  const [charts, setCharts] = useState(null)
  const [attentionTickets, setAttentionTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    // Subscribe to real-time stats updates
    const unsubscribe = subscribe('stats', (data) => {
      setStats(data)
    })

    return () => unsubscribe()
  }, [subscribe])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, chartsRes, attentionRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getCharts(),
        ticketsAPI.getAttention(),
      ])
      setStats(statsRes.data)
      setCharts(chartsRes.data)
      setAttentionTickets(attentionRes.data)
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your support operations</p>
        </div>
        <button
          onClick={() => navigate('/tickets/new')}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Ticket
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Open Tickets"
              value={stats?.open_tickets || 0}
              icon={Ticket}
              trend={stats?.open_trend}
              trendUp={stats?.open_trend > 0}
              color="blue"
              isLive
            />
            <StatCard
              title="Avg Response Time"
              value={stats?.avg_response_time || '0m'}
              icon={Clock}
              trend={stats?.response_trend}
              trendUp={stats?.response_trend < 0}
              color="amber"
              isLive
            />
            <StatCard
              title="SLA Compliance"
              value={`${stats?.sla_compliance || 0}%`}
              icon={Target}
              trend={stats?.sla_trend}
              trendUp={stats?.sla_trend > 0}
              color="green"
              isLive
            />
            <StatCard
              title="Unassigned"
              value={stats?.unassigned_count || 0}
              icon={UserX}
              color="red"
              isLive
            />
          </>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets Created vs Resolved */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Tickets Created vs Resolved (14 days)
          </h3>
          <div className="h-64">
            {loading ? (
              <div className="h-full bg-slate-100 animate-pulse rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts?.daily_tickets || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en', { weekday: 'short' })}
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="created" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 0 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="resolved" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Tickets by Priority */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Tickets by Priority
          </h3>
          <div className="h-64">
            {loading ? (
              <div className="h-full bg-slate-100 animate-pulse rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts?.priority_distribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(charts?.priority_distribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {(charts?.priority_distribution || []).map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-slate-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SLA Compliance Trend */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            SLA Compliance Trend
          </h3>
          <div className="h-64">
            {loading ? (
              <div className="h-full bg-slate-100 animate-pulse rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts?.sla_trend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en', { month: 'short' })}
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    stroke="#64748b" 
                    fontSize={12}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip 
                    formatter={(val) => [`${val}%`, 'SLA Compliance']}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="compliance" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Agent Workload */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Agent Workload
          </h3>
          <div className="h-64">
            {loading ? (
              <div className="h-full bg-slate-100 animate-pulse rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={charts?.agent_workload || []} 
                  layout="vertical"
                  margin={{ left: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={12} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#64748b" 
                    fontSize={12}
                    width={50}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="tickets" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Tickets Needing Attention */}
      <div className="card">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-slate-900">
              Tickets Needing Attention
            </h3>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Unassigned tickets and SLA breaches requiring immediate action
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Ticket
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  SLA
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
                  </td>
                </tr>
              ) : attentionTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No tickets requiring attention
                  </td>
                </tr>
              ) : (
                attentionTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-primary-600">
                      #{ticket.ticket_number}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 max-w-xs truncate">
                      {ticket.subject}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <SLAIndicator deadline={ticket.sla_deadline} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                      {formatDate(ticket.created_at)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center"
                      >
                        View
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
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
