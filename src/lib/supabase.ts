/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fhmjvnphxsbtwcutqkvq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZobWp2bnBoeHNidHdjdXRxa3ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTgyNzcsImV4cCI6MjA5Mjc5NDI3N30.aUBnSwsBCE4JURXaQpZR81jtgP6A4cO-XXSUHrdnRgU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const isDemoMode = false
