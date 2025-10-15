import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { createUser } from '@/database/database';
import storage from '@/lib/storage';
import { useRouter } from 'expo-router';

export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const router = useRouter();

  const handleSignup = async () => {
    try {
      const id = await createUser(username.trim(), password, displayName);
      const user = { id, username: username.trim(), display_name: displayName };
      await storage.setItem('ht.currentUser', user);
      router.replace('/(tabs)');
    } catch (err) {
      const e: any = err;
      Alert.alert('Signup failed', e.message || 'Unable to create account');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Create account</ThemedText>
      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Display name" value={displayName} onChangeText={setDisplayName} />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Sign up" onPress={handleSignup} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 8, borderRadius: 8 },
});

