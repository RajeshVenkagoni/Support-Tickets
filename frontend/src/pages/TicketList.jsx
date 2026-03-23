import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  CheckSquare,
  Square,
  UserCheck,
  XCircle,
  Plus
} from 'lucide-react'
import toast from 'react-hot-toast'
import StatusBadge from '../components/StatusBadge.jsx'
import PriorityBadge from '../components/PriorityBadge.jsx'
import SLAIndicator from '../components/SLAIndicator.jsx'
import { TableRowSkeleton } from '../components/Skeleton.jsx'
import { ticketsAPI, agentsAPI } from '../api/axios.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useWebSocket } from '../contexts/WebSocketContext.jsx'
import { formatDate } from '../utils/format.js'

const statusFilters = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting_on_customer', label: 'Waiting on Customer' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

const priorityFilters = [
  { value: '', label: 'All Priorities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

export default function TicketList() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { subscribe } = useWebSocket()
  
  const [tickets, setTickets] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTickets, setSelectedTickets] = useState([])
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assigned_to: '',
    search: '',
  })
  const [pagination, setPagination] = useState({
    page: 1,
    total_pages: 1,
    total_count: 0,
  })

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const response = await ticketsAPI.getAll({
        ...filters,
        page: pagination.page,
        page_size: 20,
      })
      setTickets(response.data.results || response.data)
      setPagination(prev => ({
        ...prev,
        total_pages: response.data.total_pages || 1,
        total_count: response.data.total_count || response.data.length,
      }))
    } catch (error) {
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page])

  useEffect(() => {
    fetchTickets()
    fetchAgents()
  }, [fetchTickets])

  useEffect(() => {
    const unsubscribe = subscribe('tickets', () => {
      fetchTickets()
    })
    return () => unsubscribe()
  }, [subscribe, fetchTickets])

  const fetchAgents = async () => {
    try {
      const response = await agentsAPI.getAll()
      setAgents(response.data)
    } catch (error) {
      console.error('Failed to load agents')
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
    setSelectedTickets([])
  }

  const toggleSelectAll = () => {
    if (selectedTickets.length === tickets.length) {
      setSelectedTickets([])
    } else {
      setSelectedTickets(tickets.map(t => t.id))
    }
  }

  const toggleSelectTicket = (id) => {
    setSelectedTickets(prev => 
      prev.includes(id) 
        ? prev.filter(tid => tid !== id)
        : [...prev, id]
    )
  }

  const handleBulkAssign = async (agentId) => {
    if (selectedTickets.length === 0) return
    
    try {
      await ticketsAPI.bulkAssign(selectedTickets, agentId)
      toast.success(`Assigned ${selectedTickets.length} tickets`)
      setSelectedTickets([])
      fetchTickets()
    } catch (error) {
      toast.error('Failed to assign tickets')
    }
  }

  const handleBulkClose = async () => {
    if (selectedTickets.length === 0) return
    
    try {
      await ticketsAPI.bulkClose(selectedTickets)
      toast.success(`Closed ${selectedTickets.length} tickets`)
      setSelectedTickets([])
      fetchTickets()
    } catch (error) {
      toast.error('Failed to close tickets')
    }
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Tickets</h1>
          <p className="text-slate-500 mt-1">
            {pagination.total_count} tickets total
          </p>
        </div>
        <button
          onClick={() => navigate('/tickets/new')}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Ticket
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedTickets.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-primary-900">
            {selectedTickets.length} selected
          </span>
          <div className="flex gap-2">
            <select
              onChange={(e) => handleBulkAssign(e.target.value)}
              className="text-sm border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              defaultValue=""
            >
              <option value="" disabled>Assign to...</option>
              <option value={user?.id}>Assign to me</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
            <button
              onClick={handleBulkClose}
              className="btn-secondary text-sm"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Close
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-slate-500" />
              <h3 className="font-medium text-slate-900">Filters</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full text-sm border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  {statusFilters.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Priority
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full text-sm border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  {priorityFilters.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Assignment
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="assigned"
                      checked={filters.assigned_to === ''}
                      onChange={() => handleFilterChange('assigned_to', '')}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">All</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="assigned"
                      checked={filters.assigned_to === 'me'}
                      onChange={() => handleFilterChange('assigned_to', 'me')}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">Assigned to me</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="assigned"
                      checked={filters.assigned_to === 'unassigned'}
                      onChange={() => handleFilterChange('assigned_to', 'unassigned')}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">Unassigned</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="flex-1 card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={toggleSelectAll}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      {selectedTickets.length === tickets.length && tickets.length > 0 ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Ticket#
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Requester
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    SLA
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <TableRowSkeleton columns={9} />
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                      No tickets found
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr 
                      key={ticket.id} 
                      className="hover:bg-slate-50 cursor-pointer"
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                    >
                      <td 
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => toggleSelectTicket(ticket.id)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          {selectedTickets.includes(ticket.id) ? (
                            <CheckSquare className="w-5 h-5 text-primary-600" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-primary-600">
                        #{ticket.ticket_number}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900 max-w-xs truncate">
                        {ticket.subject}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                        {ticket.requester_name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                        {ticket.assigned_to_name || (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <SLAIndicator deadline={ticket.sla_deadline} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                        {formatDate(ticket.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.total_pages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1}
                className="p-2 text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page >= pagination.total_pages}
                className="p-2 text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
