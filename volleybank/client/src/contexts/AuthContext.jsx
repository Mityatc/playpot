import { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI, apiHelpers } from '../services/api'
import toast from 'react-hot-toast'

// Auth context
const AuthContext = createContext()

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'LOGOUT':
      return { ...state, user: null, loading: false, error: null }
    default:
      return state
  }
}

// Initial state
const initialState = {
  user: null,
  loading: true,
  error: null
}

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = apiHelpers.getToken()
      const storedUser = apiHelpers.getStoredUser()

      if (!token || !storedUser) {
        dispatch({ type: 'SET_LOADING', payload: false })
        return
      }

      try {
        // Verify token is still valid by fetching user data
        const response = await authAPI.getMe()
        const userData = apiHelpers.handleResponse(response)
        
        dispatch({ type: 'SET_USER', payload: userData.user })
        apiHelpers.setStoredUser(userData.user)
      } catch (error) {
        // Token is invalid, clear stored data
        apiHelpers.removeToken()
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    initializeAuth()
  }, [])

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await authAPI.login(credentials)
      const data = apiHelpers.handleResponse(response)
      
      // Store token and user data
      apiHelpers.setToken(data.token)
      apiHelpers.setStoredUser(data.user)
      
      dispatch({ type: 'SET_USER', payload: data.user })
      toast.success(`Welcome back, ${data.user.name}! 🏐`)
      
      return data
    } catch (error) {
      const errorMessage = apiHelpers.formatError(error)
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      throw error
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await authAPI.register(userData)
      const data = apiHelpers.handleResponse(response)
      
      // Store token and user data
      apiHelpers.setToken(data.token)
      apiHelpers.setStoredUser(data.user)
      
      dispatch({ type: 'SET_USER', payload: data.user })
      toast.success(`Welcome to VolleyBank, ${data.user.name}! 🎉`)
      
      return data
    } catch (error) {
      const errorMessage = apiHelpers.formatError(error)
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      throw error
    }
  }

  // Logout function
  const logout = () => {
    apiHelpers.removeToken()
    dispatch({ type: 'LOGOUT' })
    toast.success('Logged out successfully')
  }

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData)
      const data = apiHelpers.handleResponse(response)
      
      dispatch({ type: 'SET_USER', payload: data.user })
      apiHelpers.setStoredUser(data.user)
      toast.success('Profile updated successfully')
      
      return data
    } catch (error) {
      const errorMessage = apiHelpers.formatError(error)
      toast.error(errorMessage)
      throw error
    }
  }

  // Change password function
  const changePassword = async (passwordData) => {
    try {
      const response = await authAPI.changePassword(passwordData)
      apiHelpers.handleResponse(response)
      toast.success('Password changed successfully')
    } catch (error) {
      const errorMessage = apiHelpers.formatError(error)
      toast.error(errorMessage)
      throw error
    }
  }

  // Context value
  const value = {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!state.user,
    isAdmin: state.user?.role === 'admin',
    isPlayer: state.user?.role === 'player'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
} 