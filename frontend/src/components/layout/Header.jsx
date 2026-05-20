import { Menu, Bell, Search, Moon, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { useTheme } from '../../context/ThemeContext'

export default function Header({ onMenuClick }) {
  const { user } = useAuth()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  return (
    <header style={{
      height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 1.5rem', borderBottom: '1px solid var(--border)',
      background: 'var(--header-bg)', backdropFilter: 'blur(20px)',
      position: 'sticky', top: 0, zIndex: 40, flexShrink: 0,
      transition: 'background 0.3s ease',
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={onMenuClick} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <Menu size={20} />
        </button>

        {/* Search bar */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', color: '#45475a' }} />
          <input
            type="text"
            placeholder="Search anything..."
            className="input-dark"
            style={{ paddingLeft: '36px', width: '280px', height: '38px' }}
          />
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Dark mode toggle */}
        <button onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} style={
          { background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer', color: '#818cf8', padding: '7px', borderRadius: '10px', display: 'flex', alignItems: 'center' }
        }>
          {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/app/notifications')}
          style={{ position: 'relative', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer', color: '#818cf8', padding: '7px', borderRadius: '10px', display: 'flex', alignItems: 'center' }}
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: '-4px', right: '-4px',
              background: '#f43f5e', color: 'white', fontSize: '0.6rem', fontWeight: 700,
              width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>

        {/* Avatar */}
        <div
          style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.9rem', fontWeight: 700, color: 'white', cursor: 'pointer',
            boxShadow: '0 0 15px rgba(99,102,241,0.4)'
          }}
          onClick={() => navigate('/app/settings')}
          title={user?.name}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
