import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in environment variables.');
}

/**
 * Creates a Supabase client that authenticates as the given user via their JWT.
 * All queries will run under that user's Row Level Security context.
 */
export function createUserSupabase(jwt: string) {
  return createClient(supabaseUrl!, supabaseAnonKey!, {
    global: {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * An unauthenticated Supabase client for reading public data (document_chunks).
 */
export const supabasePublic = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: { persistSession: false },
});
