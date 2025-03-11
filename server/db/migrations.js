// server/db/migrations.js
// This file handles database migrations for adding new columns or tables to existing databases
const db = require('./database');

/**
 * Checks if a column exists in a table
 * @param {string} tableName - The name of the table to check
 * @param {string} columnName - The name of the column to look for
 * @returns {Promise<boolean>} - Whether the column exists
 */
async function columnExists(tableName, columnName) {
  try {
    const tableInfo = await db.all(`PRAGMA table_info(${tableName})`);
    return tableInfo.some((column) => column.name === columnName);
  } catch (error) {
    console.error(`Error checking if column ${columnName} exists in ${tableName}:`, error);
    return false;
  }
}

/**
 * Runs all necessary database migrations
 * @returns {Promise<void>}
 */
async function runMigrations() {
  try {
    console.log('Checking for necessary database migrations...');
    
    // Migration 1: Add price column to assets table if it doesn't exist
    const priceColumnExists = await columnExists('assets', 'price');
    if (!priceColumnExists) {
      console.log('Running migration: Adding price column to assets table');
      await db.run('ALTER TABLE assets ADD COLUMN price TEXT');
      console.log('Migration completed: Added price column to assets table');
    }
    
    // Migration 2: Add currency column to assets table if it doesn't exist
    const currencyColumnExists = await columnExists('assets', 'currency');
    if (!currencyColumnExists) {
      console.log('Running migration: Adding currency column to assets table');
      await db.run('ALTER TABLE assets ADD COLUMN currency TEXT DEFAULT "USD"');
      console.log('Migration completed: Added currency column to assets table');
    }
    
    // Migration 3: Add currency_preference to settings if it doesn't exist
    const settingExists = await db.get('SELECT 1 FROM settings WHERE key = ?', ['currency_preference']);
    if (!settingExists) {
      console.log('Running migration: Adding currency_preference to settings');
      await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['currency_preference', 'USD']);
      console.log('Migration completed: Added currency_preference to settings');
    }
    
    // Add more migrations here as needed in the future
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
  }
}

module.exports = { runMigrations };