import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Card from '@/components/ui/card';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFocusEffect } from '@react-navigation/native';
import {
  getTotalCaloriesConsumed,
  getTotalCaloriesBurned,
  getTotalCarbonSaved,
  getCompletedActivitiesCount,
  getTotalActivitiesCount,
} from '@/database/database';
import storage from '@/lib/storage';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [consumed, setConsumed] = useState(0);
  const [burned, setBurned] = useState(0);
  const [goal] = useState(2000);
  const [stepsCurrent] = useState(6540);
  const [stepsGoal] = useState(10000);
  const [, setCompletedActivities] = useState(0);
  const [, setTotalActivities] = useState(0);
  const [carbonSaved, setCarbonSaved] = useState(0);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await storage.removeItem('ht.currentUser');
            router.replace('/login');
          },
        },
      ]
    );
  };

  const loadStats = useCallback(async () => {
    try {
      const c = await getTotalCaloriesConsumed();
      const b = await getTotalCaloriesBurned();
      const carb = await getTotalCarbonSaved();
      const completed = await getCompletedActivitiesCount();
      const total = await getTotalActivitiesCount();

      setConsumed(Number(c) || 0);
      setBurned(Number(b) || 0);
      setCarbonSaved(Number(carb) || 0);
      setCompletedActivities(Number(completed) || 0);
      setTotalActivities(Number(total) || 0);
    } catch (error) {
      console.error('Dashboard: failed to load stats', error);
    }
  }, []);

  // Load on focus and on mount
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={<HeaderLogo colorScheme={colorScheme} />}>
      <ThemedView style={styles.titleContainer}>
        <ThemedView style={styles.titleRow}>
          <ThemedView style={styles.titleTextContainer}>
            <ThemedText type="title">Health Dashboard</ThemedText>
            <ThemedText type="subtitle">Today's Overview</ThemedText>
          </ThemedView>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={24} color={Colors[colorScheme ?? 'light'].tint} />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
      
      {/* Calories Card */}
      <Card style={styles.card}>
        <ThemedView style={styles.cardHeader}>
          <IconSymbol size={24} name="flame.fill" color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText type="subtitle">Calories</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statsRow}>
          <ThemedView style={styles.statItem}>
            <ThemedText type="defaultSemiBold">{consumed}</ThemedText>
            <ThemedText>Consumed</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText type="defaultSemiBold">{burned}</ThemedText>
            <ThemedText>Burned</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText type="defaultSemiBold">{goal}</ThemedText>
            <ThemedText>Goal</ThemedText>
          </ThemedView>
        </ThemedView>
      </Card>
      
      {/* Steps Card */}
      <Card style={styles.card}>
        <ThemedView style={styles.cardHeader}>
          <IconSymbol size={24} name="figure.walk" color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText type="subtitle">Steps</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statsRow}>
          <ThemedView style={styles.statItem}>
            <ThemedText type="defaultSemiBold">{stepsCurrent}</ThemedText>
            <ThemedText>Steps Today</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText type="defaultSemiBold">{stepsGoal}</ThemedText>
            <ThemedText>Daily Goal</ThemedText>
          </ThemedView>
        </ThemedView>
      </Card>
      
      {/* Environmental Impact Card */}
      <Card style={styles.card}>
        <ThemedView style={styles.cardHeader}>
          <IconSymbol size={24} name="leaf.fill" color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText type="subtitle">Environmental Impact</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statsRow}>
          <ThemedView style={styles.statItem}>
            <ThemedText type="defaultSemiBold">{carbonSaved} kg</ThemedText>
            <ThemedText>CO₂ Saved</ThemedText>
          </ThemedView>
        </ThemedView>
        <ThemedText style={styles.impactText}>
          By walking instead of driving, you&apos;ve reduced your carbon footprint!
        </ThemedText>
      </Card>
    </ParallaxScrollView>
  );
}

import type { ColorSchemeName } from 'react-native';

function HeaderLogo({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <View style={[styles.headerLogoContainer, { backgroundColor: colorScheme === 'dark' ? '#123' : '#E6F6FA' }]}>
      <View style={styles.logoBadge}>
        <IconSymbol name="leaf.fill" size={48} color="#fff" />
      </View>
      <View style={styles.logoTextContainer}>
        <ThemedText type="title" style={styles.logoTitle}>HealthTracker</ThemedText>
        <ThemedText style={styles.logoSubtitle}>Track meals, exercise &amp; impact</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Header / logo
  reactLogo: {
    // prefer larger absolute logo for parallax header
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
    alignSelf: 'center',
  },

  // Title
  titleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleTextContainer: {
    alignItems: 'center',
    flex: 1,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },

  // Cards
  card: {
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  impactText: {
    marginTop: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Additional small layout helpers
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  headerLogoContainer: {
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#0b78a6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    elevation: 6,
  },
  logoTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  logoTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  logoSubtitle: {
    fontSize: 14,
    opacity: 0.9,
  },
});
