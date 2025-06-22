import React, { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in on app load
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/auth/status', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error('Auth status check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = () => {
    window.location.href = 'http://localhost:5000/auth/google'
  }

  const logout = async () => {
    try {
      const response = await fetch('http://localhost:5000/auth/logout', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(null)
        toast.success(data.message || 'Logged out successfully')
        // Redirect to home page
        window.location.href = '/'
      } else {
        throw new Error('Logout failed')
      }
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('Logout failed')
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 