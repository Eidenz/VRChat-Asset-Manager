// server/db/init.js - Modified to include avatar_collections table
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.join(__dirname, '../../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'vrchat_assets.db');

// Delete existing database file if it exists
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Deleted existing database file');
}

// Create a new database
const db = new sqlite3.Database(dbPath);

// Run database setup without seeding
db.serialize(() => {
  console.log('Creating tables...');
  
  // Turn off foreign key constraints temporarily for initial setup
  db.run('PRAGMA foreign_keys = OFF');
  
  // Create tables
  db.run(`CREATE TABLE avatar_bases (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
  )`);
  
  db.run(`CREATE TABLE asset_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
  )`);
  
  db.run(`CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )`);
  
  db.run(`CREATE TABLE avatars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    base TEXT NOT NULL,
    thumbnail TEXT NOT NULL,
    date_added TEXT NOT NULL,
    last_used TEXT NOT NULL,
    file_path TEXT NOT NULL,
    notes TEXT,
    favorited INTEGER DEFAULT 0,
    is_current INTEGER DEFAULT 0
  )`);
  
  db.run(`CREATE TABLE collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    thumbnail TEXT NOT NULL,
    date_created TEXT NOT NULL,
    folder_path TEXT
  )`);
  
  // New table for avatar-collection relationships
  db.run(`CREATE TABLE avatar_collections (
    avatar_id INTEGER,
    collection_id INTEGER,
    date_linked TEXT NOT NULL,
    PRIMARY KEY (avatar_id, collection_id),
    FOREIGN KEY (avatar_id) REFERENCES avatars(id) ON DELETE CASCADE,
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
  )`);
  
  db.run(`CREATE TABLE assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    creator TEXT NOT NULL,
    description TEXT,
    thumbnail TEXT NOT NULL,
    date_added TEXT NOT NULL,
    last_used TEXT NOT NULL,
    file_size TEXT,
    file_path TEXT,
    download_url TEXT,
    version TEXT,
    type TEXT NOT NULL,
    favorited INTEGER DEFAULT 0,
    notes TEXT,
    owned_variant TEXT,
    price TEXT,
    currency TEXT DEFAULT 'USD',
    nsfw INTEGER DEFAULT 0
  )`);
  
  db.run(`CREATE TABLE asset_tags (
    asset_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (asset_id, tag_id)
  )`);
  
  db.run(`CREATE TABLE asset_compatible_avatars (
    asset_id INTEGER,
    avatar_base TEXT,
    PRIMARY KEY (asset_id, avatar_base)
  )`);
  
  db.run(`CREATE TABLE collection_assets (
    collection_id INTEGER,
    asset_id INTEGER,
    date_added TEXT NOT NULL,
    PRIMARY KEY (collection_id, asset_id)
  )`);
  
  db.run(`CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);

  // Insert default settings
  db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['defaultAvatarPath', 'D:/VRChat/Avatars']);
  db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['defaultAssetsPath', 'D:/VRChat/Assets']);
  db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['unityPath', 'C:/Program Files/Unity/Hub/Editor/2022.3.6f1/Editor/Unity.exe']);
  db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['autoSync', '1']);
  db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['darkMode', '1']);
  db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['showFilePaths', '1']);
  db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['currency_preference', 'USD']);
  db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['blur_nsfw', '1']);
  
  // Insert default asset types
  const defaultTypes = [
    { id: 'clothing', name: 'Clothing' },
    { id: 'prop', name: 'Prop' },
    { id: 'accessory', name: 'Accessory' },
    { id: 'texture', name: 'Texture' },
    { id: 'animation', name: 'Animation' },
    { id: 'body_part', name: 'Body Part' },
    { id: 'shader', name: 'Shader' },
    { id: 'audio', name: 'Audio' },
    { id: 'prefab', name: 'Prefab' },
    { id: 'script_component', name: 'Script/Component' }
  ];
  
  defaultTypes.forEach(type => {
    db.run('INSERT INTO asset_types (id, name) VALUES (?, ?)', [type.id, type.name]);
  });
    
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');
  
  console.log('Database initialization complete! Created empty database with schema.');
});

// Close the database connection after a delay to ensure all operations complete
setTimeout(() => {
  db.close(err => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
  });
}, 1000);