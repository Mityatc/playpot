import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database table names for consistency
export const TABLES = {
  ORGANIZATIONS: 'organizations',
  USERS: 'users', 
  MATCHES: 'matches',
  MATCH_PLAYERS: 'match_players',
  EARNINGS: 'earnings',
  TOURNAMENTS: 'tournaments',
  NOTIFICATIONS: 'notifications',
  TEAMS: 'teams'
}

// Views for optimized queries
export const VIEWS = {
  PLAYER_STATS: 'player_stats',
  TEAM_LEADERBOARD: 'team_leaderboard'
}

// Real-time channels for live updates
export const CHANNELS = {
  MATCHES: 'matches',
  EARNINGS: 'earnings',
  NOTIFICATIONS: 'notifications',
  LEADERBOARD: 'leaderboard'
}

export default supabase 