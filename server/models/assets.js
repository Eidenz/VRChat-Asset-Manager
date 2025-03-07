// server/models/assets.js - Asset model
const db = require('../db/database');

/**
 * Get all assets with their tags and compatible avatars
 * @returns {Promise<Array>} Array of asset objects
 */
async function getAllAssets() {
  // Get all assets
  const assets = await db.all(`
    SELECT * FROM assets 
    ORDER BY date_added DESC
  `);
  
  // Fetch tags and compatible avatars for each asset
  return await Promise.all(assets.map(async (asset) => {
    const tags = await getAssetTags(asset.id);
    const compatibleWith = await getAssetCompatibleAvatars(asset.id);
    
    return {
      ...asset,
      tags,
      compatibleWith,
      favorited: asset.favorited === 1
    };
  }));
}

/**
 * Get asset by ID
 * @param {number} id - Asset ID
 * @returns {Promise<Object>} Asset object with tags and compatible avatars
 */
async function getAssetById(id) {
  // Get the asset
  const asset = await db.get(`
    SELECT * FROM assets 
    WHERE id = ?
  `, [id]);
  
  if (!asset) return null;
  
  // Get tags and compatible avatars
  const tags = await getAssetTags(id);
  const compatibleWith = await getAssetCompatibleAvatars(id);
  
  return {
    ...asset,
    tags,
    compatibleWith,
    favorited: asset.favorited === 1
  };
}

/**
 * Get assets by type
 * @param {string} type - Asset type
 * @returns {Promise<Array>} Array of asset objects
 */
async function getAssetsByType(type) {
  // Get assets of the specified type
  const assets = await db.all(`
    SELECT * FROM assets 
    WHERE type = ? 
    ORDER BY date_added DESC
  `, [type]);
  
  // Fetch tags and compatible avatars for each asset
  return await Promise.all(assets.map(async (asset) => {
    const tags = await getAssetTags(asset.id);
    const compatibleWith = await getAssetCompatibleAvatars(asset.id);
    
    return {
      ...asset,
      tags,
      compatibleWith,
      favorited: asset.favorited === 1
    };
  }));
}

/**
 * Get favorited assets
 * @returns {Promise<Array>} Array of asset objects
 */
async function getFavoritedAssets() {
  // Get favorited assets
  const assets = await db.all(`
    SELECT * FROM assets 
    WHERE favorited = 1 
    ORDER BY date_added DESC
  `);
  
  // Fetch tags and compatible avatars for each asset
  return await Promise.all(assets.map(async (asset) => {
    const tags = await getAssetTags(asset.id);
    const compatibleWith = await getAssetCompatibleAvatars(asset.id);
    
    return {
      ...asset,
      tags,
      compatibleWith,
      favorited: true
    };
  }));
}

/**
 * Get recently added assets
 * @param {number} limit - Number of assets to return
 * @returns {Promise<Array>} Array of asset objects
 */
async function getRecentAssets(limit = 5) {
  // Get recent assets
  const assets = await db.all(`
    SELECT * FROM assets 
    ORDER BY date_added DESC 
    LIMIT ?
  `, [limit]);
  
  // Fetch tags and compatible avatars for each asset
  return await Promise.all(assets.map(async (asset) => {
    const tags = await getAssetTags(asset.id);
    const compatibleWith = await getAssetCompatibleAvatars(asset.id);
    
    return {
      ...asset,
      tags,
      compatibleWith,
      favorited: asset.favorited === 1
    };
  }));
}

/**
 * Get asset tags
 * @param {number} assetId - Asset ID
 * @returns {Promise<Array>} Array of tag names
 */
async function getAssetTags(assetId) {
  const rows = await db.all(`
    SELECT t.name 
    FROM asset_tags at
    JOIN tags t ON at.tag_id = t.id
    WHERE at.asset_id = ?
  `, [assetId]);
  
  return rows.map(row => row.name);
}

/**
 * Get asset compatible avatars
 * @param {number} assetId - Asset ID
 * @returns {Promise<Array>} Array of avatar base names
 */
async function getAssetCompatibleAvatars(assetId) {
  const rows = await db.all(`
    SELECT avatar_base 
    FROM asset_compatible_avatars
    WHERE asset_id = ?
  `, [assetId]);
  
  return rows.map(row => row.avatar_base);
}

/**
 * Create a new asset
 * @param {Object} asset - Asset object
 * @returns {Promise<Object>} Created asset with ID
 */
async function createAsset(asset) {
  const { 
    name, creator, description, fileSize, filePath, 
    downloadUrl, version, type, notes, tags = [], compatibleWith = [],
    serverUploadedImage // Add this to the destructuring
  } = asset;
  
  // Use serverUploadedImage if available, fallback to thumbnail
  const thumbnail = serverUploadedImage || asset.thumbnail;
  
  console.log('Creating asset with thumbnail:', thumbnail);
  console.log('(serverUploadedImage was:', serverUploadedImage, ')');
  
  const dateAdded = new Date().toISOString();
  const lastUsed = dateAdded;
  
  // Ensure favorited is properly converted to 0/1 for database
  const favorited = asset.favorited ? 1 : 0;
  
  // Start a transaction
  await db.run('BEGIN TRANSACTION');
  
  try {
    // Insert the asset
    const result = await db.run(`
      INSERT INTO assets (
        name, creator, description, thumbnail, date_added, last_used, 
        file_size, file_path, download_url, version, type, favorited, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, creator, description, thumbnail, dateAdded, lastUsed,
      fileSize, filePath, downloadUrl, version, type, favorited, notes
    ]);
    
    const assetId = result.lastID;
    
    // Add tags
    for (const tagName of tags) {
      // Check if tag exists, create if not
      let tagId = await db.get('SELECT id FROM tags WHERE name = ?', [tagName]);
      
      if (!tagId) {
        const tagResult = await db.run('INSERT INTO tags (name) VALUES (?)', [tagName]);
        tagId = { id: tagResult.lastID };
      }
      
      // Associate tag with asset
      await db.run('INSERT INTO asset_tags (asset_id, tag_id) VALUES (?, ?)', [assetId, tagId.id]);
    }
    
    // Add compatible avatars
    for (const avatarBase of compatibleWith) {
      await db.run('INSERT INTO asset_compatible_avatars (asset_id, avatar_base) VALUES (?, ?)', [assetId, avatarBase]);
    }
    
    // Commit the transaction
    await db.run('COMMIT');
    
    return {
      id: assetId,
      name,
      creator,
      description,
      thumbnail,
      dateAdded,
      lastUsed,
      fileSize,
      filePath,
      downloadUrl,
      version,
      type,
      favorited: Boolean(favorited), // Return as boolean
      notes,
      tags,
      compatibleWith
    };
    
  } catch (err) {
    // Rollback on error
    await db.run('ROLLBACK');
    throw err;
  }
}

/**
 * Update an asset
 * @param {number} id - Asset ID
 * @param {Object} asset - Updated asset data
 * @returns {Promise<boolean>} Success status
 */
async function updateAsset(id, asset) {
  const { 
    name, creator, description, thumbnail, fileSize, filePath, 
    downloadUrl, version, type, notes, tags, compatibleWith
  } = asset;
  
  // Ensure favorited is properly converted to 0/1 for database
  const favorited = asset.favorited ? 1 : 0;
  
  // Start a transaction
  await db.run('BEGIN TRANSACTION');
  
  try {
    // Update the asset
    const result = await db.run(`
      UPDATE assets 
      SET name = ?, 
          creator = ?,
          description = ?,
          ${thumbnail ? 'thumbnail = ?,' : ''}
          file_size = ?,
          file_path = ?,
          download_url = ?,
          version = ?,
          type = ?,
          notes = ?,
          favorited = ?
      WHERE id = ?
    `, [
      name, 
      creator, 
      description, 
      ...(thumbnail ? [thumbnail] : []),
      fileSize, 
      filePath, 
      downloadUrl, 
      version, 
      type, 
      notes, 
      favorited, 
      id
    ]);
    
    // Update tags if provided
    if (tags) {
      // Clear existing tags
      await db.run('DELETE FROM asset_tags WHERE asset_id = ?', [id]);
      
      // Add new tags
      for (const tagName of tags) {
        // Check if tag exists, create if not
        let tagId = await db.get('SELECT id FROM tags WHERE name = ?', [tagName]);
        
        if (!tagId) {
          const tagResult = await db.run('INSERT INTO tags (name) VALUES (?)', [tagName]);
          tagId = { id: tagResult.lastID };
        }
        
        // Associate tag with asset
        await db.run('INSERT INTO asset_tags (asset_id, tag_id) VALUES (?, ?)', [id, tagId.id]);
      }
    }
    
    // Update compatible avatars if provided
    if (compatibleWith) {
      // Clear existing compatibility
      await db.run('DELETE FROM asset_compatible_avatars WHERE asset_id = ?', [id]);
      
      // Add new compatibility
      for (const avatarBase of compatibleWith) {
        await db.run('INSERT INTO asset_compatible_avatars (asset_id, avatar_base) VALUES (?, ?)', [id, avatarBase]);
      }
    }
    
    // Commit the transaction
    await db.run('COMMIT');
    
    return result.changes > 0;
    
  } catch (err) {
    // Rollback on error
    await db.run('ROLLBACK');
    throw err;
  }
}

/**
 * Update asset last used date
 * @param {number} id - Asset ID
 * @returns {Promise<boolean>} Success status
 */
async function updateAssetLastUsed(id) {
  const now = new Date().toISOString();
  
  const result = await db.run(`
    UPDATE assets 
    SET last_used = ? 
    WHERE id = ?
  `, [now, id]);
  
  return result.changes > 0;
}

/**
 * Toggle asset favorited status
 * @param {number} id - Asset ID
 * @returns {Promise<Object>} Status and new favorited value
 */
async function toggleFavorite(id) {
  // Get current favorited status
  const asset = await db.get('SELECT favorited FROM assets WHERE id = ?', [id]);
  if (!asset) throw new Error('Asset not found');
  
  // Toggle from 0 to 1 or 1 to 0
  const newStatus = asset.favorited === 1 ? 0 : 1;
  
  const result = await db.run(`
    UPDATE assets 
    SET favorited = ? 
    WHERE id = ?
  `, [newStatus, id]);
  
  return {
    success: result.changes > 0,
    favorited: newStatus === 1  // Return as boolean
  };
}

/**
 * Delete an asset
 * @param {number} id - Asset ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteAsset(id) {
  // Start a transaction
  await db.run('BEGIN TRANSACTION');
  
  try {
    // Delete relations first
    await db.run('DELETE FROM asset_tags WHERE asset_id = ?', [id]);
    await db.run('DELETE FROM asset_compatible_avatars WHERE asset_id = ?', [id]);
    await db.run('DELETE FROM collection_assets WHERE asset_id = ?', [id]);
    
    // Delete the asset
    const result = await db.run('DELETE FROM assets WHERE id = ?', [id]);
    
    // Commit the transaction
    await db.run('COMMIT');
    
    return result.changes > 0;
    
  } catch (err) {
    // Rollback on error
    await db.run('ROLLBACK');
    throw err;
  }
}

/**
 * Get all asset types
 * @returns {Promise<Array>} Array of asset type objects
 */
async function getAllAssetTypes() {
  return await db.all(`
    SELECT * FROM asset_types 
    ORDER BY name ASC
  `);
}

/**
 * Get all tags
 * @returns {Promise<Array>} Array of tag objects
 */
async function getAllTags() {
  return await db.all(`
    SELECT * FROM tags 
    ORDER BY name ASC
  `);
}

module.exports = {
  getAllAssets,
  getAssetById,
  getAssetsByType,
  getFavoritedAssets,
  getRecentAssets,
  createAsset,
  updateAsset,
  updateAssetLastUsed,
  toggleFavorite,
  deleteAsset,
  getAllAssetTypes,
  getAllTags
};