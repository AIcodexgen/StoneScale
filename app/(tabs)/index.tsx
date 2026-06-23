import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

// Placeholder screen — implemented in a later phase.
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>New Invoice</Text>
      {/* TEMPORARY (Phase 2) — link to the debug screen, remove in a later phase. */}
      <Link href="/debug-products" style={styles.debugLink}>
        Open debug: products
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  text: { fontSize: 16, opacity: 0.4 },
  debugLink: { fontSize: 14, color: '#06c' },
});
