import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff, Mail, Lock, UserPlus } from 'lucide-react'
import Loading from '../components/Loading'

const Login = () => {
  const { login, register, loading } = useAuth()
  const [isRegistering, setIsRegistering] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    team: '',
    role: 'player'
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (isRegistering) {
        await register(formData)
      } else {
        await login({
          email: formData.email,
          password: formData.password
        })
      }
    } catch (error) {
      // Error handling is done in the auth context
      console.error('Auth error:', error)
    }
  }

  const toggleMode = () => {
    setIsRegistering(!isRegistering)
    setFormData({
      email: '',
      password: '',
      name: '',
      team: '',
      role: 'player'
    })
  }

  if (loading) {
    return <Loading message="Authenticating..." />
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-volleyball-orange to-volleyball-blue rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">🏐</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isRegistering ? 'Join VolleyBank' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isRegistering 
              ? 'Create your account to track volleyball matches and earnings'
              : 'Sign in to your account to manage volleyball matches'
            }
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name field (only for registration) */}
            {isRegistering && (
              <div>
                <label htmlFor="name" className="sr-only">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={isRegistering}
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field pl-10"
                    placeholder="Full Name"
                  />
                  <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  placeholder="Email address"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Team field (only for player registration) */}
            {isRegistering && formData.role === 'player' && (
              <div>
                <label htmlFor="team" className="sr-only">
                  Team Name
                </label>
                <select
                  id="team"
                  name="team"
                  required={isRegistering && formData.role === 'player'}
                  value={formData.team}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="">Select your team</option>
                  <option value="Team A">Team A</option>
                  <option value="Team B">Team B</option>
                  <option value="Team C">Team C</option>
                </select>
              </div>
            )}

            {/* Role field (only for registration) */}
            {isRegistering && (
              <div>
                <label htmlFor="role" className="sr-only">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="player">Player</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            {/* Password field */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isRegistering ? 'new-password' : 'current-password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field pl-10 pr-10"
                  placeholder="Password"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner mr-2"></div>
                  {isRegistering ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isRegistering ? 'Create Account' : 'Sign In'
              )}
            </button>
          </div>

          {/* Toggle mode */}
          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              {isRegistering 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Register"
              }
            </button>
          </div>
        </form>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Admin:</strong> admin@volleybank.com / password</p>
            <p><strong>Player:</strong> player@volleybank.com / password</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login 