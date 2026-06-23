import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import { signOut, useAuth } from '@/queries/store';

// Phase 3: shows who is signed in (with role) and offers logout. The admin
// product-management UI is built in Phase 4.
export default function SettingsScreen() {
  const { user, role, isLoading } = useAuth();
  const [busy, setBusy] = useState(false);

  async function onLogout() {
    setBusy(true);
    try {
      await signOut();
      // The root layout redirects to the login screen once the session clears.
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Signed in as</Text>
        <Text style={styles.value}>{user?.email ?? '—'}</Text>
        <Text style={styles.label}>Role</Text>
        <Text style={styles.value}>{isLoading ? '…' : (role ?? '—')}</Text>
      </View>
      <Button
        title={busy ? 'Logging out…' : 'Log out'}
        onPress={onLogout}
        disabled={busy}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 20 },
  title: { fontSize: 24, fontWeight: '600' },
  card: { gap: 4 },
  label: { fontSize: 13, opacity: 0.5, marginTop: 8 },
  value: { fontSize: 16 },
});
