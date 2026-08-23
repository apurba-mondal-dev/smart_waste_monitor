import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isMock = !supabaseUrl || !supabaseAnonKey

if (isMock) {
  console.log('%cSmart Waste Monitor: Running in Local Mock Mode (persistent using LocalStorage)', 'color: #22c55e; font-weight: bold; font-size: 14px;');
} else {
  console.log('%cSmart Waste Monitor: Connecting to Supabase', 'color: #3b82f6; font-weight: bold; font-size: 14px;');
}

export const supabase = isMock ? null : createClient(supabaseUrl, supabaseAnonKey)

