// TEMPORARY debug screen (Phase 2).
// Proves the Supabase client + typed product queries work end to end against
// the RLS-protected `products` table. It signs in with the store owner account
// (entered at runtime, nothing stored) so RLS returns the store's rows.
//
// REMOVE IN A LATER PHASE: delete this file, its <Stack.Screen
// name="debug-products" /> entry in app/_layout.tsx, and the link to it on the
// New Invoice tab.
import { useState } from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { supabase } from '@/lib/supabase';
import { useActiveProducts } from '@/queries/products';

export default function DebugProductsScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const products = useActiveProducts();

  async function signIn() {
    setBusy(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) {
      setAuthError(error.message);
      return;
    }
    setSignedIn(true);
    void products.refetch();
  }

  if (!signedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Sign in (temporary)</Text>
        <Text style={styles.note}>
          Use the store owner account so RLS returns the store&apos;s products.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Button
          title={busy ? 'Signing in…' : 'Sign in'}
          onPress={signIn}
          disabled={busy || !email || !password}
        />
        {authError ? <Text style={styles.error}>{authError}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Products from Supabase</Text>
      {products.isLoading ? <ActivityIndicator style={styles.spinner} /> : null}
      {products.error ? (
        <Text style={styles.error}>{(products.error as Error).message}</Text>
      ) : null}
      <FlatList
        data={products.data ?? []}
        keyExtractor={(p) => p.id}
        ListEmptyComponent={
          products.isLoading ? null : (
            <Text style={styles.note}>No active products found.</Text>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>Rs {item.price_per_sqft} / sq ft</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  title: { fontSize: 20, fontWeight: '600' },
  note: { fontSize: 14, opacity: 0.6 },
  spinner: { marginVertical: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  name: { fontSize: 16 },
  price: { fontSize: 16, opacity: 0.7 },
  error: { color: '#c00', fontSize: 14 },
});
