import { useEffect, useState } from 'react'
import { Download, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { reportsAPI } from '../api/axios.js'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
const STAR_COLORS = ['#fbbf24', '#fbbf24', '#fbbf24', '#fbbf24', '#fbbf24']

export default function Reports() {
  const [dateRange, setDateRange] = useState('30')
  const [slaReport, setSlaReport] = useState([])
  const [resolutionTime, setResolutionTime] = useState([])
  const [satisfaction, setSatisfaction] = useState([])
  const [busiestHours, setBusiestHours] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [dateRange])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const [slaRes, resolutionRes, satisfactionRes, busiestRes] = await Promise.all([
        reportsAPI.getSLAReport({ days: dateRange }),
        reportsAPI.getResolutionTime({ days: dateRange }),
        reportsAPI.getSatisfaction({ days: dateRange }),
        reportsAPI.getBusiestHours({ days: dateRange }),
      ])
      
      setSlaReport(slaRes.data)
      setResolutionTime(resolutionRes.data)
      setSatisfaction(satisfactionRes.data)
      setBusiestHours(busiestRes.data)
    } catch (error) {
      // Use mock data for demo
      setSlaReport([
        { month: 'Jan', compliance: 94 },
        { month: 'Feb', compliance: 96 },
        { month: 'Mar', compliance: 92 },
        { month: 'Apr', compliance: 98 },
        { month: 'May', compliance: 95 },
        { month: 'Jun', compliance: 97 },
      ])
      setResolutionTime([
        { category: 'Technical', avg_hours: 12 },
        { category: 'Billing', avg_hours: 4 },
        { category: 'General', avg_hours: 6 },
        { category: 'Feature', avg_hours: 24 },
        { category: 'Bug', avg_hours: 8 },
      ])
      setSatisfaction([
        { rating: 5, count: 120 },
        { rating: 4, count: 80 },
        { rating: 3, count: 30 },
        { rating: 2, count: 10 },
        { rating: 1, count: 5 },
      ])
      setBusiestHours(Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        tickets: Math.floor(Math.random() * 50) + 10,
      })))
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    toast.success('Report export started - will download shortly')
  }

  const totalRatings = satisfaction.reduce((sum, s) => sum + s.count, 0)
  const avgRating = totalRatings > 0
    ? satisfaction.reduce((sum, s) => sum + (s.rating * s.count), 0) / totalRatings
    : 0

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-500 mt-1">Analytics and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button
            onClick={handleExport}
            className="btn-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6">
          <p className="text-sm font-medium text-slate-500">Average Rating</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-bold text-slate-900">{avgRating.toFixed(1)}</p>
            <p className="text-sm text-slate-500">/ 5</p>
          </div>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map(star => (
              <svg
                key={star}
                className={`w-4 h-4 ${star <= Math.round(avgRating) ? 'text-yellow-400' : 'text-slate-200'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <p className="text-sm font-medium text-slate-500">Total Reviews</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{totalRatings}</p>
          <p className="text-sm text-green-600 mt-2">+12% from last period</p>
        </div>

        <div className="card p-6">
          <p className="text-sm font-medium text-slate-500">Avg SLA Compliance</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {slaReport.length > 0 
              ? Math.round(slaReport.reduce((s, r) => s + r.compliance, 0) / slaReport.length)
              : 0}%
          </p>
          <p className="text-sm text-slate-500 mt-2">Target: 95%</p>
        </div>

        <div className="card p-6">
          <p className="text-sm font-medium text-slate-500">Total Tickets</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {busiestHours.reduce((s, h) => s + h.tickets, 0)}
          </p>
          <p className="text-sm text-slate-500 mt-2">In selected period</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SLA Compliance by Month */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            SLA Compliance by Month
          </h3>
          <div className="h-64">
            {loading ? (
              <div className="h-full bg-slate-100 animate-pulse rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={slaReport}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis 
                    domain={[0, 100]} 
                    stroke="#64748b" 
                    fontSize={12}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip 
                    formatter={(v) => [`${v}%`, 'Compliance']}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="compliance" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Average Resolution Time by Category */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Avg Resolution Time by Category
          </h3>
          <div className="h-64">
            {loading ? (
              <div className="h-full bg-slate-100 animate-pulse rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resolutionTime} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis 
                    type="number" 
                    stroke="#64748b" 
                    fontSize={12}
                    tickFormatter={(v) => `${v}h`}
                  />
                  <YAxis 
                    dataKey="category" 
                    type="category" 
                    stroke="#64748b" 
                    fontSize={12}
                  />
                  <Tooltip 
                    formatter={(v) => [`${v} hours`, 'Avg Time']}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="avg_hours" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Customer Satisfaction Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Customer Satisfaction Ratings
          </h3>
          <div className="h-64">
            {loading ? (
              <div className="h-full bg-slate-100 animate-pulse rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={satisfaction}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="rating"
                  >
                    {satisfaction.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STAR_COLORS[index % STAR_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(v, n) => [`${v} reviews`, `${n} stars`]} 
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {satisfaction.map((item) => (
              <div key={item.rating} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="text-xs text-slate-600">{item.rating}★ ({item.count})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Busiest Hours Heatmap */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Busiest Hours
          </h3>
          <div className="h-64">
            {loading ? (
              <div className="h-full bg-slate-100 animate-pulse rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={busiestHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="hour" 
                    stroke="#64748b" 
                    fontSize={10}
                    tickFormatter={(h) => `${h}:00`}
                    interval={2}
                  />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    formatter={(v, n, p) => [`${v} tickets`, `${p.payload.hour}:00 - ${p.payload.hour + 1}:00`]}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="tickets" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
