import { Calendar, Clock, Trophy, Users } from 'lucide-react'

const MatchHistory = () => {
  const matches = [
    {
      id: 1,
      date: '2024-01-20',
      time: '14:30',
      teams: ['Team A', 'Team B', 'Team C'],
      winner: 'Team A',
      stake: 300,
      status: 'Completed',
      players: 9
    },
    {
      id: 2,
      date: '2024-01-13',
      time: '15:00',
      teams: ['Team A', 'Team B', 'Team C'],
      winner: 'Team B',
      stake: 300,
      status: 'Completed',
      players: 9
    },
    {
      id: 3,
      date: '2024-01-06',
      time: '14:45',
      teams: ['Team A', 'Team B', 'Team C'],
      winner: 'Team C',
      stake: 300,
      status: 'Completed',
      players: 8
    },
    {
      id: 4,
      date: '2023-12-30',
      time: '15:15',
      teams: ['Team A', 'Team B', 'Team C'],
      winner: 'Team A',
      stake: 250,
      status: 'Completed',
      players: 9
    },
  ]

  const getWinnerBadgeColor = (winner) => {
    switch (winner) {
      case 'Team A':
        return 'bg-red-100 text-red-800'
      case 'Team B':
        return 'bg-blue-100 text-blue-800'
      case 'Team C':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Match History</h1>
            <p className="text-gray-600">Complete record of all volleyball matches</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Total Matches:</span> {matches.length}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Total Stakes:</span> ₹{matches.reduce((sum, match) => sum + match.stake, 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <input
              type="date"
              className="input-field"
              placeholder="From date"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              className="input-field"
              placeholder="To date"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Winner</label>
            <select className="input-field">
              <option value="">All Teams</option>
              <option value="Team A">Team A</option>
              <option value="Team B">Team B</option>
              <option value="Team C">Team C</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="btn-primary">Filter</button>
          </div>
        </div>
      </div>

      {/* Match List */}
      <div className="space-y-4">
        {matches.map((match) => (
          <div key={match.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              {/* Match Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span className="text-sm">{formatDate(match.date)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="text-sm">{match.time}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-1" />
                    <span className="text-sm">{match.players} players</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {match.teams.map((team, index) => (
                    <span 
                      key={team}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        team === match.winner 
                          ? getWinnerBadgeColor(team) 
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {team}
                      {team === match.winner && (
                        <Trophy className="w-3 h-3 ml-1 inline" />
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Match Details */}
              <div className="lg:text-right space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Winner:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-sm font-medium ${getWinnerBadgeColor(match.winner)}`}>
                    {match.winner}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Stake:</span>
                  <span className="ml-2 font-bold text-green-600">₹{match.stake}</span>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    match.status === 'Completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {match.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing 1 to {matches.length} of {matches.length} matches
          </div>
          <div className="flex space-x-2">
            <button className="btn-secondary" disabled>Previous</button>
            <button className="btn-primary">1</button>
            <button className="btn-secondary" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MatchHistory 