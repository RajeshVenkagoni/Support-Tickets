import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { ticketsAPI, categoriesAPI } from '../api/axios.js'
import { addHours } from 'date-fns'
import { formatDate } from '../utils/format.js'

const prioritySLA = {
  critical: 4,    // 4 hours
  high: 8,        // 8 hours
  medium: 24,     // 24 hours
  low: 72,        // 72 hours
}

const priorityOptions = [
  { value: 'low', label: 'Low', hours: 72 },
  { value: 'medium', label: 'Medium', hours: 24 },
  { value: 'high', label: 'High', hours: 8 },
  { value: 'critical', label: 'Critical', hours: 4 },
]

export default function CreateTicket() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    requester_name: '',
    requester_email: '',
    category: '',
    priority: 'medium',
  })
  const [slaDeadline, setSlaDeadline] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    // Calculate SLA deadline when priority changes
    const hours = prioritySLA[formData.priority] || 24
    const deadline = addHours(new Date(), hours)
    setSlaDeadline(deadline)
  }, [formData.priority])

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll()
      setCategories(response.data)
    } catch (error) {
      console.error('Failed to load categories')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.subject || !formData.requester_name || !formData.requester_email) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    
    try {
      const response = await ticketsAPI.create({
        ...formData,
        sla_deadline: slaDeadline?.toISOString(),
      })
      toast.success('Ticket created successfully')
      navigate(`/tickets/${response.data.id}`)
    } catch (error) {
      toast.error('Failed to create ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/tickets')}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create New Ticket</h1>
          <p className="text-slate-500 mt-1">Create a new support ticket for a customer</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-slate-700">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Brief description of the issue"
            className="input-field mt-1"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            placeholder="Detailed description of the issue..."
            className="input-field mt-1 resize-none"
          />
        </div>

        {/* Requester Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="requester_name" className="block text-sm font-medium text-slate-700">
              Requester Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="requester_name"
              name="requester_name"
              value={formData.requester_name}
              onChange={handleChange}
              placeholder="John Doe"
              className="input-field mt-1"
              required
            />
          </div>
          
          <div>
            <label htmlFor="requester_email" className="block text-sm font-medium text-slate-700">
              Requester Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="requester_email"
              name="requester_email"
              value={formData.requester_email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="input-field mt-1"
              required
            />
          </div>
        </div>

        {/* Category & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field mt-1"
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
              <option value="general">General</option>
              <option value="technical">Technical Support</option>
              <option value="billing">Billing</option>
              <option value="feature">Feature Request</option>
              <option value="bug">Bug Report</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-slate-700">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="input-field mt-1"
            >
              {priorityOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.hours}h SLA)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SLA Preview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">SLA Deadline</h4>
              <p className="text-sm text-blue-700 mt-1">
                This ticket must be resolved by{' '}
                <span className="font-semibold">
                  {slaDeadline ? formatDate(slaDeadline) : '-'}
                </span>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Based on {priorityOptions.find(p => p.value === formData.priority)?.label} priority ({prioritySLA[formData.priority]} hours)
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate('/tickets')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Creating...
              </>
            ) : (
              'Create Ticket'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
