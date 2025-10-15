import * as SQLite from 'expo-sqlite';
import SCHEMA from './schema';

const db = SQLite.openDatabase('healthtracker.db');

export const initDatabase = () => new Promise((resolve, reject) => {
  db.transaction(tx => {
    SCHEMA.forEach((sql, idx) => {
      tx.executeSql(sql, [], () => {
        if (idx === SCHEMA.length - 1) resolve();
      }, (_, err) => { reject(err); return false; });
    });
  }, reject);
});

export const addMeal = (name, calories) => new Promise((resolve, reject) => {
  const date = new Date().toISOString().split('T')[0];
  db.transaction(tx => tx.executeSql('INSERT INTO meals (name, calories, date) VALUES (?, ?, ?)', [name, calories, date], (_, r) => resolve(r.insertId), (_, e) => { reject(e); return false; }));
});

export const getMeals = (date = new Date().toISOString().split('T')[0]) => new Promise((resolve, reject) => {
  db.transaction(tx => tx.executeSql('SELECT * FROM meals WHERE date = ? ORDER BY id DESC', [date], (_, { rows }) => resolve(rows._array), (_, e) => { reject(e); return false; }));
});

export const getTotalCaloriesConsumed = (date = new Date().toISOString().split('T')[0]) => new Promise((resolve, reject) => {
  db.transaction(tx => tx.executeSql('SELECT SUM(calories) as total FROM meals WHERE date = ?', [date], (_, { rows }) => resolve(rows._array[0].total || 0), (_, e) => { reject(e); return false; }));
});

// Exercises
export const addExercise = (name, duration, distance, caloriesBurned, carbonSaved) => new Promise((resolve, reject) => {
  const date = new Date().toISOString().split('T')[0];
  db.transaction(tx => tx.executeSql('INSERT INTO exercises (name, duration, distance, calories_burned, carbon_saved, date) VALUES (?, ?, ?, ?, ?, ?)', [name, duration, distance, caloriesBurned, carbonSaved, date], (_, r) => resolve(r.insertId), (_, e) => { reject(e); return false; }));
});
export const getExercises = (date = new Date().toISOString().split('T')[0]) => new Promise((resolve, reject) => { db.transaction(tx => tx.executeSql('SELECT * FROM exercises WHERE date = ? ORDER BY id DESC', [date], (_, { rows }) => resolve(rows._array), (_, e) => { reject(e); return false; })); });
export const getTotalCaloriesBurned = (date = new Date().toISOString().split('T')[0]) => new Promise((resolve, reject) => { db.transaction(tx => tx.executeSql('SELECT SUM(calories_burned) as total FROM exercises WHERE date = ?', [date], (_, { rows }) => resolve(rows._array[0].total || 0), (_, e) => { reject(e); return false; })); });
export const getTotalCarbonSaved = (date = new Date().toISOString().split('T')[0]) => new Promise((resolve, reject) => { db.transaction(tx => tx.executeSql('SELECT SUM(carbon_saved) as total FROM exercises WHERE date = ?', [date], (_, { rows }) => resolve(rows._array[0].total || 0), (_, e) => { reject(e); return false; })); });

// Activities
export const addActivity = (name) => new Promise((resolve, reject) => { const date = new Date().toISOString().split('T')[0]; db.transaction(tx => tx.executeSql('INSERT INTO activities (name, completed, date) VALUES (?, ?, ?)', [name, 0, date], (_, r) => resolve(r.insertId), (_, e) => { reject(e); return false; })); });
export const getActivities = (date = new Date().toISOString().split('T')[0]) => new Promise((resolve, reject) => { db.transaction(tx => tx.executeSql('SELECT * FROM activities WHERE date = ? ORDER BY id DESC', [date], (_, { rows }) => resolve(rows._array), (_, e) => { reject(e); return false; })); });
export const toggleActivityCompletion = (id, completed) => new Promise((resolve, reject) => { db.transaction(tx => tx.executeSql('UPDATE activities SET completed = ? WHERE id = ?', [completed ? 1 : 0, id], (_, r) => resolve(r.rowsAffected > 0), (_, e) => { reject(e); return false; })); });
export const getCompletedActivitiesCount = (date = new Date().toISOString().split('T')[0]) => new Promise((resolve, reject) => { db.transaction(tx => tx.executeSql('SELECT COUNT(*) as count FROM activities WHERE date = ? AND completed = 1', [date], (_, { rows }) => resolve(rows._array[0].count || 0), (_, e) => { reject(e); return false; })); });
export const getTotalActivitiesCount = (date = new Date().toISOString().split('T')[0]) => new Promise((resolve, reject) => { db.transaction(tx => tx.executeSql('SELECT COUNT(*) as count FROM activities WHERE date = ?', [date], (_, { rows }) => resolve(rows._array[0].count || 0), (_, e) => { reject(e); return false; })); });

// --- User functions (native) ---
export const createUser = (username, password, displayName = '') => new Promise((resolve, reject) => {
  const created_at = new Date().toISOString();
  db.transaction(tx => {
    tx.executeSql('INSERT INTO users (username, password, display_name, created_at) VALUES (?, ?, ?, ?)', [username, password, displayName, created_at], (_, r) => resolve(r.insertId), (_, e) => { if(e && e.message && e.message.includes('UNIQUE constraint failed')) reject(new Error('username_taken')); else { reject(e); } return false; });
  }, reject);
});

export const authenticateUser = (username, password) => new Promise((resolve, reject) => {
  db.transaction(tx => {
    tx.executeSql('SELECT * FROM users WHERE username = ? AND password = ? LIMIT 1', [username, password], (_, { rows }) => {
      const found = rows._array && rows._array[0];
      if(found) resolve(found); else reject(new Error('invalid_credentials'));
    }, (_, e) => { reject(e); return false; });
  }, reject);
});

export default {
  initDatabase,
  addMeal,
  getMeals,
  getTotalCaloriesConsumed,
  addExercise,
  getExercises,
  getTotalCaloriesBurned,
  getTotalCarbonSaved,
  addActivity,
  getActivities,
  toggleActivityCompletion,
  getCompletedActivitiesCount,
  getTotalActivitiesCount,
  createUser,
  authenticateUser,
};
