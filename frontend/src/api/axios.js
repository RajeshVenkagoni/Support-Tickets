import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8004/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error
    
    if (response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      toast.error('Session expired. Please login again.')
    } else if (response?.status === 403) {
      toast.error('You do not have permission to perform this action.')
    } else if (response?.status === 404) {
      toast.error('Resource not found.')
    } else if (response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (response?.data?.detail) {
      toast.error(response.data.detail)
    } else if (response?.data?.message) {
      toast.error(response.data.message)
    }
    
    return Promise.reject(error)
  }
)

export default api

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login/', { email, password }),
  refresh: (refreshToken) => api.post('/auth/refresh/', { refresh: refreshToken }),
  logout: () => api.post('/auth/logout/'),
  me: () => api.get('/auth/me/'),
}

// Tickets API
export const ticketsAPI = {
  getAll: (params = {}) => api.get('/tickets/', { params }),
  getById: (id) => api.get(`/tickets/${id}/`),
  create: (data) => api.post('/tickets/', data),
  update: (id, data) => api.patch(`/tickets/${id}/`, data),
  delete: (id) => api.delete(`/tickets/${id}/`),
  assign: (id, agentId) => api.post(`/tickets/${id}/assign/`, { agent_id: agentId }),
  resolve: (id) => api.post(`/tickets/${id}/resolve/`),
  close: (id) => api.post(`/tickets/${id}/close/`),
  reopen: (id) => api.post(`/tickets/${id}/reopen/`),
  bulkAssign: (ticketIds, agentId) => api.post('/tickets/bulk-assign/', { ticket_ids: ticketIds, agent_id: agentId }),
  bulkClose: (ticketIds) => api.post('/tickets/bulk-close/', { ticket_ids: ticketIds }),
  getComments: (id) => api.get(`/tickets/${id}/comments/`),
  addComment: (id, content, isInternal = false) => 
    api.post(`/tickets/${id}/comments/`, { content, is_internal: isInternal }),
  getAttention: () => api.get('/tickets/attention/'),
}

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats/'),
  getCharts: () => api.get('/dashboard/charts/'),
}

// Agents API
export const agentsAPI = {
  getAll: () => api.get('/agents/'),
  getWorkload: () => api.get('/agents/workload/'),
  getMyTickets: () => api.get('/agents/my-tickets/'),
  getMyStats: () => api.get('/agents/my-stats/'),
}

// Canned Responses API
export const cannedResponsesAPI = {
  getAll: () => api.get('/canned-responses/'),
  getById: (id) => api.get(`/canned-responses/${id}/`),
  create: (data) => api.post('/canned-responses/', data),
  update: (id, data) => api.patch(`/canned-responses/${id}/`, data),
  delete: (id) => api.delete(`/canned-responses/${id}/`),
}

// Reports API
export const reportsAPI = {
  getSLAReport: (params = {}) => api.get('/reports/sla/', { params }),
  getResolutionTime: (params = {}) => api.get('/reports/resolution-time/', { params }),
  getSatisfaction: (params = {}) => api.get('/reports/satisfaction/', { params }),
  getBusiestHours: (params = {}) => api.get('/reports/busiest-hours/', { params }),
}

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories/'),
}
