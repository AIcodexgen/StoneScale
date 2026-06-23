import { Stack } from 'expo-router';

// Root navigator. Auth gating and providers (React Query, etc.) are added in
// later phases. For now it simply hosts the route groups.
export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="add-item" options={{ presentation: 'modal' }} />
      <Stack.Screen name="invoice/[id]" />
    </Stack>
  );
}
