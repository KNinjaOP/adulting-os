import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/endpoints'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      authAPI.getMe()
        .then(({ data }) => setUser(data.user))
        .catch(() => localStorage.removeItem('accessToken'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (accessToken, userData) => {
    localStorage.setItem('accessToken', accessToken)
    setUser(userData)
  }

  const logout = async () => {
    try { await authAPI.logout() } catch {}
    localStorage.removeItem('accessToken')
    setUser(null)
  }

  const updateUser = (updates) => setUser(prev => ({ ...prev, ...updates }))

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
