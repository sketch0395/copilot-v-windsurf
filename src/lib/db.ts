import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database setup - Use absolute path for Docker compatibility
const dbDir = process.env.DB_PATH || path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'focus-zone.db');

console.log('Database directory:', dbDir);
console.log('Database file path:', dbPath);

// Ensure data directory exists with proper permissions
if (!fs.existsSync(dbDir)) {
  console.log('Creating database directory...');
  fs.mkdirSync(dbDir, { recursive: true, mode: 0o777 });
}

// Check if directory is writable
try {
  fs.accessSync(dbDir, fs.constants.W_OK);
  console.log('Database directory is writable');
} catch (err) {
  console.error('Database directory is not writable:', err);
  throw new Error(`Cannot write to database directory: ${dbDir}`);
}

// Initialize database
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    data_type TEXT NOT NULL,
    data TEXT NOT NULL,
    last_synced DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, data_type)
  );

  CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_data_type ON user_data(user_id, data_type);
`);

// Prepared statements for better performance
export const statements = {
  // User operations
  createUser: db.prepare(`
    INSERT INTO users (email, password_hash, display_name)
    VALUES (?, ?, ?)
  `),
  
  getUserByEmail: db.prepare(`
    SELECT id, email, display_name, created_at
    FROM users
    WHERE email = ?
  `),
  
  getUserById: db.prepare(`
    SELECT id, email, display_name, created_at
    FROM users
    WHERE id = ?
  `),
  
  getUserWithPassword: db.prepare(`
    SELECT id, email, password_hash, display_name
    FROM users
    WHERE email = ?
  `),

  deleteUser: db.prepare(`
    DELETE FROM users
    WHERE id = ?
  `),

  // User data operations
  saveUserData: db.prepare(`
    INSERT INTO user_data (user_id, data_type, data, last_synced)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id, data_type) 
    DO UPDATE SET 
      data = excluded.data,
      last_synced = CURRENT_TIMESTAMP
  `),
  
  getUserData: db.prepare(`
    SELECT data_type, data, last_synced
    FROM user_data
    WHERE user_id = ? AND data_type = ?
  `),
  
  getAllUserData: db.prepare(`
    SELECT data_type, data, last_synced
    FROM user_data
    WHERE user_id = ?
  `),
  
  deleteUserData: db.prepare(`
    DELETE FROM user_data
    WHERE user_id = ? AND data_type = ?
  `),
};

// Graceful shutdown
process.on('exit', () => db.close());
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});
process.on('SIGTERM', () => {
  db.close();
  process.exit(0);
});

export default db;
