import { createContext, useContext, useState, useEffect, useCallback } from 'react'

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
    // Hardcode a dummy admin user
    setUser({
      id: 1,
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      is_staff: true,
      is_superuser: true
    })
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    return user
  }, [user])

  const logout = useCallback(async () => {
    // Do nothing, auth is disabled
  }, [])

  const updateUser = useCallback((updates) => {
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
  }, [user])

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: true,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
