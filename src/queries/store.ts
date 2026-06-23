// Auth, role, and store_id exposure (Phase 3).
// Session and profile are cached in React Query so every screen shares one
// source of truth. The root layout wires supabase.auth.onAuthStateChange to keep
// the session cache fresh; these hooks read from it and gate admin features.
import type { Session, User } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/types';

export type Profile = Tables<'profiles'>;

export const authKeys = {
  session: ['auth', 'session'] as const,
  profile: (userId: string | undefined) => ['auth', 'profile', userId] as const,
};

// Current Supabase session. Seeded by getSession() and kept current by the
// onAuthStateChange listener in the root layout (which writes this cache key).
export function useSession() {
  return useQuery({
    queryKey: authKeys.session,
    queryFn: async (): Promise<Session | null> => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    },
    staleTime: Infinity,
  });
}

// The signed-in user's profile row (role + store_id). Idle until a user exists.
export function useProfile() {
  const session = useSession();
  const userId = session.data?.user.id;
  return useQuery({
    queryKey: authKeys.profile(userId),
    enabled: !!userId,
    staleTime: Infinity,
    queryFn: async (): Promise<Profile> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId as string)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

// Combined auth view for screens and role gating.
export function useAuth() {
  const session = useSession();
  const profile = useProfile();
  const user: User | null = session.data?.user ?? null;
  const role = profile.data?.role ?? null;
  return {
    // Still resolving if the session is loading, or we have a user but their
    // profile (role/store) hasn't loaded yet.
    isLoading: session.isLoading || (!!user && profile.isLoading),
    isAuthenticated: !!user,
    user,
    role,
    isAdmin: role === 'admin',
    storeId: profile.data?.store_id ?? null,
    profile: profile.data ?? null,
  };
}

export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
