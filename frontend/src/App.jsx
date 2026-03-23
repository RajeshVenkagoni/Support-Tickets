import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import TicketList from './pages/TicketList.jsx'
import TicketDetail from './pages/TicketDetail.jsx'
import CreateTicket from './pages/CreateTicket.jsx'
import AgentView from './pages/AgentView.jsx'
import CannedResponses from './pages/CannedResponses.jsx'
import Reports from './pages/Reports.jsx'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tickets" element={<TicketList />} />
          <Route path="/tickets/new" element={<CreateTicket />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
          <Route path="/my-tickets" element={<AgentView />} />
          <Route path="/canned-responses" element={<CannedResponses />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
