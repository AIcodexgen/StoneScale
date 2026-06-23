// Supabase client (Phase 2).
// Built from EXPO_PUBLIC_ env vars only — never hardcode the URL/key, and never
// use the service role key in the app.
import { createClient } from '@supabase/supabase-js';

import type { Database } from './types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase configuration. Set EXPO_PUBLIC_SUPABASE_URL and ' +
      'EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.',
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Phase 2 has no persistent auth flow yet. Keep the session in memory so we
    // don't need a storage adapter (AsyncStorage) before the auth phase adds one.
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
