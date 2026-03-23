import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  UserCheck, 
  CheckCircle, 
  AlertCircle,
  Send,
  Shield,
  ChevronDown,
  Clock,
  Tag,
  User
} from 'lucide-react'
import toast from 'react-hot-toast'
import StatusBadge from '../components/StatusBadge.jsx'
import PriorityBadge from '../components/PriorityBadge.jsx'
import SLAIndicator from '../components/SLAIndicator.jsx'
import TicketConversation from '../components/TicketConversation.jsx'
import ActivityTimeline from '../components/ActivityTimeline.jsx'
import { TicketDetailSkeleton } from '../components/Skeleton.jsx'
import { ticketsAPI, agentsAPI, cannedResponsesAPI } from '../api/axios.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useWebSocket } from '../contexts/WebSocketContext.jsx'
import { formatDate, formatRelativeTime } from '../utils/format.js'

export default function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { subscribe, sendTyping, sendStopTyping, typingUsers } = useWebSocket()
  
  const [ticket, setTicket] = useState(null)
  const [comments, setComments] = useState([])
  const [activities, setActivities] = useState([])
  const [agents, setAgents] = useState([])
  const [cannedResponses, setCannedResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [showCannedResponses, setShowCannedResponses] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const typingTimeoutRef = useRef(null)

  const fetchTicketData = useCallback(async () => {
    setLoading(true)
    try {
      const [ticketRes, commentsRes, agentsRes, cannedRes] = await Promise.all([
        ticketsAPI.getById(id),
        ticketsAPI.getComments(id),
        agentsAPI.getAll(),
        cannedResponsesAPI.getAll(),
      ])
      setTicket(ticketRes.data)
      setComments(commentsRes.data)
      setAgents(agentsRes.data)
      setCannedResponses(cannedRes.data)
      // Mock activities - would come from API
      setActivities([
        { id: 1, type: 'created', user_name: ticketRes.data.requester_name, description: 'created the ticket', created_at: ticketRes.data.created_at },
        ...commentsRes.data.map(c => ({
          id: `comment-${c.id}`,
          type: 'comment',
          user_name: c.author_name,
          description: c.is_internal ? 'added an internal note' : 'replied to the ticket',
          created_at: c.created_at,
        }))
      ])
    } catch (error) {
      toast.error('Failed to load ticket')
      navigate('/tickets')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => {
    fetchTicketData()
  }, [fetchTicketData])

  useEffect(() => {
    const unsubscribeTicket = subscribe(`ticket:${id}`, (updatedTicket) => {
      setTicket(updatedTicket)
    })
    
    const unsubscribeComments = subscribe(`comments:${id}`, (newComment) => {
      setComments(prev => [...prev, newComment])
    })

    return () => {
      unsubscribeTicket()
      unsubscribeComments()
    }
  }, [id, subscribe])

  const handleCommentChange = (e) => {
    setCommentText(e.target.value)
    
    // Send typing indicator
    sendTyping(id)
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      sendStopTyping(id)
    }, 2000)
  }

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return
    
    setSubmitting(true)
    try {
      await ticketsAPI.addComment(id, commentText, isInternal)
      setCommentText('')
      setIsInternal(false)
      sendStopTyping(id)
      // Refresh comments
      const commentsRes = await ticketsAPI.getComments(id)
      setComments(commentsRes.data)
      toast.success(isInternal ? 'Internal note added' : 'Comment added')
    } catch (error) {
      toast.error('Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleSubmitComment()
    }
  }

  const handleAssignToMe = async () => {
    try {
      await ticketsAPI.assign(id, user.id)
      toast.success('Ticket assigned to you')
      fetchTicketData()
    } catch (error) {
      toast.error('Failed to assign ticket')
    }
  }

  const handleResolve = async () => {
    try {
      await ticketsAPI.resolve(id)
      toast.success('Ticket resolved')
      fetchTicketData()
    } catch (error) {
      toast.error('Failed to resolve ticket')
    }
  }

  const handlePriorityChange = async (priority) => {
    try {
      await ticketsAPI.update(id, { priority })
      toast.success('Priority updated')
      fetchTicketData()
    } catch (error) {
      toast.error('Failed to update priority')
    }
  }

  const insertCannedResponse = (content) => {
    setCommentText(content)
    setShowCannedResponses(false)
  }

  const typingUser = typingUsers[id]

  if (loading) {
    return <TicketDetailSkeleton />
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/tickets')}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                #{ticket.ticket_number}
              </h1>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <p className="text-slate-500 mt-1">{ticket.subject}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {!ticket.assigned_to && (
            <button
              onClick={handleAssignToMe}
              className="btn-secondary"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Assign to me
            </button>
          )}
          {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
            <button
              onClick={handleResolve}
              className="btn-primary"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Resolve
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Conversation */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Conversation</h3>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              <TicketConversation 
                comments={comments}
                currentUser={user}
                typingUser={typingUser?.userName}
              />
            </div>
            
            {/* Comment Form */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <div className="relative">
                <textarea
                  value={commentText}
                  onChange={handleCommentChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your response... (Ctrl+Enter to send)"
                  rows={4}
                  className="w-full rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500 resize-none"
                />
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-slate-600 flex items-center">
                        <Shield className="w-4 h-4 mr-1" />
                        Internal Note
                      </span>
                    </label>
                    
                    {/* Canned Responses Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setShowCannedResponses(!showCannedResponses)}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                      >
                        Canned Responses
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </button>
                      
                      {showCannedResponses && (
                        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                          <div className="max-h-48 overflow-y-auto">
                            {cannedResponses.map((response) => (
                              <button
                                key={response.id}
                                onClick={() => insertCannedResponse(response.content)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0"
                              >
                                <div className="font-medium text-slate-900">{response.title}</div>
                                <div className="text-xs text-slate-500 truncate">{response.content}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim() || submitting}
                    className="btn-primary"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Metadata */}
        <div className="space-y-4">
          {/* Ticket Details */}
          <div className="card p-4">
            <h3 className="font-semibold text-slate-900 mb-4">Ticket Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Status</label>
                <div className="mt-1">
                  <StatusBadge status={ticket.status} />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Priority</label>
                <div className="mt-1 flex items-center gap-2">
                  <PriorityBadge priority={ticket.priority} />
                  <select
                    value={ticket.priority}
                    onChange={(e) => handlePriorityChange(e.target.value)}
                    className="text-xs border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Assigned To</label>
                <div className="mt-1 flex items-center gap-2">
                  {ticket.assigned_to ? (
                    <>
                      <div className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-medium">
                        {ticket.assigned_to_name?.charAt(0)}
                      </div>
                      <span className="text-sm text-slate-900">{ticket.assigned_to_name}</span>
                    </>
                  ) : (
                    <span className="text-sm text-slate-400 italic">Unassigned</span>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">SLA Deadline</label>
                <div className="mt-1">
                  <SLAIndicator deadline={ticket.sla_deadline} />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Category</label>
                <p className="text-sm text-slate-900 mt-1">{ticket.category || 'General'}</p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Requester</label>
                <div className="mt-1 flex items-center gap-2">
                  <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-900">{ticket.requester_name}</p>
                    <p className="text-xs text-slate-500">{ticket.requester_email}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Created</label>
                <p className="text-sm text-slate-900 mt-1">{formatDate(ticket.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="card p-4">
            <h3 className="font-semibold text-slate-900 mb-4">Activity</h3>
            <ActivityTimeline activities={activities} />
          </div>
        </div>
      </div>
    </div>
  )
}
