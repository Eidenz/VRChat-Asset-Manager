// server/models/avatars.js - Avatar model
const db = require('../db/database');

/**
 * Get all avatars
 * @returns {Promise<Array>} Array of avatar objects
 */
async function getAllAvatars() {
  return await db.all(`
    SELECT * FROM avatars 
    ORDER BY last_used DESC
  `);
}

/**
 * Get avatar by ID
 * @param {number} id - Avatar ID
 * @returns {Promise<Object>} Avatar object
 */
async function getAvatarById(id) {
  return await db.get(`
    SELECT * FROM avatars 
    WHERE id = ?
  `, [id]);
}

/**
 * Create a new avatar
 * @param {Object} avatar - Avatar object
 * @returns {Promise<Object>} Created avatar with ID
 */
async function createAvatar(avatar) {
  const { name, base, thumbnail, filePath, notes } = avatar;
  
  const dateAdded = new Date().toISOString();
  const lastUsed = dateAdded;
  
  const result = await db.run(`
    INSERT INTO avatars (name, base, thumbnail, date_added, last_used, file_path, notes, favorited)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [name, base, thumbnail, dateAdded, lastUsed, filePath, notes || null, avatar.favorited ? 1 : 0]);
  
  return {
    id: result.lastID,
    name,
    base,
    thumbnail,
    dateAdded,
    lastUsed,
    filePath,
    notes,
    favorited: avatar.favorited || false
  };
}

/**
 * Update an avatar
 * @param {number} id - Avatar ID
 * @param {Object} avatar - Updated avatar data
 * @returns {Promise<boolean>} Success status
 */
async function updateAvatar(id, avatar) {
  const { name, base, thumbnail, filePath, notes, favorited } = avatar;
  
  const result = await db.run(`
    UPDATE avatars 
    SET name = ?, 
        base = ?,
        ${thumbnail ? 'thumbnail = ?,' : ''}
        file_path = ?,
        notes = ?,
        favorited = ?
    WHERE id = ?
  `, [
    name, 
    base, 
    ...(thumbnail ? [thumbnail] : []),
    filePath, 
    notes || null, 
    favorited ? 1 : 0, 
    id
  ]);
  
  return result.changes > 0;
}

/**
 * Update avatar last used date
 * @param {number} id - Avatar ID
 * @returns {Promise<boolean>} Success status
 */
async function setAvatarAsCurrent(id) {
  const now = new Date().toISOString();
  
  const result = await db.run(`
    UPDATE avatars 
    SET last_used = ? 
    WHERE id = ?
  `, [now, id]);
  
  return result.changes > 0;
}

/**
 * Toggle avatar favorited status
 * @param {number} id - Avatar ID
 * @returns {Promise<Object>} Status and new favorited value
 */
async function toggleFavorite(id) {
  // Get current favorited status
  const avatar = await getAvatarById(id);
  if (!avatar) throw new Error('Avatar not found');
  
  const newStatus = avatar.favorited === 1 ? 0 : 1;
  
  const result = await db.run(`
    UPDATE avatars 
    SET favorited = ? 
    WHERE id = ?
  `, [newStatus, id]);
  
  return {
    success: result.changes > 0,
    favorited: newStatus === 1
  };
}

/**
 * Delete an avatar
 * @param {number} id - Avatar ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteAvatar(id) {
  const result = await db.run(`
    DELETE FROM avatars 
    WHERE id = ?
  `, [id]);
  
  return result.changes > 0;
}

/**
 * Get all avatar bases
 * @returns {Promise<Array>} Array of avatar base objects
 */
async function getAllAvatarBases() {
  return await db.all(`
    SELECT * FROM avatar_bases 
    ORDER BY name ASC
  `);
}

module.exports = {
  getAllAvatars,
  getAvatarById,
  createAvatar,
  updateAvatar,
  setAvatarAsCurrent,
  toggleFavorite,
  deleteAvatar,
  getAllAvatarBases
};