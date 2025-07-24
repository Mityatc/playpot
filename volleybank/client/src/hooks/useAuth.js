import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'

export const useAuth = () => {
  return useSupabaseAuth()
} 