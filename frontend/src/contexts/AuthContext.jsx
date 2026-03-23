import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api/axios.js'

const AuthContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token')
      const savedUser = localStorage.getItem('user')
      
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser))
          // Verify token is still valid
          const response = await authAPI.me()
          setUser(response.data)
          localStorage.setItem('user', JSON.stringify(response.data))
        } catch (error) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          setUser(null)
        }
      }
      setLoading(false)
    }
    
    initAuth()
  }, [])

  const login = useCallback(async (email, password) => {
    const response = await authAPI.login(email, password)
    const { access, refresh, user } = response.data
    
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    localStorage.setItem('user', JSON.stringify(user))
    
    setUser(user)
    return user
  }, [])

  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      // Ignore error
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      setUser(null)
    }
  }, [])

  const updateUser = useCallback((updates) => {
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }, [user])

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
