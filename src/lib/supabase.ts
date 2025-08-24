import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  // In test mode, include anon key as Authorization header so Edge Functions with verify_jwt work
  global: (import.meta as any)?.env?.MODE === 'test'
    ? { headers: { Authorization: `Bearer ${supabaseAnonKey}` } }
    : undefined
})

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Helper function to update user metadata
export const updateUserMetadata = async (metadata: Record<string, any>) => {
  const { data, error } = await supabase.auth.updateUser({
    data: metadata
  })
  return { data, error }
}

// Helper function to get user profile from the database
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user')
    .select('*')
    .eq('supabase_auth_user_id', userId)
    .single()
  
  return { data, error }
}

// Helper function to get tenant info
export const getTenant = async (userId: string) => {
  const { data, error } = await supabase
    .from('tenant')
    .select('*')
    .eq('supabase_auth_user_id', userId)
    .single()
  
  return { data, error }
} 