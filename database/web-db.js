// Minimal web fallback using localStorage to persist simple tables: meals, exercises, activities
const storagePrefix = 'ht.';
const tables = ['meals','exercises','activities'];
const today = () => new Date().toISOString().split('T')[0];
function key(table){ return storagePrefix + table; }
function read(table){ try { const raw = localStorage.getItem(key(table)); return raw ? JSON.parse(raw) : []; } catch(e){ return []; } }
function write(table, arr){ try { localStorage.setItem(key(table), JSON.stringify(arr)); } catch(e){} }
function nextId(table){ const arr = read(table); return arr.length ? Math.max(...arr.map(r=>r.id))+1 : 1; }


export const initDatabase = async () => {
  tables.forEach(t => { if (localStorage.getItem(key(t)) === null) write(t, []); });
  if (localStorage.getItem(key('users')) === null) writeUsers([]);
  return Promise.resolve();
};

export const addMeal = (name, calories) => new Promise(res => {
  const date = today(); const id = nextId('meals');
  const arr = read('meals'); arr.unshift({ id, name, calories, date }); write('meals', arr); res(id);
});

export const getMeals = (date = today()) => new Promise(res => { const arr = read('meals'); res(arr.filter(m=>m.date===date)); });
export const getTotalCaloriesConsumed = (date = today()) => new Promise(res => { const arr = read('meals'); res(arr.filter(m=>m.date===date).reduce((s,r)=>s+(r.calories||0),0)); });

export const addExercise = (name, duration, distance, caloriesBurned, carbonSaved) => new Promise(res => {
  const date = today(); const id = nextId('exercises'); const arr = read('exercises');
  arr.unshift({ id, name, duration, distance, calories_burned: caloriesBurned, carbon_saved: carbonSaved, date }); write('exercises', arr); res(id);
});
export const getExercises = (date = today()) => new Promise(res => { const arr = read('exercises'); res(arr.filter(e=>e.date===date)); });
export const getTotalCaloriesBurned = (date = today()) => new Promise(res => { const arr = read('exercises'); res(arr.filter(e=>e.date===date).reduce((s,r)=>s+(r.calories_burned||0),0)); });
export const getTotalCarbonSaved = (date = today()) => new Promise(res => { const arr = read('exercises'); res(arr.filter(e=>e.date===date).reduce((s,r)=>s+(r.carbon_saved||0),0)); });

export const addActivity = (name) => new Promise(res => { const date = today(); const id = nextId('activities'); const arr = read('activities'); arr.unshift({ id, name, completed: 0, date }); write('activities', arr); res(id); });
export const getActivities = (date = today()) => new Promise(res => { const arr = read('activities'); res(arr.filter(a=>a.date===date)); });
export const toggleActivityCompletion = (id, completed) => new Promise(res => { const arr = read('activities'); const idx = arr.findIndex(a=>a.id===Number(id)||a.id===id); if(idx>=0){ arr[idx].completed = completed?1:0; write('activities', arr); res(true);} else res(false); });
export const getCompletedActivitiesCount = (date = today()) => new Promise(res => { const arr = read('activities'); res(arr.filter(a=>a.date===date && a.completed===1).length); });
export const getTotalActivitiesCount = (date = today()) => new Promise(res => { const arr = read('activities'); res(arr.filter(a=>a.date===date).length); });

// Users storage uses key 'ht.users'
function readUsers(){ try { const raw = localStorage.getItem(key('users')); return raw ? JSON.parse(raw) : []; } catch(e){ return []; } }
function writeUsers(arr){ try { localStorage.setItem(key('users'), JSON.stringify(arr)); } catch(e){} }
function nextUserId(){ const arr = readUsers(); return arr.length ? Math.max(...arr.map(r=>r.id))+1 : 1; }

// --- User functions (web) ---
export const createUser = (username, password, displayName = '') => new Promise((resolve, reject) => {
  const users = readUsers();
  if(users.find(u => u.username === username)) return reject(new Error('username_taken'));
  const id = nextUserId();
  const created_at = new Date().toISOString();
  users.unshift({ id, username, password, display_name: displayName, created_at });
  writeUsers(users);
  resolve(id);
});

export const authenticateUser = (username, password) => new Promise((resolve, reject) => {
  const users = readUsers();
  const found = users.find(u => u.username === username && u.password === password);
  if(found) resolve(found);
  else reject(new Error('invalid_credentials'));
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

