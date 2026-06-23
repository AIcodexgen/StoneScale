import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { supabase } from '@/lib/supabase';
import { authKeys, useAuth } from '@/queries/store';

// One client for the whole app's server state. Created at module scope so it
// is not re-instantiated on every render.
const queryClient = new QueryClient();

// Push the live Supabase session into the React Query cache so every screen
// reacts to login/logout/token-refresh through one source of truth.
function useAuthListener() {
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      queryClient.setQueryData(authKeys.session, data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      queryClient.setQueryData(authKeys.session, session);
      // Drop any cached profile when the user changes (incl. sign-out).
      queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
    });

    return () => subscription.unsubscribe();
  }, []);
}

// Redirect unauthenticated users to the login screen, and signed-in users away
// from it. Waits until auth has resolved so we don't bounce on first paint.
function useProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, segments, router]);
}

function RootNavigator() {
  useAuthListener();
  useProtectedRoute();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="add-item" options={{ presentation: 'modal' }} />
      <Stack.Screen name="invoice/[id]" />
      {/* TEMPORARY (Phase 2) — debug screen, remove in a later phase. */}
      <Stack.Screen
        name="debug-products"
        options={{ headerShown: true, title: 'Debug: Products' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
    </QueryClientProvider>
  );
}
