import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Card from '@/components/ui/card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { addMeal, getMeals, getTotalCaloriesConsumed, initDatabase } from '@/database/database';

export default function DietScreen() {
  const colorScheme = useColorScheme();
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [meals, setMeals] = useState<any[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDatabase();
        await loadMeals();
      } catch (error) {
        console.error('Database initialization error:', error);
        Alert.alert('Database Error', 'Failed to initialize the database');
      } finally {
        setLoading(false);
      }
    };

    setupDatabase();
  }, []);

  const loadMeals = async () => {
    try {
      const mealsData = await getMeals();
      const formattedMeals = (mealsData as any[]).map((meal: any) => ({
        id: meal.id.toString(),
        name: meal.name,
        calories: meal.calories,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
      setMeals(formattedMeals);
      
      const total = await getTotalCaloriesConsumed();
      setTotalCalories(total);
    } catch (error) {
      console.error('Error loading meals:', error);
      Alert.alert('Error', 'Failed to load meals data');
    }
  };

  const handleAddMeal = async () => {
    if (mealName.trim() === '' || calories.trim() === '') {
      Alert.alert('Error', 'Please enter both meal name and calories');
      return;
    }

    try {
      const caloriesValue = parseInt(calories);
      const mealId = await addMeal(mealName, caloriesValue);
      
      const newMeal = {
        id: mealId.toString(),
        name: mealName,
        calories: caloriesValue,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMeals([newMeal, ...meals]);
      setTotalCalories(totalCalories + caloriesValue);
      setMealName('');
      setCalories('');
    } catch (error) {
      console.error('Error adding meal:', error);
      Alert.alert('Error', 'Failed to save meal to database');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Diet Tracker</ThemedText>
        <ThemedText type="subtitle">Log your meals in simple English</ThemedText>
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { color: Colors[colorScheme ?? 'light'].text }]}
          placeholder="What did you eat? (e.g., Oatmeal with fruits)"
          placeholderTextColor={Colors[colorScheme ?? 'light'].text + '80'}
          value={mealName}
          onChangeText={setMealName}
        />
        <TextInput
          style={[styles.input, { color: Colors[colorScheme ?? 'light'].text }]}
          placeholder="Calories"
          placeholderTextColor={Colors[colorScheme ?? 'light'].text + '80'}
          keyboardType="numeric"
          value={calories}
          onChangeText={setCalories}
        />
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]} 
          onPress={handleAddMeal}
        >
          <ThemedText style={styles.buttonText}>Add Meal</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {loading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText>Loading meals data...</ThemedText>
        </ThemedView>
      ) : (
        <>
          <Card style={styles.summaryCard}>
            <ThemedView style={styles.cardHeader}>
              <IconSymbol size={24} name="flame.fill" color={Colors[colorScheme ?? 'light'].tint} />
              <ThemedText type="subtitle">Today's Summary</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statsRow}>
              <ThemedView style={styles.statItem}>
                <ThemedText type="defaultSemiBold">
                  {totalCalories}
                </ThemedText>
                <ThemedText>Calories Consumed</ThemedText>
              </ThemedView>
              <ThemedView style={styles.statItem}>
                <ThemedText type="defaultSemiBold">2000</ThemedText>
                <ThemedText>Daily Goal</ThemedText>
              </ThemedView>
            </ThemedView>
          </Card>

          <ThemedText type="subtitle" style={styles.sectionTitle}>Today's Meals</ThemedText>
          
          {meals.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <ThemedText>No meals logged today. Add your first meal!</ThemedText>
            </ThemedView>
          ) : (
            meals.map((meal) => (
        <ThemedView key={meal.id} style={styles.mealCard}>
          <ThemedView style={styles.mealHeader}>
            <ThemedText type="defaultSemiBold">{meal.name}</ThemedText>
            <ThemedText>{meal.time}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.mealDetails}>
            <IconSymbol size={16} name="flame.fill" color={Colors[colorScheme ?? 'light'].tint} />
            <ThemedText style={styles.caloriesText}>{meal.calories} calories</ThemedText>
          </ThemedView>
        </ThemedView>
      )))}
      </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  addButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginBottom: 12,
    minHeight: 100,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  sectionTitle: {
    marginBottom: 12,
  },
  mealCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mealDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  caloriesText: {
    marginLeft: 4,
  },
});