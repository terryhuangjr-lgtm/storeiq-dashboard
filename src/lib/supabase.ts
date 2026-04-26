import { createClient } from '@supabase/supabase-js'

declare global {
  interface ImportMeta {
    env: {
      VITE_SUPABASE_URL?: string
      VITE_SUPABASE_ANON_KEY?: string
    }
  }
}

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 'https://your-supabase-url.supabase.co'
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Demo mode - generates mock data when no Supabase connection is available
export const isDemoMode = !supabaseUrl || supabaseUrl === 'https://your-supabase-url.supabase.co'