import { useEffect, useState } from 'react'
import { Search, Copy, Check, Plus, Trash2, Edit } from 'lucide-react'
import toast from 'react-hot-toast'
import { cannedResponsesAPI } from '../api/axios.js'

export default function CannedResponses() {
  const [responses, setResponses] = useState([])
  const [filteredResponses, setFilteredResponses] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    fetchResponses()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = responses.filter(
        r => 
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredResponses(filtered)
    } else {
      setFilteredResponses(responses)
    }
  }, [searchQuery, responses])

  const fetchResponses = async () => {
    try {
      const res = await cannedResponsesAPI.getAll()
      setResponses(res.data)
      setFilteredResponses(res.data)
    } catch (error) {
      toast.error('Failed to load canned responses')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (response) => {
    try {
      await navigator.clipboard.writeText(response.content)
      setCopiedId(response.id)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  // Group responses by category
  const groupedResponses = filteredResponses.reduce((acc, response) => {
    const category = response.category || 'General'
    if (!acc[category]) acc[category] = []
    acc[category].push(response)
    return acc
  }, {})

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Canned Responses</h1>
          <p className="text-slate-500 mt-1">
            Pre-written responses for common queries
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => toast('Create functionality coming soon')}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Response
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search canned responses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Responses */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : filteredResponses.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No responses found</h3>
          <p className="text-slate-500 mt-1">
            {searchQuery ? 'Try a different search term' : 'Create your first canned response'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedResponses).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                {category}
              </h3>
              <div className="space-y-3">
                {items.map(response => (
                  <div 
                    key={response.id}
                    className="card p-4 hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900">{response.title}</h4>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                          {response.content}
                        </p>
                        {response.shortcut && (
                          <span className="inline-flex items-center mt-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                            Shortcut: {response.shortcut}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleCopy(response)}
                          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Copy to clipboard"
                        >
                          {copiedId === response.id ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => toast('Edit functionality coming soon')}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => toast('Delete functionality coming soon')}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
