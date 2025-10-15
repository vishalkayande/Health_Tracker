import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getMeals, getExercises, getTotalCaloriesConsumed, getTotalCaloriesBurned, getTotalCarbonSaved } from '@/database/database';

export default function InsightsScreen() {
  const colorScheme = useColorScheme();
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState({
    caloriesConsumed: [0, 0, 0, 0, 0, 0, 0],
    caloriesBurned: [0, 0, 0, 0, 0, 0, 0],
    steps: [0, 0, 0, 0, 0, 0, 0],
    carbonSaved: [0, 0, 0, 0, 0, 0, 0]
  });
  
  const [totalCaloriesConsumed, setTotalCaloriesConsumed] = useState(0);
  const [totalCaloriesBurned, setTotalCaloriesBurned] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [totalCarbonSaved, setTotalCarbonSaved] = useState(0);
  
  useEffect(() => {
    loadInsightsData();
  }, []);
  
  const loadInsightsData = async () => {
    try {
      setLoading(true);
      
      // Get today's date and calculate dates for the past week
      const today = new Date();
      const pastWeekDates = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        pastWeekDates.push(date.toISOString().split('T')[0]);
      }
      
      // Initialize arrays for weekly data
      const caloriesConsumedWeek = [];
      const caloriesBurnedWeek = [];
      const stepsWeek = [8500, 9200, 7800, 12000, 8900, 10500, 11200]; // Mock steps data
      const carbonSavedWeek = [];
      
      // Fetch data for each day of the week
      for (const date of pastWeekDates) {
        // Get calories consumed for the day
        const caloriesConsumed = await getTotalCaloriesConsumed(date);
        caloriesConsumedWeek.push(caloriesConsumed || 0);
        
        // Get calories burned for the day
        const caloriesBurned = await getTotalCaloriesBurned(date);
        caloriesBurnedWeek.push(caloriesBurned || 0);
        
        // Get carbon saved for the day
        const carbonSaved = await getTotalCarbonSaved(date);
        carbonSavedWeek.push(carbonSaved || 0);
      }
      
      // Update weekly data state
      setWeeklyData({
        caloriesConsumed: caloriesConsumedWeek,
        caloriesBurned: caloriesBurnedWeek,
        steps: stepsWeek,
        carbonSaved: carbonSavedWeek
      });
      
      // Calculate totals
      const totalCalories = caloriesConsumedWeek.reduce((sum, val) => sum + val, 0);
      const totalBurned = caloriesBurnedWeek.reduce((sum, val) => sum + val, 0);
      const totalStepsCount = stepsWeek.reduce((sum, val) => sum + val, 0);
      const totalCarbon = carbonSavedWeek.reduce((sum, val) => sum + val, 0);
      
      setTotalCaloriesConsumed(totalCalories);
      setTotalCaloriesBurned(totalBurned);
      setTotalSteps(totalStepsCount);
      setTotalCarbonSaved(totalCarbon);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading insights data:', error);
      setLoading(false);
    }
  };
  
  // Calculate averages
  const avgCaloriesConsumed = Math.round(totalCaloriesConsumed / 7);
  const avgCaloriesBurned = Math.round(totalCaloriesBurned / 7);
  const avgSteps = Math.round(totalSteps / 7);
  
  // Environmental impact equivalents
  const treesEquivalent = (totalCarbonSaved / 21).toFixed(2); // Approximate CO2 absorption by one tree per year divided by 52 weeks
  const carMilesAvoided = Math.round(totalCarbonSaved * 4); // Approximate miles of driving avoided

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText style={styles.loadingText}>Loading insights data...</ThemedText>
        </ThemedView>
      ) : (
        <>
          <ThemedView style={styles.header}>
            <ThemedText type="title">Health Insights</ThemedText>
            <ThemedText type="subtitle">Your weekly progress and impact</ThemedText>
          </ThemedView>

          {/* Weekly Summary Card */}
          <ThemedView style={styles.card}>
            <ThemedView style={styles.cardHeader}>
              <IconSymbol size={24} name="chart.bar" color={Colors[colorScheme ?? 'light'].tint} />
              <ThemedText type="subtitle">Weekly Summary</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statsGrid}>
              <ThemedView style={styles.statItem}>
                <ThemedText type="defaultSemiBold">{totalCaloriesConsumed}</ThemedText>
                <ThemedText>Calories Consumed</ThemedText>
              </ThemedView>
              <ThemedView style={styles.statItem}>
                <ThemedText type="defaultSemiBold">{totalCaloriesBurned}</ThemedText>
                <ThemedText>Calories Burned</ThemedText>
              </ThemedView>
              <ThemedView style={styles.statItem}>
                <ThemedText type="defaultSemiBold">{totalSteps}</ThemedText>
                <ThemedText>Total Steps</ThemedText>
              </ThemedView>
              <ThemedView style={styles.statItem}>
                <ThemedText type="defaultSemiBold">{totalCarbonSaved.toFixed(1)} kg</ThemedText>
                <ThemedText>CO₂ Saved</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* Daily Averages Card */}
          <ThemedView style={styles.card}>
            <ThemedView style={styles.cardHeader}>
              <IconSymbol size={24} name="calendar" color={Colors[colorScheme ?? 'light'].tint} />
              <ThemedText type="subtitle">Daily Averages</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statsRow}>
              <ThemedView style={styles.statItem}>
                <ThemedText type="defaultSemiBold">{avgCaloriesConsumed}</ThemedText>
                <ThemedText>Avg. Calories</ThemedText>
              </ThemedView>
              <ThemedView style={styles.statItem}>
                <ThemedText type="defaultSemiBold">{avgCaloriesBurned}</ThemedText>
                <ThemedText>Avg. Burned</ThemedText>
              </ThemedView>
              <ThemedView style={styles.statItem}>
                <ThemedText type="defaultSemiBold">{avgSteps}</ThemedText>
                <ThemedText>Avg. Steps</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* Environmental Impact Card */}
          <ThemedView style={styles.card}>
            <ThemedView style={styles.cardHeader}>
              <IconSymbol size={24} name="leaf.fill" color={Colors[colorScheme ?? 'light'].tint} />
              <ThemedText type="subtitle">Environmental Impact</ThemedText>
            </ThemedView>
            <ThemedText style={styles.impactText}>
              Your sustainable choices this week have made a difference!
            </ThemedText>
            
            <ThemedView style={styles.impactContainer}>
              <ThemedView style={styles.impactItem}>
                <IconSymbol size={32} name="car.fill" color={Colors[colorScheme ?? 'light'].tint} />
                <ThemedText type="defaultSemiBold">{carMilesAvoided} miles</ThemedText>
                <ThemedText>Car Travel Avoided</ThemedText>
              </ThemedView>
              
              <ThemedView style={styles.impactItem}>
                <IconSymbol size={32} name="tree.fill" color={Colors[colorScheme ?? 'light'].tint} />
                <ThemedText type="defaultSemiBold">{treesEquivalent} trees</ThemedText>
                <ThemedText>Weekly Absorption</ThemedText>
              </ThemedView>
            </ThemedView>
            
            <ThemedText style={styles.impactFootnote}>
              By choosing walking and cycling over driving, you've reduced your carbon footprint and contributed to a healthier planet.
            </ThemedText>
          </ThemedView>

          {/* Health Benefits Card */}
          <ThemedView style={styles.card}>
            <ThemedView style={styles.cardHeader}>
              <IconSymbol size={24} name="heart.fill" color={Colors[colorScheme ?? 'light'].tint} />
              <ThemedText type="subtitle">Health Benefits</ThemedText>
            </ThemedView>
            <ThemedView style={styles.benefitsList}>
              <ThemedView style={styles.benefitItem}>
                <IconSymbol size={18} name="checkmark.circle.fill" color={Colors[colorScheme ?? 'light'].tint} />
                <ThemedText style={styles.benefitText}>Burned {totalCaloriesBurned} calories through exercise</ThemedText>
              </ThemedView>
              <ThemedView style={styles.benefitItem}>
                <IconSymbol size={18} name="checkmark.circle.fill" color={Colors[colorScheme ?? 'light'].tint} />
                <ThemedText style={styles.benefitText}>Walked {(totalSteps / 1300).toFixed(1)} miles this week</ThemedText>
              </ThemedView>
              <ThemedView style={styles.benefitItem}>
                <IconSymbol size={18} name="checkmark.circle.fill" color={Colors[colorScheme ?? 'light'].tint} />
                <ThemedText style={styles.benefitText}>Maintained a balanced diet with an average of {avgCaloriesConsumed} calories per day</ThemedText>
              </ThemedView>
              <ThemedView style={styles.benefitItem}>
                <IconSymbol size={18} name="checkmark.circle.fill" color={Colors[colorScheme ?? 'light'].tint} />
                <ThemedText style={styles.benefitText}>Reduced stress through regular physical activity</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 300,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    width: '45%',
    marginBottom: 15,
  },
  impactText: {
    textAlign: 'center',
    marginBottom: 15,
  },
  impactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  impactItem: {
    alignItems: 'center',
  },
  impactFootnote: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
    fontSize: 14,
  },
  benefitsList: {
    marginTop: 5,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitText: {
    marginLeft: 10,
    flex: 1,
  },
});