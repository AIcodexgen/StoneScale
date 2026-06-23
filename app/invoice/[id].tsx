import { StyleSheet, Text, View } from 'react-native';

// Placeholder screen — implemented in a later phase.
export default function InvoiceScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Invoice</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 16, opacity: 0.4 },
});
