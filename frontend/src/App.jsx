import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Layouts
import AppLayout from './components/layout/AppLayout'

// Public pages
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyOTP from './pages/auth/VerifyOTP'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// App pages
import Dashboard from './pages/Dashboard'
import Documents from './pages/Documents'
import Subscriptions from './pages/Subscriptions'
import Health from './pages/Health'
import Vehicles from './pages/Vehicles'
import Warranties from './pages/Warranties'
import Receipts from './pages/Receipts'
import Deliveries from './pages/Deliveries'
import Deadlines from './pages/Deadlines'
import Analytics from './pages/Analytics'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const hasToken = !!localStorage.getItem('accessToken')

  if (loading) return (
    <div className="flex items-center justify-center h-screen" style={{ background: '#11111b' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p style={{ color: '#6c7086', fontSize: '0.875rem' }}>Loading Adulting OS...</p>
      </div>
    </div>
  )
  // Check both user state and token in localStorage (handles timing race condition)
  return (user || hasToken) ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const hasToken = !!localStorage.getItem('accessToken')
  if (loading) return null
  return (user || hasToken) ? <Navigate to="/app/dashboard" replace /> : children
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/verify-email" element={<VerifyOTP />} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected App */}
      <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="documents" element={<Documents />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="health" element={<Health />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="warranties" element={<Warranties />} />
        <Route path="receipts" element={<Receipts />} />
        <Route path="deliveries" element={<Deliveries />} />
        <Route path="deadlines" element={<Deadlines />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
