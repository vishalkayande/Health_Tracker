import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Card from '@/components/ui/card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { addExercise as dbAddExercise, getExercises, getTotalCaloriesBurned, getTotalCarbonSaved } from '@/database/database';

export default function ExerciseScreen() {
  const colorScheme = useColorScheme();
  const [activityName, setActivityName] = useState('');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCaloriesBurned, setTotalCaloriesBurned] = useState(0);
  const [totalCarbonSaved, setTotalCarbonSaved] = useState(0);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const exercisesData = await getExercises();
      const formattedExercises = (exercisesData as any[]).map((exercise: any) => ({
        id: exercise.id.toString(),
        name: exercise.name,
        duration: exercise.duration,
        distance: exercise.distance,
        calories: exercise.calories_burned,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        carbonSaved: exercise.carbon_saved
      }));
      setExercises(formattedExercises);
      
      const caloriesBurned = await getTotalCaloriesBurned();
      setTotalCaloriesBurned(caloriesBurned);
      
      const carbonSaved = await getTotalCarbonSaved();
      setTotalCarbonSaved(carbonSaved);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading exercises:', error);
      Alert.alert('Error', 'Failed to load exercise data');
      setLoading(false);
    }
  };

  const handleAddExercise = async () => {
    if (activityName.trim() === '' || duration.trim() === '') {
      Alert.alert('Error', 'Please enter both activity name and duration');
      return;
    }

    // Simple calculation for calories burned (very approximate)
    const durationNum = parseInt(duration);
    const distanceNum = distance ? parseFloat(distance) : 0;
    const caloriesBurned = Math.round(durationNum * 5); // Simple approximation
    
    // Simple calculation for carbon saved (if walking/cycling instead of driving)
    const carbonSaved = distanceNum > 0 ? parseFloat((distanceNum * 0.2).toFixed(1)) : 0;

    try {
      const exerciseId = await dbAddExercise(activityName, durationNum, distanceNum, caloriesBurned, carbonSaved);
      
      const newExercise = {
        id: exerciseId.toString(),
        name: activityName,
        duration: durationNum,
        distance: distanceNum,
        calories: caloriesBurned,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        carbonSaved: carbonSaved
      };

      setExercises([newExercise, ...exercises]);
      setTotalCaloriesBurned(totalCaloriesBurned + caloriesBurned);
      setTotalCarbonSaved(totalCarbonSaved + carbonSaved);
      setActivityName('');
      setDuration('');
      setDistance('');
    } catch (error) {
      console.error('Error adding exercise:', error);
      Alert.alert('Error', 'Failed to save exercise to database');
    }
  };

  // Calculate total duration (other totals are already tracked in state)
  const totalDuration = exercises.reduce((total, ex) => total + ex.duration, 0);

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Exercise Tracker</ThemedText>
        <ThemedText type="subtitle">Log your physical activities</ThemedText>
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { color: Colors[colorScheme ?? 'light'].text }]}
          placeholder="Activity (e.g., Walking, Running, Cycling)"
          placeholderTextColor={Colors[colorScheme ?? 'light'].text + '80'}
          value={activityName}
          onChangeText={setActivityName}
        />
        <TextInput
          style={[styles.input, { color: Colors[colorScheme ?? 'light'].text }]}
          placeholder="Duration (minutes)"
          placeholderTextColor={Colors[colorScheme ?? 'light'].text + '80'}
          keyboardType="numeric"
          value={duration}
          onChangeText={setDuration}
        />
        <TextInput
          style={[styles.input, { color: Colors[colorScheme ?? 'light'].text }]}
          placeholder="Distance (km) - optional"
          placeholderTextColor={Colors[colorScheme ?? 'light'].text + '80'}
          keyboardType="numeric"
          value={distance}
          onChangeText={setDistance}
        />
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]} 
          onPress={handleAddExercise}
        >
          <ThemedText style={styles.buttonText}>Add Exercise</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {loading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText>Loading exercise data...</ThemedText>
        </ThemedView>
      ) : (
        <>
          <Card style={styles.summaryCard}>
            <ThemedView style={styles.cardHeader}>
              <IconSymbol size={24} name="figure.walk" color={Colors[colorScheme ?? 'light'].tint} />
              <ThemedText type="subtitle">Today's Summary</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statsRow}>
              <ThemedView style={styles.statItem}>
                <ThemedText type="defaultSemiBold">{totalCaloriesBurned}</ThemedText>
                <ThemedText>Calories Burned</ThemedText>
              </ThemedView>
              <ThemedView style={styles.statItem}>
                <ThemedText type="defaultSemiBold">{totalDuration} min</ThemedText>
                <ThemedText>Active Time</ThemedText>
              </ThemedView>
              <ThemedView style={styles.statItem}>
                <ThemedText type="defaultSemiBold">{totalCarbonSaved.toFixed(1)} kg</ThemedText>
                <ThemedText>CO₂ Saved</ThemedText>
              </ThemedView>
            </ThemedView>
          </Card>

          <ThemedText type="subtitle" style={styles.sectionTitle}>Today's Activities</ThemedText>
          
          {exercises.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <ThemedText>No exercises logged today. Add your first activity!</ThemedText>
            </ThemedView>
          ) : (
            exercises.map((exercise) => (
        <ThemedView key={exercise.id} style={styles.exerciseCard}>
          <ThemedView style={styles.exerciseHeader}>
            <ThemedText type="defaultSemiBold">{exercise.name}</ThemedText>
            <ThemedText>{exercise.time}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.exerciseDetails}>
            <ThemedView style={styles.detailItem}>
              <IconSymbol size={16} name="clock" color={Colors[colorScheme ?? 'light'].tint} />
              <ThemedText style={styles.detailText}>{exercise.duration} min</ThemedText>
            </ThemedView>
            {exercise.distance > 0 && (
              <ThemedView style={styles.detailItem}>
                <IconSymbol size={16} name="map" color={Colors[colorScheme ?? 'light'].tint} />
                <ThemedText style={styles.detailText}>{exercise.distance} km</ThemedText>
              </ThemedView>
            )}
            <ThemedView style={styles.detailItem}>
              <IconSymbol size={16} name="flame.fill" color={Colors[colorScheme ?? 'light'].tint} />
              <ThemedText style={styles.detailText}>{exercise.calories} cal</ThemedText>
            </ThemedView>
            {exercise.carbonSaved > 0 && (
              <ThemedView style={styles.detailItem}>
                <IconSymbol size={16} name="leaf.fill" color={Colors[colorScheme ?? 'light'].tint} />
                <ThemedText style={styles.detailText}>{exercise.carbonSaved} kg CO₂</ThemedText>
              </ThemedView>
            )}
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
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  inputContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 15,
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
  },
  statItem: {
    alignItems: 'center',
  },
  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  exerciseCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  exerciseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  detailText: {
    marginLeft: 5,
  },
});