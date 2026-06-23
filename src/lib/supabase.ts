// Supabase client (Phase 2, session persistence added in Phase 3).
// Built from EXPO_PUBLIC_ env vars only — never hardcode the URL/key, and never
// use the service role key in the app.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

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
    // Persist the session so the user stays logged in across app restarts.
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    // We use email/password, not URL-based (OAuth/magic link) sessions.
    detectSessionInUrl: false,
  },
});

// Keep the access token fresh only while the app is in the foreground, per the
// Supabase + Expo guidance. (AppState is a no-op on web.)
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    void supabase.auth.startAutoRefresh();
  } else {
    void supabase.auth.stopAutoRefresh();
  }
});
