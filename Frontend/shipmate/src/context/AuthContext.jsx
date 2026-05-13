import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authAPI.getUser()
        setUser(userData.user)
      } catch (err) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    const response = await authAPI.login(email, password)
    if (response.user) {
      setUser(response.user)
    }
    return response
  }

  const signup = async (full_name, email, phone, password) => {
    const response = await authAPI.signup(full_name, email, phone, password)
    if (response.user) {
      setUser(response.user)
    }
    return response
  }

  const googleLogin = async (credential) => {
    const response = await authAPI.googleLogin(credential)
    if (response.user) {
      setUser(response.user)
    }
    return response
  }

  const logout = async () => {
    try {
      await authAPI.logout()
      setUser(null)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
