
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    calories INTEGER NOT NULL,
    date TEXT NOT NULL
  )`,

  // Food catalog: reusable food items to avoid re-typing frequent foods
  `CREATE TABLE IF NOT EXISTS food_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    calories_per_serving INTEGER,
    serving_unit TEXT
  )`,

  //  table linking meals to food_items (a meal can have many items)
  `CREATE TABLE IF NOT EXISTS meal_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meal_id INTEGER NOT NULL,
    food_item_id INTEGER NOT NULL,
    quantity REAL NOT NULL DEFAULT 1,
    FOREIGN KEY (meal_id) REFERENCES meals(id),
    FOREIGN KEY (food_item_id) REFERENCES food_items(id)
  )`,

  `CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    duration INTEGER NOT NULL,
    distance REAL,
    calories_burned INTEGER NOT NULL,
    carbon_saved REAL NOT NULL,
    date TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    completed INTEGER NOT NULL,
    date TEXT NOT NULL
  )`,

  // Users table for signup/login 
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    display_name TEXT,
    created_at TEXT NOT NULL
  )`
];

export default SCHEMA;
