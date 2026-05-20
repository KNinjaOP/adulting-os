import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { notificationsAPI } from '../api/endpoints'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

const POLL_INTERVAL = 5 * 60 * 1000 // 5 minutes — not every second!

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth()
  const userId = user?._id  // use only the ID as dependency, not the whole user object
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const intervalRef = useRef(null)

  const fetchCount = useCallback(async () => {
    if (!userId) return
    try {
      const { data } = await notificationsAPI.getAll({ limit: 5 })
      setUnreadCount(data.unreadCount || 0)
      setNotifications(data.data || [])
    } catch {}
  }, [userId]) // only re-create when the actual user ID changes

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0)
      setNotifications([])
      return
    }

    fetchCount()

    // Clear any existing interval before setting a new one
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(fetchCount, POLL_INTERVAL)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [userId]) // only restart polling when user changes, not fetchCount reference

  const markRead = async (id) => {
    await notificationsAPI.markRead(id)
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllRead = async () => {
    await notificationsAPI.markAllRead()
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  return (
    <NotificationContext.Provider value={{ unreadCount, notifications, markRead, markAllRead, refresh: fetchCount }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
