// server/models/avatars.js - Avatar model
const db = require('../db/database');
const { deleteImageFile } = require('../utils/imageUtils');

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
  const { name, base, thumbnail, filePath, notes, isCurrent } = avatar;
  
  const dateAdded = new Date().toISOString();
  const lastUsed = dateAdded;
  
  const result = await db.run(`
    INSERT INTO avatars (
      name, base, thumbnail, date_added, last_used, 
      file_path, notes, favorited, is_current
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    name, 
    base, 
    thumbnail, 
    dateAdded, 
    lastUsed, 
    filePath || '',
    notes || null, 
    avatar.favorited ? 1 : 0,
    isCurrent ? 1 : 0
  ]);
  
  return {
    id: result.lastID,
    name,
    base,
    thumbnail,
    dateAdded,
    lastUsed,
    filePath: filePath || '',
    notes,
    favorited: avatar.favorited || false,
    isCurrent: isCurrent || false
  };
}

/**
 * Update an avatar
 * @param {number} id - Avatar ID
 * @param {Object} avatar - Updated avatar data
 * @returns {Promise<boolean>} Success status
 */
async function updateAvatar(id, avatar) {
  const { name, base, thumbnail, filePath, notes, favorited, isCurrent } = avatar;
  
  const result = await db.run(`
    UPDATE avatars 
    SET name = ?, 
        base = ?,
        ${thumbnail ? 'thumbnail = ?,' : ''}
        file_path = ?,
        notes = ?,
        favorited = ?,
        is_current = ?
    WHERE id = ?
  `, [
    name, 
    base, 
    ...(thumbnail ? [thumbnail] : []),
    filePath || null,
    notes || null, 
    favorited ? 1 : 0,
    isCurrent ? 1 : 0,
    id
  ]);
  
  return result.changes > 0;
}

async function toggleCurrentStatus(id) {
  // Get current status
  const avatar = await getAvatarById(id);
  if (!avatar) throw new Error('Avatar not found');
  
  const newStatus = avatar.is_current === 1 ? 0 : 1;
  const now = new Date().toISOString();
  
  const result = await db.run(`
    UPDATE avatars 
    SET is_current = ?, 
        last_used = ?
    WHERE id = ?
  `, [newStatus, now, id]);
  
  return {
    success: result.changes > 0,
    isCurrent: newStatus === 1
  };
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
  // First get the avatar to get its thumbnail URL
  const avatar = await getAvatarById(id);
  if (!avatar) return false;
  
  const result = await db.run(`
    DELETE FROM avatars 
    WHERE id = ?
  `, [id]);
  
  // If deletion was successful, delete the image file
  if (result.changes > 0 && avatar.thumbnail) {
    deleteImageFile(avatar.thumbnail);
  }
  
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

/**
 * Create a new avatar base
 * @param {Object} base - Base object with id and name
 * @returns {Promise<Object>} The created base
 */
async function createAvatarBase(base) {
  try {
    const result = await db.run(
      'INSERT INTO avatar_bases (id, name) VALUES (?, ?)',
      [base.id, base.name]
    );
    
    return { id: base.id, name: base.name };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAllAvatars,
  getAvatarById,
  createAvatar,
  updateAvatar,
  toggleCurrentStatus,
  toggleFavorite,
  deleteAvatar,
  getAllAvatarBases,
  createAvatarBase
};