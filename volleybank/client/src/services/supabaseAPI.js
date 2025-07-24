import { supabase, TABLES, VIEWS } from '../config/supabase'
import toast from 'react-hot-toast'

// =====================================
// AUTHENTICATION SERVICES
// =====================================

export const authAPI = {
  // Sign up new user
  async signUp(userData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role || 'player',
            team: userData.team,
            organization_id: userData.organization_id
          }
        }
      })
      
      if (error) throw error
      
      // Update user profile with additional data
      if (data.user) {
        await supabase
          .from(TABLES.USERS)
          .update({
            organization_id: userData.organization_id,
            role: userData.role || 'player',
            team: userData.team,
            phone: userData.phone
          })
          .eq('id', data.user.id)
      }
      
      return { user: data.user, session: data.session }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  },

  // Sign in existing user
  async signIn(credentials) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })
      
      if (error) throw error
      
      // Get user profile data
      const { data: profile } = await supabase
        .from(TABLES.USERS)
        .select('*, organizations(*)')
        .eq('id', data.user.id)
        .single()
      
      return { 
        user: data.user, 
        session: data.session,
        profile 
      }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('Get session error:', error)
      throw error
    }
  },

  // Get current user profile
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      
      const { data: profile } = await supabase
        .from(TABLES.USERS)
        .select('*, organizations(*)')
        .eq('id', user.id)
        .single()
      
      return { user, profile }
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  },

  // Get all players in organization
  async getAllPlayers(organizationId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('organization_id', organizationId)
        .eq('role', 'player')
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error
      return { players: data }
    } catch (error) {
      console.error('Get players error:', error)
      throw error
    }
  }
}

// =====================================
// MATCH SERVICES
// =====================================

export const matchAPI = {
  // Create new match
  async createMatch(matchData) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')
      
      // Get user's organization
      const { data: userProfile } = await supabase
        .from(TABLES.USERS)
        .select('organization_id')
        .eq('id', user.id)
        .single()
      
      // Create match
      const { data: match, error: matchError } = await supabase
        .from(TABLES.MATCHES)
        .insert({
          organization_id: userProfile.organization_id,
          title: matchData.title || 'Volleyball Match',
          match_date: matchData.date,
          winning_team: matchData.winningTeam,
          stake_amount: matchData.stakeAmount,
          created_by: user.id,
          status: 'completed'
        })
        .select()
        .single()
      
      if (matchError) throw matchError
      
      // Add players to match
      if (matchData.players && matchData.players.length > 0) {
        const playerData = matchData.players.map(player => ({
          match_id: match.id,
          player_id: player.playerId,
          role: player.role || 'Player',
          smashes: player.smashes || 0,
          spikes: player.spikes || 0,
          saves: player.saves || 0,
          points_scored: (player.smashes || 0) + (player.spikes || 0) + (player.saves || 0)
        }))
        
        const { error: playersError } = await supabase
          .from(TABLES.MATCH_PLAYERS)
          .insert(playerData)
        
        if (playersError) throw playersError
        
        // Calculate and distribute earnings
        await this.calculateEarnings(match.id, matchData.winningTeam, matchData.stakeAmount, matchData.players)
      }
      
      // Send real-time notification
      this.broadcastMatchCreated(match)
      
      return { match }
    } catch (error) {
      console.error('Create match error:', error)
      throw error
    }
  },

  // Calculate and distribute earnings
  async calculateEarnings(matchId, winningTeam, stakeAmount, players) {
    try {
      // Get winning team players
      const { data: winningPlayers } = await supabase
        .from(TABLES.MATCH_PLAYERS)
        .select('player_id, users!inner(team)')
        .eq('match_id', matchId)
        .eq('users.team', winningTeam)
      
      if (winningPlayers.length === 0) return
      
      const earningsPerPlayer = parseFloat(stakeAmount) / winningPlayers.length
      
      // Create earnings records
      const earningsData = winningPlayers.map(player => ({
        player_id: player.player_id,
        match_id: matchId,
        amount_earned: earningsPerPlayer,
        earning_type: 'match_win'
      }))
      
      const { error } = await supabase
        .from(TABLES.EARNINGS)
        .insert(earningsData)
      
      if (error) throw error
      
      // Send notifications to winners
      await this.notifyEarnings(winningPlayers, earningsPerPlayer, matchId)
      
    } catch (error) {
      console.error('Calculate earnings error:', error)
      throw error
    }
  },

  // Notify players about earnings
  async notifyEarnings(winners, amount, matchId) {
    try {
      const notifications = winners.map(player => ({
        user_id: player.player_id,
        title: '🎉 Match Won! Earnings Credited',
        message: `Congratulations! You earned ₹${amount.toFixed(2)} from the recent match.`,
        type: 'earning',
        data: { match_id: matchId, amount }
      }))
      
      await supabase.from(TABLES.NOTIFICATIONS).insert(notifications)
    } catch (error) {
      console.error('Notify earnings error:', error)
    }
  },

  // Broadcast match created (real-time)
  broadcastMatchCreated(match) {
    supabase.channel('matches').send({
      type: 'broadcast',
      event: 'match_created',
      payload: { match }
    })
  },

  // Get all matches for organization
  async getAllMatches(organizationId, filters = {}) {
    try {
      let query = supabase
        .from(TABLES.MATCHES)
        .select(`
          *,
          created_by_user:users!created_by(name),
          match_players(
            *,
            player:users(name, team)
          )
        `)
        .eq('organization_id', organizationId)
        .order('match_date', { ascending: false })
      
      // Apply filters
      if (filters.team) {
        query = query.eq('winning_team', filters.team)
      }
      
      if (filters.dateFrom) {
        query = query.gte('match_date', filters.dateFrom)
      }
      
      if (filters.dateTo) {
        query = query.lte('match_date', filters.dateTo)
      }
      
      const { data, error } = await query
      if (error) throw error
      
      return { matches: data }
    } catch (error) {
      console.error('Get matches error:', error)
      throw error
    }
  },

  // Get match by ID
  async getMatchById(matchId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MATCHES)
        .select(`
          *,
          created_by_user:users!created_by(name),
          match_players(
            *,
            player:users(name, team, email),
            earnings(amount_earned)
          )
        `)
        .eq('id', matchId)
        .single()
      
      if (error) throw error
      return { match: data }
    } catch (error) {
      console.error('Get match error:', error)
      throw error
    }
  },

  // Get recent matches
  async getRecentMatches(organizationId, limit = 5) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MATCHES)
        .select(`
          *,
          created_by_user:users!created_by(name)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return { matches: data }
    } catch (error) {
      console.error('Get recent matches error:', error)
      throw error
    }
  }
}

// =====================================
// PLAYER & STATS SERVICES
// =====================================

export const playerAPI = {
  // Get player statistics
  async getPlayerStats(playerId) {
    try {
      const { data, error } = await supabase
        .from(VIEWS.PLAYER_STATS)
        .select('*')
        .eq('id', playerId)
        .single()
      
      if (error) throw error
      return { stats: data }
    } catch (error) {
      console.error('Get player stats error:', error)
      throw error
    }
  },

  // Get player earnings
  async getPlayerEarnings(playerId, filters = {}) {
    try {
      let query = supabase
        .from(TABLES.EARNINGS)
        .select(`
          *,
          match:matches(
            match_date,
            title,
            winning_team,
            stake_amount
          )
        `)
        .eq('player_id', playerId)
        .order('created_at', { ascending: false })
      
      if (filters.limit) {
        query = query.limit(filters.limit)
      }
      
      const { data, error } = await query
      if (error) throw error
      
      return { earnings: data }
    } catch (error) {
      console.error('Get player earnings error:', error)
      throw error
    }
  }
}

// =====================================
// LEADERBOARD SERVICES
// =====================================

export const leaderboardAPI = {
  // Get player leaderboard
  async getPlayerLeaderboard(organizationId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from(VIEWS.PLAYER_STATS)
        .select('*')
        .eq('organization_id', organizationId)
        .order('total_earnings', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return { leaderboard: data }
    } catch (error) {
      console.error('Get player leaderboard error:', error)
      throw error
    }
  },

  // Get team leaderboard
  async getTeamLeaderboard(organizationId) {
    try {
      const { data, error } = await supabase
        .from(VIEWS.TEAM_LEADERBOARD)
        .select('*')
        .eq('organization_id', organizationId)
        .order('win_percentage', { ascending: false })
      
      if (error) throw error
      return { teams: data }
    } catch (error) {
      console.error('Get team leaderboard error:', error)
      throw error
    }
  }
}

// =====================================
// REAL-TIME SUBSCRIPTIONS
// =====================================

export const realtimeAPI = {
  // Subscribe to match updates
  subscribeToMatches(organizationId, callback) {
    return supabase
      .channel('matches')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `organization_id=eq.${organizationId}`
        },
        callback
      )
      .subscribe()
  },

  // Subscribe to earnings updates
  subscribeToEarnings(playerId, callback) {
    return supabase
      .channel('earnings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'earnings',
          filter: `player_id=eq.${playerId}`
        },
        callback
      )
      .subscribe()
  },

  // Subscribe to notifications
  subscribeToNotifications(userId, callback) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  },

  // Unsubscribe from channel
  unsubscribe(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription)
    }
  }
}

// =====================================
// NOTIFICATION SERVICES
// =====================================

export const notificationAPI = {
  // Get user notifications
  async getUserNotifications(userId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return { notifications: data }
    } catch (error) {
      console.error('Get notifications error:', error)
      throw error
    }
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .update({ is_read: true })
        .eq('id', notificationId)
      
      if (error) throw error
    } catch (error) {
      console.error('Mark notification read error:', error)
      throw error
    }
  },

  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      const { error } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)
      
      if (error) throw error
    } catch (error) {
      console.error('Mark all notifications read error:', error)
      throw error
    }
  }
}

// =====================================
// ORGANIZATION SERVICES
// =====================================

export const organizationAPI = {
  // Get organization details
  async getOrganization(organizationId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.ORGANIZATIONS)
        .select('*')
        .eq('id', organizationId)
        .single()
      
      if (error) throw error
      return { organization: data }
    } catch (error) {
      console.error('Get organization error:', error)
      throw error
    }
  },

  // Get organization stats
  async getOrganizationStats(organizationId) {
    try {
      // Get total matches
      const { count: totalMatches } = await supabase
        .from(TABLES.MATCHES)
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
      
      // Get total players
      const { count: totalPlayers } = await supabase
        .from(TABLES.USERS)
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('role', 'player')
      
      // Get total stakes
      const { data: stakeData } = await supabase
        .from(TABLES.MATCHES)
        .select('stake_amount')
        .eq('organization_id', organizationId)
      
      const totalStakes = stakeData?.reduce((sum, match) => sum + parseFloat(match.stake_amount), 0) || 0
      
      return {
        stats: {
          totalMatches: totalMatches || 0,
          totalPlayers: totalPlayers || 0,
          totalStakes: totalStakes
        }
      }
    } catch (error) {
      console.error('Get organization stats error:', error)
      throw error
    }
  }
}

// =====================================
// ERROR HANDLING UTILITY
// =====================================

export const handleSupabaseError = (error) => {
  console.error('Supabase error:', error)
  
  if (error?.message) {
    toast.error(error.message)
  } else {
    toast.error('An unexpected error occurred')
  }
  
  return error
}

// Export all APIs
export default {
  auth: authAPI,
  match: matchAPI,
  player: playerAPI,
  leaderboard: leaderboardAPI,
  realtime: realtimeAPI,
  notification: notificationAPI,
  organization: organizationAPI
} 