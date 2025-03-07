// server/db/init.js - Simplified SQLite database initializer
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

// Import mock data
const mockData = require('../seed/mockData');

// Run database setup and seeding
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
    favorited INTEGER DEFAULT 0
  )`);
  
  db.run(`CREATE TABLE collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    thumbnail TEXT NOT NULL,
    date_created TEXT NOT NULL,
    folder_path TEXT
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
    notes TEXT
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
  
  console.log('Seeding data...');
  
  // Insert avatar bases
  mockData.avatarBases.forEach(base => {
    db.run('INSERT INTO avatar_bases (id, name) VALUES (?, ?)', [base.id, base.name]);
  });
  
  // Insert asset types
  mockData.assetTypes.forEach(type => {
    db.run('INSERT INTO asset_types (id, name) VALUES (?, ?)', [type.id, type.name]);
  });
  
  // Insert tags
  mockData.assetTags.forEach(tag => {
    db.run('INSERT INTO tags (name) VALUES (?)', [tag]);
  });
  
  // Insert avatars
  mockData.avatars.forEach(avatar => {
    db.run(
      'INSERT INTO avatars (id, name, base, thumbnail, date_added, last_used, file_path, notes, favorited) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        avatar.id,
        avatar.name,
        avatar.base,
        avatar.thumbnail,
        avatar.dateAdded,
        avatar.lastUsed,
        avatar.filePath,
        avatar.notes,
        avatar.favorited ? 1 : 0
      ]
    );
  });
  
  // Insert collections
  mockData.collections.forEach(collection => {
    db.run(
      'INSERT INTO collections (id, name, description, thumbnail, date_created, folder_path) VALUES (?, ?, ?, ?, ?, ?)',
      [
        collection.id,
        collection.name,
        collection.description,
        collection.thumbnail,
        collection.dateCreated,
        collection.folderPath
      ]
    );
  });
  
  // Insert assets
  const allAssets = mockData.getAllAssets();
  allAssets.forEach(asset => {
    db.run(
      'INSERT INTO assets (id, name, creator, description, thumbnail, date_added, last_used, file_size, file_path, download_url, version, type, favorited, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        asset.id,
        asset.name,
        asset.creator,
        asset.description,
        asset.thumbnail,
        asset.dateAdded,
        asset.lastUsed || asset.dateAdded,
        asset.fileSize || null,
        asset.filePath || null,
        asset.downloadUrl || null,
        asset.version || null,
        asset.type,
        asset.favorited ? 1 : 0,
        asset.notes || null
      ]
    );
  });
  
  // Insert settings
  Object.entries(mockData.settings).forEach(([key, value]) => {
    const stringValue = typeof value === 'boolean' ? (value ? '1' : '0') : String(value);
    db.run('INSERT INTO settings (key, value) VALUES (?, ?)', [key, stringValue]);
  });
  
  // Wait for all inserts to complete before adding relationships
  db.run('PRAGMA foreign_keys = ON', [], function(err) {
    if (err) {
      console.error('Error enabling foreign keys:', err.message);
      return;
    }
    
    console.log('Setting up relationships...');
    
    // Get tag IDs for assets
    db.all('SELECT id, name FROM tags', [], (err, tags) => {
      if (err) {
        console.error('Error getting tags:', err.message);
        return;
      }
      
      const tagMap = {};
      tags.forEach(tag => {
        tagMap[tag.name] = tag.id;
      });
      
      // Insert asset tags
      allAssets.forEach(asset => {
        asset.tags.forEach(tagName => {
          const tagId = tagMap[tagName];
          if (tagId) {
            db.run('INSERT INTO asset_tags (asset_id, tag_id) VALUES (?, ?)', [asset.id, tagId]);
          }
        });
      });
      
      // Insert asset compatible avatars
      allAssets.forEach(asset => {
        if (asset.compatibleWith) {
          asset.compatibleWith.forEach(avatarBase => {
            db.run('INSERT INTO asset_compatible_avatars (asset_id, avatar_base) VALUES (?, ?)', [asset.id, avatarBase]);
          });
        }
      });
      
      // Insert collection assets
      mockData.collections.forEach(collection => {
        // For each collection, randomly assign 5-10 assets
        const numAssets = Math.floor(Math.random() * 6) + 5; // 5-10 assets
        const selectedAssets = new Set();
        
        while (selectedAssets.size < numAssets && selectedAssets.size < allAssets.length) {
          const randomIndex = Math.floor(Math.random() * allAssets.length);
          const asset = allAssets[randomIndex];
          
          if (!selectedAssets.has(asset.id)) {
            selectedAssets.add(asset.id);
            const dateAdded = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString();
            db.run('INSERT INTO collection_assets (collection_id, asset_id, date_added) VALUES (?, ?, ?)', [collection.id, asset.id, dateAdded]);
          }
        }
      });
      
      console.log('Database initialization complete!');
    });
  });
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
}, 3000);