import { Platform } from 'react-native';

const impl = Platform.OS === 'web' ? require('./web-db') : require('./native-db');

export const initDatabase = impl.initDatabase;
export const addMeal = impl.addMeal;
export const getMeals = impl.getMeals;
export const getTotalCaloriesConsumed = impl.getTotalCaloriesConsumed;
export const addExercise = impl.addExercise;
export const getExercises = impl.getExercises;
export const getTotalCaloriesBurned = impl.getTotalCaloriesBurned;
export const getTotalCarbonSaved = impl.getTotalCarbonSaved;
export const addActivity = impl.addActivity;
export const getActivities = impl.getActivities;
export const toggleActivityCompletion = impl.toggleActivityCompletion;
export const getCompletedActivitiesCount = impl.getCompletedActivitiesCount;
export const getTotalActivitiesCount = impl.getTotalActivitiesCount;
export const createUser = impl.createUser;
export const authenticateUser = impl.authenticateUser;

export default impl;