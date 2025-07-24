import { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI, realtimeAPI, handleSupabaseError } from '../services/supabaseAPI'
import { supabase } from '../config/supabase'
import toast from 'react-hot-toast'

// Auth context
const SupabaseAuthContext = createContext()

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload.user,
        profile: action.payload.profile,
        session: action.payload.session,
        loading: false 
      }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'LOGOUT':
      return { 
        ...state, 
        user: null, 
        profile: null, 
        session: null, 
        loading: false, 
        error: null 
      }
    case 'UPDATE_PROFILE':
      return { ...state, profile: action.payload }
    default:
      return state
  }
}

// Initial state
const initialState = {
  user: null,
  profile: null,
  session: null,
  loading: true,
  error: null
}

// Auth provider component
export const SupabaseAuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialize auth state and listen for changes
  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const session = await authAPI.getSession()
        
        if (session && mounted) {
          const { user, profile } = await authAPI.getCurrentUser()
          
          if (user && profile) {
            dispatch({ 
              type: 'SET_USER', 
              payload: { user, profile, session } 
            })
            
            // Set up real-time subscriptions
            setupRealtimeSubscriptions(user.id, profile.organization_id)
          } else {
            dispatch({ type: 'SET_LOADING', payload: false })
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    getInitialSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        if (event === 'SIGNED_IN' && session) {
          const { user, profile } = await authAPI.getCurrentUser()
          
          if (user && profile) {
            dispatch({ 
              type: 'SET_USER', 
              payload: { user, profile, session } 
            })
            
            // Set up real-time subscriptions
            setupRealtimeSubscriptions(user.id, profile.organization_id)
          }
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'LOGOUT' })
          cleanupSubscriptions()
        }
      }
    )

    return () => {
      mounted = false
      subscription?.unsubscribe()
      cleanupSubscriptions()
    }
  }, [])

  // Real-time subscriptions
  let notificationSubscription = null
  let earningsSubscription = null

  const setupRealtimeSubscriptions = (userId, organizationId) => {
    // Subscribe to notifications
    notificationSubscription = realtimeAPI.subscribeToNotifications(
      userId,
      (payload) => {
        if (payload.new) {
          toast.success(payload.new.title, {
            duration: 5000,
            icon: '🔔'
          })
        }
      }
    )

    // Subscribe to earnings
    earningsSubscription = realtimeAPI.subscribeToEarnings(
      userId,
      (payload) => {
        if (payload.new) {
          toast.success(
            `💰 You earned ₹${payload.new.amount_earned}!`,
            { duration: 6000 }
          )
        }
      }
    )
  }

  const cleanupSubscriptions = () => {
    if (notificationSubscription) {
      realtimeAPI.unsubscribe(notificationSubscription)
      notificationSubscription = null
    }
    if (earningsSubscription) {
      realtimeAPI.unsubscribe(earningsSubscription)
      earningsSubscription = null
    }
  }

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const { user, session, profile } = await authAPI.signIn(credentials)
      
      dispatch({ 
        type: 'SET_USER', 
        payload: { user, profile, session } 
      })
      
      toast.success(`Welcome back, ${profile.name}! 🏐`, {
        duration: 4000
      })
      
      // Set up real-time subscriptions
      setupRealtimeSubscriptions(user.id, profile.organization_id)
      
      return { user, profile, session }
    } catch (error) {
      const errorMessage = error.message || 'Login failed'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      handleSupabaseError(error)
      throw error
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const { user, session } = await authAPI.signUp(userData)
      
      toast.success(
        `Welcome to VolleyBank, ${userData.name}! 🎉 Please check your email to verify your account.`,
        { duration: 6000 }
      )
      
      // Note: User will need to verify email before full access
      dispatch({ type: 'SET_LOADING', payload: false })
      
      return { user, session }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      handleSupabaseError(error)
      throw error
    }
  }

  // Logout function
  const logout = async () => {
    try {
      cleanupSubscriptions()
      await authAPI.signOut()
      dispatch({ type: 'LOGOUT' })
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even if API call fails
      dispatch({ type: 'LOGOUT' })
    }
  }

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', state.user.id)
      
      if (error) throw error
      
      // Update local state
      dispatch({ 
        type: 'UPDATE_PROFILE', 
        payload: { ...state.profile, ...profileData } 
      })
      
      toast.success('Profile updated successfully')
    } catch (error) {
      handleSupabaseError(error)
      throw error
    }
  }

  // Get organization stats
  const getOrganizationStats = async () => {
    if (!state.profile?.organization_id) return null
    
    try {
      const { organization } = await organizationAPI.getOrganization(state.profile.organization_id)
      const { stats } = await organizationAPI.getOrganizationStats(state.profile.organization_id)
      
      return { organization, stats }
    } catch (error) {
      console.error('Get org stats error:', error)
      return null
    }
  }

  // Context value
  const value = {
    // State
    user: state.user,
    profile: state.profile,
    session: state.session,
    loading: state.loading,
    error: state.error,
    
    // Computed properties
    isAuthenticated: !!state.user && !!state.profile,
    isAdmin: state.profile?.role === 'admin',
    isPlayer: state.profile?.role === 'player',
    isManager: state.profile?.role === 'manager',
    organizationId: state.profile?.organization_id,
    
    // Functions
    login,
    register,
    logout,
    updateProfile,
    getOrganizationStats,
    
    // Real-time capabilities
    setupRealtimeSubscriptions,
    cleanupSubscriptions
  }

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  )
}

// Hook to use Supabase auth context
export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext)
  if (!context) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider')
  }
  return context
}

export default SupabaseAuthContext 