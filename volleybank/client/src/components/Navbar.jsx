import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { 
  Home, 
  User, 
  Trophy, 
  Calendar, 
  Settings, 
  LogOut,
  Shield,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, show: !!user },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy, show: !!user },
    { name: 'Matches', href: '/matches', icon: Calendar, show: !!user },
    { name: 'Admin', href: '/admin', icon: Shield, show: isAdmin },
  ]

  const handleLogout = () => {
    logout()
    setIsMobileMenuOpen(false)
  }

  if (!user) {
    return (
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-volleyball-orange to-volleyball-blue rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">🏐</span>
              </div>
              <span className="font-bold text-xl text-gray-900">VolleyBank</span>
            </Link>
            
            <Link 
              to="/login" 
              className="btn-primary"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-volleyball-orange to-volleyball-blue rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">🏐</span>
            </div>
            <span className="font-bold text-xl text-gray-900">VolleyBank</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => 
              item.show && (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">
                  {isAdmin ? 'Admin' : `${user.team} Player`}
                </p>
              </div>
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors duration-200"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {/* User Info Mobile */}
              <div className="flex items-center space-x-3 px-3 py-2 border-b border-gray-100 mb-2">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">
                    {isAdmin ? 'Admin' : `${user.team} Player`}
                  </p>
                </div>
              </div>

              {/* Navigation Items */}
              {navigation.map((item) => 
                item.show && (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              )}

              {/* Logout Button Mobile */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 w-full"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar 