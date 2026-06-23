import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';

// One client for the whole app's server state. Created at module scope so it
// is not re-instantiated on every render.
const queryClient = new QueryClient();

// Root navigator. Auth gating is added in a later phase. For now it hosts the
// route groups and provides React Query.
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}
