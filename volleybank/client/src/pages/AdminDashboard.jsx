import { useState } from 'react'
import { Plus, Users, Trophy, DollarSign, Calendar } from 'lucide-react'
import CreateMatchModal from '../components/CreateMatchModal'

const AdminDashboard = () => {
  const [isCreateMatchModalOpen, setIsCreateMatchModalOpen] = useState(false)

  const handleMatchCreated = (newMatch) => {
    // Refresh matches data or update state
    console.log('New match created:', newMatch)
    // You can add state update logic here later
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage volleyball matches, players, and track earnings</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Matches</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Players</p>
              <p className="text-2xl font-bold text-gray-900">18</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Stakes</p>
              <p className="text-2xl font-bold text-gray-900">₹3,600</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Championships</p>
              <p className="text-2xl font-bold text-gray-900">4</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={() => setIsCreateMatchModalOpen(true)}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Match</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Manage Players</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>View Leaderboard</span>
          </button>
        </div>
      </div>

      {/* Recent Matches */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Matches</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Team A vs Team B vs Team C</p>
              <p className="text-sm text-gray-600">Winner: Team A • Stake: ₹300</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-green-600">Completed</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No more recent matches</p>
            <button 
              onClick={() => setIsCreateMatchModalOpen(true)}
              className="btn-primary mt-2"
            >
              Create First Match
            </button>
          </div>
        </div>
      </div>

      {/* Create Match Modal */}
      <CreateMatchModal
        isOpen={isCreateMatchModalOpen}
        onClose={() => setIsCreateMatchModalOpen(false)}
        onMatchCreated={handleMatchCreated}
      />
    </div>
  )
}

export default AdminDashboard 