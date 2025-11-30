import { Link, router } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Settings</ThemedText>
      <ThemedText style={styles.description}>
        Configure your Mirrorx app settings here.
      </ThemedText>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.back()}
      >
        <ThemedText type="defaultSemiBold" style={styles.buttonText}>
          Close
        </ThemedText>
      </TouchableOpacity>
      
      <Link href="/(tabs)" asChild>
        <TouchableOpacity style={styles.button}>
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>
            Go to Camera
          </ThemedText>
        </TouchableOpacity>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  description: {
    marginTop: 10,
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.7,
  },
  button: {
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#0a7ea4',
    minWidth: 150,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
  },
});
