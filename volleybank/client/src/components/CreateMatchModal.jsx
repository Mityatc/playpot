import { useState, useEffect } from 'react'
import { X, Plus, Minus, Trophy, Users, DollarSign, Calendar } from 'lucide-react'
import { matchAPI, authAPI } from '../services/api'
import toast from 'react-hot-toast'

const CreateMatchModal = ({ isOpen, onClose, onMatchCreated }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    winningTeam: '',
    stakeAmount: 300,
    players: []
  })
  const [availablePlayers, setAvailablePlayers] = useState([])
  const [selectedPlayers, setSelectedPlayers] = useState([])
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Basic Info, 2: Player Selection, 3: Player Stats

  const teams = ['Team A', 'Team B', 'Team C']

  // Fetch available players
  useEffect(() => {
    if (isOpen) {
      fetchPlayers()
    }
  }, [isOpen])

  const fetchPlayers = async () => {
    try {
      const response = await authAPI.getAllPlayers()
      const players = response.data.data.players || []
      setAvailablePlayers(players)
    } catch (error) {
      toast.error('Failed to load players')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stakeAmount' ? parseFloat(value) || 0 : value
    }))
  }

  const togglePlayerSelection = (player) => {
    setSelectedPlayers(prev => {
      const isSelected = prev.find(p => p.id === player.id)
      if (isSelected) {
        return prev.filter(p => p.id !== player.id)
      } else {
        return [...prev, {
          ...player,
          role: 'Player',
          smashes: 0,
          spikes: 0,
          saves: 0
        }]
      }
    })
  }

  const updatePlayerStats = (playerId, field, value) => {
    setSelectedPlayers(prev =>
      prev.map(player =>
        player.id === playerId
          ? { ...player, [field]: parseInt(value) || 0 }
          : player
      )
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (selectedPlayers.length === 0) {
      toast.error('Please select at least one player')
      return
    }

    if (!formData.winningTeam) {
      toast.error('Please select the winning team')
      return
    }

    // Check if winning team has players
    const winningTeamPlayers = selectedPlayers.filter(
      player => player.team === formData.winningTeam
    )

    if (winningTeamPlayers.length === 0) {
      toast.error(`No players selected from winning team "${formData.winningTeam}"`)
      return
    }

    setLoading(true)

    try {
      const matchData = {
        date: formData.date,
        winningTeam: formData.winningTeam,
        stakeAmount: formData.stakeAmount,
        players: selectedPlayers.map(player => ({
          playerId: player.id,
          role: player.role,
          smashes: player.smashes,
          spikes: player.spikes,
          saves: player.saves
        }))
      }

      const response = await matchAPI.createMatch(matchData)
      
      toast.success(
        `Match created! ${formData.winningTeam} won ₹${formData.stakeAmount} (₹${(formData.stakeAmount / winningTeamPlayers.length).toFixed(2)} per player)`,
        { duration: 5000 }
      )
      
      onMatchCreated?.(response.data.data.match)
      handleClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create match')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      winningTeam: '',
      stakeAmount: 300,
      players: []
    })
    setSelectedPlayers([])
    setStep(1)
    onClose()
  }

  const nextStep = () => {
    if (step === 1) {
      if (!formData.date || !formData.winningTeam || !formData.stakeAmount) {
        toast.error('Please fill in all basic information')
        return
      }
    }
    setStep(prev => Math.min(prev + 1, 3))
  }

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1))
  }

  const getPlayersByTeam = (team) => {
    return availablePlayers.filter(player => player.team === team)
  }

  const getSelectedPlayersByTeam = (team) => {
    return selectedPlayers.filter(player => player.team === team)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-volleyball-orange rounded-full flex items-center justify-center">
              <span className="text-white font-bold">🏐</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Match</h2>
              <p className="text-sm text-gray-600">
                Step {step} of 3: {step === 1 ? 'Basic Information' : step === 2 ? 'Select Players' : 'Player Statistics'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-200 h-2">
          <div 
            className="bg-volleyball-orange h-2 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Match Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Match Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>

                  {/* Stake Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Stake Amount (₹)
                    </label>
                    <input
                      type="number"
                      name="stakeAmount"
                      value={formData.stakeAmount}
                      onChange={handleInputChange}
                      min="1"
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                {/* Winning Team */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Trophy className="w-4 h-4 inline mr-1" />
                    Winning Team
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {teams.map(team => (
                      <label
                        key={team}
                        className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.winningTeam === team
                            ? 'border-volleyball-orange bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="winningTeam"
                          value={team}
                          checked={formData.winningTeam === team}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                            team === 'Team A' ? 'bg-red-500' :
                            team === 'Team B' ? 'bg-blue-500' : 'bg-green-500'
                          }`}>
                            <span className="text-white font-bold">
                              {team.charAt(5)}
                            </span>
                          </div>
                          <span className="font-medium">{team}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Player Selection */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Players</h3>
                  <p className="text-gray-600">Choose players who participated in this match</p>
                </div>

                {teams.map(team => {
                  const teamPlayers = getPlayersByTeam(team)
                  const selectedFromTeam = getSelectedPlayersByTeam(team)
                  
                  return (
                    <div key={team} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900 flex items-center">
                          <div className={`w-6 h-6 rounded-full mr-2 ${
                            team === 'Team A' ? 'bg-red-500' :
                            team === 'Team B' ? 'bg-blue-500' : 'bg-green-500'
                          }`}>
                            <span className="text-white text-sm font-bold flex items-center justify-center h-full">
                              {team.charAt(5)}
                            </span>
                          </div>
                          {team}
                        </h4>
                        <span className="text-sm text-gray-600">
                          {selectedFromTeam.length} / {teamPlayers.length} selected
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {teamPlayers.map(player => {
                          const isSelected = selectedPlayers.find(p => p.id === player.id)
                          return (
                            <label
                              key={player.id}
                              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-volleyball-orange bg-orange-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={!!isSelected}
                                onChange={() => togglePlayerSelection(player)}
                                className="mr-3"
                              />
                              <div>
                                <div className="font-medium text-gray-900">{player.name}</div>
                                <div className="text-sm text-gray-600">{player.email}</div>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900">
                      {selectedPlayers.length} players selected
                    </span>
                  </div>
                  {formData.winningTeam && (
                    <p className="text-sm text-blue-700 mt-1">
                      Winning team ({formData.winningTeam}) has {getSelectedPlayersByTeam(formData.winningTeam).length} players.
                      Each will earn ₹{selectedPlayers.length > 0 ? (formData.stakeAmount / getSelectedPlayersByTeam(formData.winningTeam).length).toFixed(2) : '0'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Player Statistics */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Player Statistics</h3>
                  <p className="text-gray-600">Enter performance stats for each player</p>
                </div>

                {selectedPlayers.length === 0 ? (
                  <p className="text-center text-gray-500">No players selected</p>
                ) : (
                  <div className="space-y-4">
                    {selectedPlayers.map(player => (
                      <div key={player.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">{player.name}</h4>
                            <p className="text-sm text-gray-600">{player.team}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            player.team === formData.winningTeam
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {player.team === formData.winningTeam ? 'Winner' : 'Participant'}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Smashes
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={player.smashes}
                              onChange={(e) => updatePlayerStats(player.id, 'smashes', e.target.value)}
                              className="input-field text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Spikes
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={player.spikes}
                              onChange={(e) => updatePlayerStats(player.id, 'spikes', e.target.value)}
                              className="input-field text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Saves
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={player.saves}
                              onChange={(e) => updatePlayerStats(player.id, 'saves', e.target.value)}
                              className="input-field text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn-secondary"
                  >
                    Previous
                  </button>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary disabled:opacity-50"
                  >
                    {loading ? 'Creating Match...' : 'Create Match'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateMatchModal 