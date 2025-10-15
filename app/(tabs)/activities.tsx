import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Card from '@/components/ui/card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { addActivity, getActivities, toggleActivityCompletion, getCompletedActivitiesCount, getTotalActivitiesCount } from '@/database/database';

export default function ActivitiesScreen() {
  const colorScheme = useColorScheme();
  const [activityName, setActivityName] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedActivities, setCompletedActivities] = useState(0);
  const [totalActivities, setTotalActivities] = useState(0);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const activitiesData = await getActivities();
      const formattedActivities = (activitiesData as any[]).map((activity: any) => ({
        id: activity.id.toString(),
        name: activity.name,
        completed: activity.completed === 1,
        time: activity.completed === 1 ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        impact: getImpactForActivity(activity.name)
      }));
      setActivities(formattedActivities);
      
      const completed = await getCompletedActivitiesCount();
      setCompletedActivities(completed);
      
      const total = await getTotalActivitiesCount();
      setTotalActivities(total);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading activities:', error);
      Alert.alert('Error', 'Failed to load activities data');
      setLoading(false);
    }
  };

  const getImpactForActivity = (name: string) => {
    // Simple logic to assign impact based on activity name
    if (name.toLowerCase().includes('walk') || name.toLowerCase().includes('bike')) {
      return 'Reduced carbon emissions';
    } else if (name.toLowerCase().includes('reusable') || name.toLowerCase().includes('recycle')) {
      return 'Reduced waste';
    } else if (name.toLowerCase().includes('stair')) {
      return 'Reduced energy usage';
    } else {
      return 'Contributes to well-being';
    }
  };

  const handleAddActivity = async () => {
    if (activityName.trim() === '') {
      Alert.alert('Error', 'Please enter an activity');
      return;
    }

    try {
      const activityId = await addActivity(activityName);
      
      const newActivity = {
        id: activityId.toString(),
        name: activityName,
        completed: false,
        time: '',
        impact: getImpactForActivity(activityName)
      };

      setActivities([newActivity, ...activities]);
      setTotalActivities(totalActivities + 1);
      setActivityName('');
    } catch (error) {
      console.error('Error adding activity:', error);
      Alert.alert('Error', 'Failed to save activity to database');
    }
  };

  const handleToggleActivity = async (id: any, currentCompleted: boolean) => {
    try {
      const newCompletedState = !currentCompleted;
      await toggleActivityCompletion(id, newCompletedState);
      
      setActivities(activities.map(activity => {
        if (activity.id === id) {
          return {
            ...activity,
            completed: newCompletedState,
            time: newCompletedState ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
          };
        }
        return activity;
      }));
      
      setCompletedActivities(newCompletedState ? completedActivities + 1 : completedActivities - 1);
    } catch (error) {
      console.error('Error toggling activity:', error);
      Alert.alert('Error', 'Failed to update activity status');
    }
  };

  // Calculate completion percentage
  const completionPercentage = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Daily Activities</ThemedText>
        <ThemedText type="subtitle">Track your routine activities</ThemedText>
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { color: Colors[colorScheme ?? 'light'].text }]}
          placeholder="Add a new activity"
          placeholderTextColor={Colors[colorScheme ?? 'light'].text + '80'}
          value={activityName}
          onChangeText={setActivityName}
        />
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]} 
          onPress={handleAddActivity}
        >
          <ThemedText style={styles.buttonText}>Add Activity</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {loading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText>Loading activity data...</ThemedText>
        </ThemedView>
      ) : (
        <>
          <Card style={styles.summaryCard}>
            <ThemedView style={styles.cardHeader}>
              <IconSymbol size={24} name="leaf.fill" color={Colors[colorScheme ?? 'light'].tint} />
              <ThemedText type="subtitle">Today's Progress</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statsRow}>
              <ThemedView style={styles.statItem}>
                <ThemedText type="defaultSemiBold">{completedActivities}/{totalActivities}</ThemedText>
                <ThemedText>Activities Completed</ThemedText>
              </ThemedView>
              <ThemedView style={styles.statItem}>
                <ThemedText type="defaultSemiBold">{totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0}%</ThemedText>
                <ThemedText>Completion Rate</ThemedText>
              </ThemedView>
            </ThemedView>
          </Card>

          <ThemedText type="subtitle" style={styles.sectionTitle}>Today's Activities</ThemedText>
          
          {activities.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <ThemedText>No activities logged today. Add your first activity!</ThemedText>
            </ThemedView>
          ) : (
            activities.map((activity) => (
              <TouchableOpacity key={activity.id} onPress={() => handleToggleActivity(activity.id, activity.completed)}>
                <ThemedView style={styles.activityCard}>
                  <ThemedView style={styles.activityHeader}>
                    <ThemedView style={styles.checkboxContainer}>
                      <ThemedView
                        style={[
                          styles.checkbox,
                          activity.completed && { backgroundColor: Colors[colorScheme ?? 'light'].tint }
                        ]}
                      >
                        {activity.completed && (
                          <IconSymbol size={16} name="checkmark" color="white" />
                        )}
                      </ThemedView>
                      <ThemedText
                        type={activity.completed ? "defaultSemiBold" : "default"}
                        style={[
                          styles.activityName,
                          activity.completed && styles.completedText
                        ]}
                      >
                        {activity.name}
                      </ThemedText>
                    </ThemedView>
                    {activity.completed && <ThemedText>{activity.time}</ThemedText>}
                  </ThemedView>
                  <ThemedText style={styles.impactText}>
                    <IconSymbol size={14} name="leaf.fill" color={Colors[colorScheme ?? 'light'].tint} />
                    {' ' + activity.impact}
                  </ThemedText>
                </ThemedView>
              </TouchableOpacity>
            ))
          )}
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
  activityCard: {
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
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  activityName: {
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  impactText: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.8,
  },
});