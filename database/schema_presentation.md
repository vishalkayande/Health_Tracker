# HealthTracker Database Schema (Presentation)

This document lists the database tables  used by HealthTracker, with short descriptions. The runtime schema used by the app contains the core tables `meals`, `exercises`, and `activities`. Optional or future tables are included below for reference.

---

## meals
Stores meal entries added by the user.

```sql
CREATE TABLE IF NOT EXISTS meals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  date TEXT NOT NULL
);
```

## food_items (optional)
Catalog of reusable food items to simplify adding meals.

```sql
CREATE TABLE IF NOT EXISTS food_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  calories_per_serving INTEGER,
  serving_unit TEXT
);
```

## meal_items (optional)
Junction table linking `meals` and `food_items` to allow a meal to have multiple food items.

```sql
CREATE TABLE IF NOT EXISTS meal_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meal_id INTEGER NOT NULL,
  food_item_id INTEGER NOT NULL,
  quantity REAL NOT NULL DEFAULT 1,
  FOREIGN KEY (meal_id) REFERENCES meals(id),
  FOREIGN KEY (food_item_id) REFERENCES food_items(id)
);
```

## exercises
Stores exercise entries (walks, runs, cycles) and their measured metrics.

```sql
CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  distance REAL,
  calories_burned INTEGER NOT NULL,
  carbon_saved REAL NOT NULL,
  date TEXT NOT NULL
);
```

## activities
Lightweight checklist-style activities (habit tasks) per day.

```sql
CREATE TABLE IF NOT EXISTS activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  completed INTEGER NOT NULL,
  date TEXT NOT NULL
);
```

## users
Stores user accounts and basic metadata. Do NOT store plaintext passwords — store a secure password hash (bcrypt/argon2) or use platform auth.

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  is_guest INTEGER NOT NULL DEFAULT 0,
  settings TEXT,           
  created_at TEXT NOT NULL, 
  last_login TEXT           
);
```
