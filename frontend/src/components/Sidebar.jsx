import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Ticket, 
  UserCircle, 
  MessageSquare, 
  BarChart3, 
  Settings,
  PlusCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'All Tickets', href: '/tickets', icon: Ticket },
  { name: 'My Tickets', href: '/my-tickets', icon: UserCircle },
  { name: 'Canned Responses', href: '/canned-responses', icon: MessageSquare },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
]

export default function Sidebar() {
  const { logout } = useAuth()

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-white lg:border-r lg:border-slate-200">
        <div className="flex items-center h-16 px-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">SupportHub</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-3 mb-6">
            <NavLink
              to="/tickets/new"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <PlusCircle className="w-5 h-5" />
              Create Ticket
            </NavLink>
          </div>
          
          <nav className="space-y-1 px-3">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
                  }
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  {item.name}
                </NavLink>
              )
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Settings className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
        <nav className="flex justify-around py-2">
          {navigation.slice(0, 4).map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex flex-col items-center px-3 py-2 text-xs font-medium ${
                    isActive ? 'text-primary-600' : 'text-slate-500'
                  }`
                }
              >
                <Icon className="w-6 h-6 mb-1" />
                {item.name.split(' ')[0]}
              </NavLink>
            )
          })}
        </nav>
      </div>
    </>
  )
}
