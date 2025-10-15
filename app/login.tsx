import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Button, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { authenticateUser } from '@/database/database';
import storage from '@/lib/storage';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const user = await authenticateUser(username.trim(), password);
      await storage.setItem('ht.currentUser', user);
      // Navigate into the app
      router.replace('/(tabs)');
    } catch (e) {
      const err: any = e;
      Alert.alert('Login failed', err.message || 'Invalid credentials');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Login</ThemedText>
      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Login" onPress={handleLogin} />
      <View style={{ height: 12 }} />
      <Button title="Create account" onPress={() => router.push('/signup' as any)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 8, borderRadius: 8 },
});

