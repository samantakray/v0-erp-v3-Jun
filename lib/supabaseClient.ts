// ./lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for browser-side usage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create a service role client for server-side operations that need elevated permissions
export const createServiceClient = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  return createClient(supabaseUrl, supabaseServiceKey)
}
