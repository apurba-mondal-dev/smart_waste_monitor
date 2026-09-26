import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY?.trim()

export const isMock = !supabaseUrl || !supabaseAnonKey

if (import.meta.env.DEV) {
  console.log(
    isMock
      ? '%cSmart Waste Monitor: Running in Local Mock Mode'
      : '%cSmart Waste Monitor: Connecting to Supabase',
    isMock ? 'color:#22c55e;font-weight:bold' : 'color:#3b82f6;font-weight:bold'
  );
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
