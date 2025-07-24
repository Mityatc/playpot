import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('volleybank_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong'
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('volleybank_token')
      localStorage.removeItem('volleybank_user')
      window.location.href = '/login'
      return Promise.reject(error)
    }
    
    // Handle server errors
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (error.response?.status >= 400) {
      toast.error(message)
    } else if (error.request) {
      toast.error('Network error. Please check your connection.')
    }
    
    return Promise.reject(error)
  }
)

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  getAllPlayers: () => api.get('/auth/players'),
  getPlayersByTeam: (team) => api.get(`/auth/players/team/${team}`),
}

// Match API calls
export const matchAPI = {
  getAllMatches: (params) => api.get('/match', { params }),
  getMatchById: (id) => api.get(`/match/${id}`),
  createMatch: (matchData) => api.post('/match', matchData),
  updateMatch: (id, data) => api.put(`/match/${id}`, data),
  deleteMatch: (id) => api.delete(`/match/${id}`),
  getRecentMatches: (limit) => api.get('/match/recent', { params: { limit } }),
  getMatchStats: () => api.get('/match/stats'),
  getTeamPerformance: (team) => api.get(`/match/team/${team}/performance`),
  getPlayerMatches: (playerId, params) => api.get(`/match/player/${playerId}`, { params }),
}

// Player API calls
export const playerAPI = {
  getPlayerDetails: (id) => api.get(`/player/${id}`),
  getPlayerStats: (id) => api.get(`/player/${id}/stats`),
  getPlayerEarnings: (id, params) => api.get(`/player/${id}/earnings`, { params }),
}

// Stats API calls
export const statsAPI = {
  updatePlayerStats: (playerId, data) => api.post(`/stats/${playerId}`, data),
  getLeaderboard: (params) => api.get('/stats/leaderboard', { params }),
  getTeamLeaderboard: () => api.get('/stats/leaderboard/teams'),
  getPerformanceStats: (params) => api.get('/stats/performance', { params }),
}

// Generic API helper functions
export const apiHelpers = {
  // Handle API responses consistently
  handleResponse: (response) => {
    if (response.data.status === 'success') {
      return response.data.data
    }
    throw new Error(response.data.message || 'API call failed')
  },
  
  // Format error messages
  formatError: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message
    }
    if (error.message) {
      return error.message
    }
    return 'An unexpected error occurred'
  },
  
  // Get stored auth token
  getToken: () => localStorage.getItem('volleybank_token'),
  
  // Set auth token
  setToken: (token) => localStorage.setItem('volleybank_token', token),
  
  // Remove auth token
  removeToken: () => {
    localStorage.removeItem('volleybank_token')
    localStorage.removeItem('volleybank_user')
  },
  
  // Get stored user
  getStoredUser: () => {
    try {
      const user = localStorage.getItem('volleybank_user')
      return user ? JSON.parse(user) : null
    } catch {
      return null
    }
  },
  
  // Set stored user
  setStoredUser: (user) => localStorage.setItem('volleybank_user', JSON.stringify(user)),
}

export default api 