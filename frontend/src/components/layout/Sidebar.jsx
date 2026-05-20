import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, CreditCard, Heart, Car, Shield, Receipt,
  Package, Calendar, BarChart3, Bell, Settings, LogOut, ChevronRight, Zap
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import toast from 'react-hot-toast'

const navItems = [
  { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/app/documents', icon: FileText, label: 'Documents' },
  { path: '/app/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { path: '/app/health', icon: Heart, label: 'Health Records' },
  { path: '/app/vehicles', icon: Car, label: 'Vehicles' },
  { path: '/app/warranties', icon: Shield, label: 'Warranties' },
  { path: '/app/receipts', icon: Receipt, label: 'Receipts' },
  { path: '/app/deliveries', icon: Package, label: 'Deliveries' },
  { path: '/app/deadlines', icon: Calendar, label: 'Deadlines' },
  { path: '/app/analytics', icon: BarChart3, label: 'Analytics' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: -260 }}
          animate={{ x: 0 }}
          exit={{ x: -260 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{
            position: 'fixed', left: 0, top: 0, bottom: 0, width: '260px', zIndex: 50,
            background: 'var(--sidebar-bg)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Logo */}
          <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px rgba(99,102,241,0.4)'
              }}>
                <Zap size={18} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Adulting OS</div>
                <div style={{ fontSize: '0.65rem', color: '#6366f1', fontWeight: 600, letterSpacing: '0.05em' }}>LIFE ADMIN DASHBOARD</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0.75rem' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)', fontWeight: 700, letterSpacing: '0.1em', padding: '0 0.5rem', marginBottom: '0.5rem' }}>
              NAVIGATION
            </div>
            {navItems.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                style={{ marginBottom: '2px' }}
              >
                <Icon size={16} />
                <span style={{ flex: 1 }}>{label}</span>
                {label === 'Dashboard' && <ChevronRight size={12} style={{ opacity: 0.4 }} />}
              </NavLink>
            ))}

            <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)', fontWeight: 700, letterSpacing: '0.1em', padding: '0.75rem 0.5rem 0.5rem', marginTop: '0.5rem' }}>
              ACCOUNT
            </div>
            <NavLink to="/app/notifications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} style={{ marginBottom: '2px', position: 'relative' }}>
              <Bell size={16} />
              <span style={{ flex: 1 }}>Notifications</span>
              {unreadCount > 0 && (
                <span style={{
                  background: '#f43f5e', color: 'white', fontSize: '0.65rem', fontWeight: 700,
                  padding: '1px 6px', borderRadius: '9999px', minWidth: '18px', textAlign: 'center'
                }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </NavLink>
            <NavLink to="/app/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} style={{ marginBottom: '2px' }}>
              <Settings size={16} />
              <span>Settings</span>
            </NavLink>
          </nav>

          {/* User */}
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderRadius: '0.75rem', background: 'rgba(99,102,241,0.07)' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.875rem', fontWeight: 700, color: 'white'
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email}
                </div>
              </div>
              <button onClick={handleLogout} title="Logout"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                onMouseEnter={e => e.currentTarget.style.color = '#f43f5e'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
