import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React, { useEffect, useState } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { initDatabase } from '../database/database';
import storage from '@/lib/storage';

export const unstable_settings = {
	anchor: '(tabs)',
};

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const router = useRouter();
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const initAndCheck = async () => {
			try {
				// Initialize database
				await initDatabase();

				// Check for existing user session
				const currentUser = await storage.getItem('ht.currentUser');
				if (currentUser) {
					// User is logged in, stay on app
					router.replace('/(tabs)');
				} else {
					// No user session, go to login
					router.replace('/login');
				}
			} catch (error) {
				console.error('App initialization error:', error);
				router.replace('/login');
			} finally {
				setReady(true);
			}
		};

		initAndCheck();
	}, [router]);

	if (!ready) {
		return null; // or a loading screen
	}

	return (
		<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
			<Stack screenOptions={{ headerShown: false }}>
				<Slot />
			</Stack>
			<StatusBar style="auto" />
		</ThemeProvider>
	);
}
