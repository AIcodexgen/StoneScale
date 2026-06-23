// TEMPORARY debug screen (Phase 2).
// Proves the Supabase client + typed product queries work end to end against
// the RLS-protected `products` table. Since Phase 3 added global auth gating,
// reaching this screen already means we're signed in, so RLS returns the
// store's rows without a separate sign-in here.
//
// REMOVE IN A LATER PHASE: delete this file, its <Stack.Screen
// name="debug-products" /> entry in app/_layout.tsx, and the link to it on the
// New Invoice tab.
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useActiveProducts } from '@/queries/products';

export default function DebugProductsScreen() {
  const products = useActiveProducts();

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
