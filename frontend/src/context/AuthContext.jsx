import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authApi } from '../services/api'
const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('jp_user') || 'null') } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('jp_token'))
  const [loading, setLoading] = useState(true)

  // Re-validate token on app boot. If backend was off and is now on, this restores the session.
  // If token is invalid/expired, server returns 401 → axios interceptor clears storage → user logs out cleanly.
  useEffect(() => {
    let cancelled = false
    const verify = async () => {
      if (!token) { setLoading(false); return }
      try {
        const me = await authApi.me()
        if (!cancelled) {
          const merged = { ...(user || {}), ...me }
          setUser(merged)
          localStorage.setItem('jp_user', JSON.stringify(merged))
        }
      } catch {
        if (!cancelled) {
          setUser(null); setToken(null)
          localStorage.removeItem('jp_token'); localStorage.removeItem('jp_user')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    verify()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password })
    localStorage.setItem('jp_token', data.token)
    localStorage.setItem('jp_user', JSON.stringify(data))
    setToken(data.token); setUser(data)
    return data
  }, [])
  const register = useCallback(async (payload) => {
    const data = await authApi.register(payload)
    localStorage.setItem('jp_token', data.token)
    localStorage.setItem('jp_user', JSON.stringify(data))
    setToken(data.token); setUser(data)
    return data
  }, [])
  const logout = useCallback(() => {
    localStorage.removeItem('jp_token'); localStorage.removeItem('jp_user')
    setToken(null); setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token && !!user }}>
      {children}
    </AuthContext.Provider>
  )
}
export const useAuth = () => useContext(AuthContext)
