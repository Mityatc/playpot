import { Trophy, DollarSign, Target, TrendingUp } from 'lucide-react'

const PlayerDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Player Dashboard</h1>
        <p className="text-gray-600">Track your volleyball performance and earnings</p>
      </div>

      {/* Player Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">₹850</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Matches Won</p>
              <p className="text-2xl font-bold text-gray-900">7</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Points</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Win Rate</p>
              <p className="text-2xl font-bold text-gray-900">70%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Smashes</span>
              <span className="font-bold text-gray-900">42</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Spikes</span>
              <span className="font-bold text-gray-900">38</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Saves</span>
              <span className="font-bold text-gray-900">76</span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-gray-600 font-medium">Total Points</span>
              <span className="font-bold text-primary-600">156</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Earnings</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">Match vs Team B, C</p>
                <p className="text-sm text-gray-600">Yesterday</p>
              </div>
              <span className="font-bold text-green-600">+₹50</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">Match vs Team A, C</p>
                <p className="text-sm text-gray-600">3 days ago</p>
              </div>
              <span className="font-bold text-green-600">+₹50</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">Match vs Team A, B</p>
                <p className="text-sm text-gray-600">1 week ago</p>
              </div>
              <span className="font-bold text-gray-400">₹0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Team Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Team Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-volleyball-blue rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <h3 className="font-bold text-gray-900">Team B</h3>
            <p className="text-sm text-gray-600">Your Team</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Team Matches</p>
            <p className="text-2xl font-bold text-gray-900">10</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Team Win Rate</p>
            <p className="text-2xl font-bold text-gray-900">60%</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlayerDashboard 