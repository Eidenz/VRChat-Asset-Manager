// server/models/assets.js - Asset model
const db = require('../db/database');
const { deleteImageFile } = require('../utils/imageUtils');

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
  
  // Parse the ownedVariant field if it's a JSON string
  let ownedVariant = asset.owned_variant;
  if (ownedVariant && typeof ownedVariant === 'string') {
    try {
      // Try to parse as JSON in case it's stored as an array
      ownedVariant = JSON.parse(ownedVariant);
    } catch (e) {
      // If it's not valid JSON, keep as is
      console.log('Note: owned_variant is not a JSON string:', ownedVariant);
    }
  }
  
  return {
    ...asset,
    tags,
    compatibleWith,
    favorited: asset.favorited === 1,
    ownedVariant: ownedVariant
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
    downloadUrl, version, type, notes, tags = [], 
    compatibleWith = [], ownedVariant, price, currency,
    nsfw, // Add NSFW parameter
    serverUploadedImage
  } = asset;
  
  // Use serverUploadedImage if available, fallback to thumbnail
  const thumbnail = serverUploadedImage || asset.thumbnail;
  
  // Format owned variant for database storage
  // If it's an array, stringify it; if not, store as is or null
  let storedOwnedVariant = null;
  if (ownedVariant) {
    if (Array.isArray(ownedVariant)) {
      storedOwnedVariant = JSON.stringify(ownedVariant);
    } else {
      storedOwnedVariant = ownedVariant;
    }
  }
  
  const dateAdded = new Date().toISOString();
  const lastUsed = dateAdded;
  
  // Ensure favorited is properly converted to 0/1 for database
  const favorited = asset.favorited ? 1 : 0;
  
  // Convert nsfw boolean to 0/1 for database
  const nsfwValue = nsfw ? 1 : 0;
  
  // Start a transaction
  await db.run('BEGIN TRANSACTION');
  
  try {
    // Insert the asset with price and currency included
    const result = await db.run(`
      INSERT INTO assets (
        name, creator, description, thumbnail, date_added, last_used, 
        file_size, file_path, download_url, version, type, favorited, notes,
        owned_variant, price, currency, nsfw
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, creator, description, thumbnail, dateAdded, lastUsed,
      fileSize, filePath, downloadUrl, version, type, favorited, notes,
      storedOwnedVariant, price, currency || 'USD', nsfwValue
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
    
    // Format the owned variant for the return value
    let returnOwnedVariant = null;
    if (storedOwnedVariant) {
      try {
        // Try to parse it as JSON
        returnOwnedVariant = JSON.parse(storedOwnedVariant);
      } catch (e) {
        // If not valid JSON, return as is
        returnOwnedVariant = storedOwnedVariant;
      }
    }
    
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
      compatibleWith,
      ownedVariant: returnOwnedVariant,
      price, // Include price in the returned asset
      currency: currency || 'USD' // Include currency in the returned asset
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
    downloadUrl, version, type, notes, tags, compatibleWith,
    ownedVariant, price, currency, nsfw  // Add nsfw
  } = asset;
  
  // Ensure favorited is properly converted to 0/1 for database
  const favorited = asset.favorited ? 1 : 0;
  
  // Convert nsfw boolean to 0/1 for database
  const nsfwValue = nsfw ? 1 : 0;
  
  // Start a transaction
  await db.run('BEGIN TRANSACTION');
  
  try {
    // Update the asset including currency and nsfw flag
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
          favorited = ?,
          owned_variant = ?,
          price = ?,
          currency = ?,
          nsfw = ?
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
      ownedVariant || null,
      price || null,
      currency || 'USD',
      nsfwValue,
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
    // First get the asset to get its thumbnail URL
    const asset = await getAssetById(id);
    if (!asset) {
      await db.run('ROLLBACK');
      return false;
    }
    
    // Delete relations first
    await db.run('DELETE FROM asset_tags WHERE asset_id = ?', [id]);
    await db.run('DELETE FROM asset_compatible_avatars WHERE asset_id = ?', [id]);
    await db.run('DELETE FROM collection_assets WHERE asset_id = ?', [id]);
    
    // Delete the asset
    const result = await db.run('DELETE FROM assets WHERE id = ?', [id]);
    
    // Commit the transaction
    await db.run('COMMIT');
    
    // If deletion was successful, delete the image file
    if (result.changes > 0 && asset.thumbnail) {
      deleteImageFile(asset.thumbnail);
    }
    
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

/**
 * Toggle asset NSFW status
 * @param {number} id - Asset ID
 * @returns {Promise<Object>} Status and new NSFW value
 */
async function toggleNsfw(id) {
  try {
    // Get current NSFW status
    const asset = await getAssetById(id);
    if (!asset) throw new Error('Asset not found');
    
    // Toggle from true to false or false to true
    const newStatus = !asset.nsfw;
    
    // Use the 0/1 database convention for boolean values
    const nsfwValue = newStatus ? 1 : 0;
    
    // Update NSFW status in database
    const result = await db.run(`
      UPDATE assets 
      SET nsfw = ? 
      WHERE id = ?
    `, [nsfwValue, id]);
    
    return {
      success: result.changes > 0,
      nsfw: newStatus
    };
  } catch (error) {
    console.error(`Error toggling NSFW status for asset ${id}:`, error);
    throw error;
  }
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
  getAllTags,
  toggleNsfw
};