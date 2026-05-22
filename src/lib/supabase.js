import { createClient } from '@supabase/supabase-js'

// Support both NEXT_PUBLIC_ and regular env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.warn('[v0] Supabase environment variables not found. Please set SUPABASE_URL and SUPABASE_ANON_KEY')
}

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey) 
  : null
