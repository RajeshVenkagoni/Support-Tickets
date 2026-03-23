import { useState } from 'react'
import { Search, Bell, ChevronDown, LogOut, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { getInitials } from '../utils/format.js'

export default function TopBar() {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Search */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="p-4 hover:bg-slate-50 border-b border-slate-50">
                  <p className="text-sm text-slate-900">New ticket assigned to you</p>
                  <p className="text-xs text-slate-500 mt-1">2 minutes ago</p>
                </div>
                <div className="p-4 hover:bg-slate-50 border-b border-slate-50">
                  <p className="text-sm text-slate-900">SLA breach warning: #1234</p>
                  <p className="text-xs text-slate-500 mt-1">15 minutes ago</p>
                </div>
                <div className="p-4 hover:bg-slate-50">
                  <p className="text-sm text-slate-900">Customer replied to #1200</p>
                  <p className="text-xs text-slate-500 mt-1">1 hour ago</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium">
              {getInitials(user?.name)}
            </div>
            <span className="hidden sm:block text-sm font-medium text-slate-700">
              {user?.name}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 z-50">
              <div className="p-4 border-b border-slate-100">
                <p className="font-medium text-slate-900">{user?.name}</p>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
              <div className="p-2">
                <button className="flex items-center w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </button>
                <button
                  onClick={logout}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
