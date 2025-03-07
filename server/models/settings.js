// server/models/settings.js - Settings model
const db = require('../db/database');

/**
 * Get all settings
 * @returns {Promise<Object>} Settings object
 */
async function getAllSettings() {
  const settings = await db.all(`
    SELECT key, value
    FROM settings
  `);
  
  // Convert to object
  const settingsObj = {};
  settings.forEach(setting => {
    // Convert boolean strings to actual booleans
    if (setting.value === '0' || setting.value === '1') {
      settingsObj[setting.key] = setting.value === '1';
    } else {
      settingsObj[setting.key] = setting.value;
    }
  });
  
  return settingsObj;
}

/**
 * Get a setting by key
 * @param {string} key - Setting key
 * @returns {Promise<string|null>} Setting value
 */
async function getSetting(key) {
  const setting = await db.get(`
    SELECT value
    FROM settings
    WHERE key = ?
  `, [key]);
  
  if (!setting) return null;
  
  // Convert boolean strings to actual booleans
  if (setting.value === '0' || setting.value === '1') {
    return setting.value === '1';
  }
  
  return setting.value;
}

/**
 * Update a setting
 * @param {string} key - Setting key
 * @param {string|boolean} value - Setting value
 * @returns {Promise<boolean>} Success status
 */
async function updateSetting(key, value) {
  // Convert boolean to string
  const stringValue = typeof value === 'boolean' ? (value ? '1' : '0') : String(value);
  
  // Check if setting exists
  const exists = await db.get('SELECT 1 FROM settings WHERE key = ?', [key]);
  
  let result;
  if (exists) {
    // Update
    result = await db.run(`
      UPDATE settings
      SET value = ?
      WHERE key = ?
    `, [stringValue, key]);
  } else {
    // Insert
    result = await db.run(`
      INSERT INTO settings (key, value)
      VALUES (?, ?)
    `, [key, stringValue]);
  }
  
  return result.changes > 0;
}

/**
 * Update multiple settings
 * @param {Object} settings - Settings object
 * @returns {Promise<boolean>} Success status
 */
async function updateSettings(settings) {
  // Start a transaction
  await db.run('BEGIN TRANSACTION');
  
  try {
    for (const [key, value] of Object.entries(settings)) {
      // Convert boolean to string
      const stringValue = typeof value === 'boolean' ? (value ? '1' : '0') : String(value);
      
      // Check if setting exists
      const exists = await db.get('SELECT 1 FROM settings WHERE key = ?', [key]);
      
      if (exists) {
        // Update
        await db.run(`
          UPDATE settings
          SET value = ?
          WHERE key = ?
        `, [stringValue, key]);
      } else {
        // Insert
        await db.run(`
          INSERT INTO settings (key, value)
          VALUES (?, ?)
        `, [key, stringValue]);
      }
    }
    
    // Commit the transaction
    await db.run('COMMIT');
    
    return true;
    
  } catch (err) {
    // Rollback on error
    await db.run('ROLLBACK');
    throw err;
  }
}

module.exports = {
  getAllSettings,
  getSetting,
  updateSetting,
  updateSettings
};