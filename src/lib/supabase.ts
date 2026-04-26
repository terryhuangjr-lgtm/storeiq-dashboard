import { createClient } from '@supabase/supabase-js'

// Get environment variables for Vite
const getEnvVar = (key: string): string | undefined => {
  // Check for Vite import.meta.env first
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.[key]) {
    return (import.meta as any).env[key]
  }
  // Fallback to process.env (for Node.js environments)
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key]
  }
  return undefined
}

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || 'https://your-supabase-url.supabase.co'
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Demo mode - generates mock data when no Supabase connection is available
export const isDemoMode = !supabaseUrl || supabaseUrl === 'https://your-supabase-url.supabase.co'