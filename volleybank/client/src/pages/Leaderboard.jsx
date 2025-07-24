import { Trophy, Medal, Award } from 'lucide-react'

const Leaderboard = () => {
  const playerLeaderboard = [
    { rank: 1, name: 'John Doe', team: 'Team A', earnings: 450, matches: 8, winRate: 75 },
    { rank: 2, name: 'Jane Smith', team: 'Team B', earnings: 400, matches: 7, winRate: 71 },
    { rank: 3, name: 'Mike Johnson', team: 'Team C', earnings: 350, matches: 6, winRate: 67 },
    { rank: 4, name: 'Sarah Wilson', team: 'Team A', earnings: 300, matches: 5, winRate: 60 },
    { rank: 5, name: 'David Brown', team: 'Team B', earnings: 250, matches: 4, winRate: 50 },
  ]

  const teamLeaderboard = [
    { rank: 1, team: 'Team A', wins: 6, matches: 10, winRate: 60, earnings: 900 },
    { rank: 2, team: 'Team B', wins: 5, matches: 10, winRate: 50, earnings: 750 },
    { rank: 3, team: 'Team C', wins: 4, matches: 10, winRate: 40, earnings: 600 },
  ]

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-orange-500" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-600 font-bold">#{rank}</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
        <p className="text-gray-600">Top performing players and teams</p>
      </div>

      {/* Team Leaderboard */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Team Rankings</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Rank</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Team</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Wins</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Matches</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Win Rate</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {teamLeaderboard.map((team, index) => (
                <tr key={team.team} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getRankIcon(team.rank)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{team.team}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-900">{team.wins}</td>
                  <td className="py-3 px-4 text-gray-900">{team.matches}</td>
                  <td className="py-3 px-4">
                    <span className="text-gray-900">{team.winRate}%</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-green-600">₹{team.earnings}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Player Leaderboard */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Player Rankings</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Rank</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Player</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Team</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Earnings</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Matches</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {playerLeaderboard.map((player, index) => (
                <tr key={player.name} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getRankIcon(player.rank)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{player.name}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {player.team}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-green-600">₹{player.earnings}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-900">{player.matches}</td>
                  <td className="py-3 px-4">
                    <span className="text-gray-900">{player.winRate}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Achievement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card text-center">
          <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">Top Earner</h3>
          <p className="text-gray-600">John Doe - ₹450</p>
        </div>

        <div className="stat-card text-center">
          <Medal className="w-12 h-12 text-blue-500 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">Best Win Rate</h3>
          <p className="text-gray-600">John Doe - 75%</p>
        </div>

        <div className="stat-card text-center">
          <Award className="w-12 h-12 text-purple-500 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">Most Active</h3>
          <p className="text-gray-600">John Doe - 8 matches</p>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard 