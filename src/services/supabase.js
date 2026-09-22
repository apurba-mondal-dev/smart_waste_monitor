import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY?.trim()

export const isMock = !supabaseUrl || !supabaseAnonKey

if (isMock) {
  console.log('%cSmart Waste Monitor: Running in Local Mock Mode (persistent using LocalStorage)', 'color: #22c55e; font-weight: bold; font-size: 14px;');
  console.log('Missing env vars:', { hasUrl: !!supabaseUrl, hasAnonKey: !!supabaseAnonKey });
} else {
  console.log('%cSmart Waste Monitor: Connecting to Supabase', 'color: #3b82f6; font-weight: bold; font-size: 14px;');
}

// Standard client (anon key) — used for all normal queries & auth
export const supabase = isMock ? null : createClient(supabaseUrl, supabaseAnonKey)

// Admin client (service role key) — used ONLY for privileged admin operations
// (creating / deleting auth users). Never expose this key publicly.
export const supabaseAdmin = (!isMock && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null
