// server/models/collections.js - Modified to include avatar linking
const db = require('../db/database');
const assetsModel = require('./assets');
const { deleteImageFile } = require('../utils/imageUtils');

/**
 * Get all collections with item count
 * @returns {Promise<Array>} Array of collection objects
 */
async function getAllCollections() {
  const collections = await db.all(`
    SELECT c.*, COUNT(ca.asset_id) as item_count,
    (SELECT avatar_id FROM avatar_collections WHERE collection_id = c.id LIMIT 1) as linked_avatar_id
    FROM collections c
    LEFT JOIN collection_assets ca ON c.id = ca.collection_id
    GROUP BY c.id
    ORDER BY c.date_created DESC
  `);
  
  return collections;
}

/**
 * Get collection by ID
 * @param {number} id - Collection ID
 * @returns {Promise<Object>} Collection object
 */
async function getCollectionById(id) {
  const collection = await db.get(`
    SELECT c.*, COUNT(ca.asset_id) as item_count,
    (SELECT avatar_id FROM avatar_collections WHERE collection_id = c.id LIMIT 1) as linked_avatar_id
    FROM collections c
    LEFT JOIN collection_assets ca ON c.id = ca.collection_id
    WHERE c.id = ?
    GROUP BY c.id
  `, [id]);
  
  return collection;
}

/**
 * Get collection assets
 * @param {number} collectionId - Collection ID
 * @returns {Promise<Array>} Array of asset objects
 */
async function getCollectionAssets(collectionId) {
  // Get all asset IDs in the collection
  const assetRows = await db.all(`
    SELECT asset_id, date_added as date_added_to_collection
    FROM collection_assets
    WHERE collection_id = ?
  `, [collectionId]);
  
  if (assetRows.length === 0) return [];
  
  // Get full asset data for each ID
  const assets = await Promise.all(
    assetRows.map(async (row) => {
      const asset = await assetsModel.getAssetById(row.asset_id);
      if (asset) {
        return {
          ...asset,
          dateAddedToCollection: row.date_added_to_collection
        };
      }
      return null;
    })
  );
  
  // Filter out any null values (if an asset was deleted)
  return assets.filter(asset => asset !== null);
}

/**
 * Get collections linked to an avatar
 * @param {number} avatarId - Avatar ID
 * @returns {Promise<Array>} Array of collection objects
 */
async function getAvatarCollections(avatarId) {
  const collections = await db.all(`
    SELECT c.*, COUNT(ca.asset_id) as item_count
    FROM collections c
    JOIN avatar_collections ac ON c.id = ac.collection_id
    LEFT JOIN collection_assets ca ON c.id = ca.collection_id
    WHERE ac.avatar_id = ?
    GROUP BY c.id
    ORDER BY c.date_created DESC
  `, [avatarId]);
  
  return collections;
}

/**
 * Get avatar linked to a collection
 * @param {number} collectionId - Collection ID
 * @returns {Promise<Object|null>} Avatar object or null if not linked
 */
async function getLinkedAvatar(collectionId) {
  const row = await db.get(`
    SELECT a.*
    FROM avatars a
    JOIN avatar_collections ac ON a.id = ac.avatar_id
    WHERE ac.collection_id = ?
  `, [collectionId]);
  
  return row || null;
}

/**
 * Create a new collection
 * @param {Object} collection - Collection object
 * @returns {Promise<Object>} Created collection with ID
 */
async function createCollection(collection) {
  const { name, description, thumbnail, folderPath, avatarId } = collection;
  
  const dateCreated = new Date().toISOString();
  
  // Start a transaction
  await db.run('BEGIN TRANSACTION');
  
  try {
    // Insert the collection
    const result = await db.run(`
      INSERT INTO collections (name, description, thumbnail, date_created, folder_path)
      VALUES (?, ?, ?, ?, ?)
    `, [name, description, thumbnail, dateCreated, folderPath]);
    
    const collectionId = result.lastID;
    
    // If an avatar ID was provided, link it to the collection
    if (avatarId) {
      await db.run(`
        INSERT INTO avatar_collections (avatar_id, collection_id, date_linked)
        VALUES (?, ?, ?)
      `, [avatarId, collectionId, dateCreated]);
    }
    
    // Commit the transaction
    await db.run('COMMIT');
    
    return {
      id: collectionId,
      name,
      description,
      thumbnail,
      dateCreated,
      folderPath,
      itemCount: 0,
      linkedAvatarId: avatarId || null
    };
  } catch (err) {
    // Rollback on error
    await db.run('ROLLBACK');
    throw err;
  }
}

/**
 * Update a collection
 * @param {number} id - Collection ID
 * @param {Object} collection - Updated collection data
 * @returns {Promise<boolean>} Success status
 */
async function updateCollection(id, collection) {
  const { name, description, thumbnail, folderPath, avatarId } = collection;
  
  // Start a transaction
  await db.run('BEGIN TRANSACTION');
  
  try {
    // Update the collection
    const result = await db.run(`
      UPDATE collections 
      SET name = ?, 
          description = ?,
          ${thumbnail ? 'thumbnail = ?,' : ''}
          folder_path = ?
      WHERE id = ?
    `, [
      name, 
      description, 
      ...(thumbnail ? [thumbnail] : []),
      folderPath || null, 
      id
    ]);
    
    // Update avatar linkage
    if (avatarId !== undefined) {
      // First, remove any existing links
      await db.run('DELETE FROM avatar_collections WHERE collection_id = ?', [id]);
      
      // If avatarId is not null, create a new link
      if (avatarId) {
        const dateLinked = new Date().toISOString();
        await db.run(`
          INSERT INTO avatar_collections (avatar_id, collection_id, date_linked)
          VALUES (?, ?, ?)
        `, [avatarId, id, dateLinked]);
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
 * Delete a collection
 * @param {number} id - Collection ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteCollection(id) {
  // Get the collection first to get its thumbnail URL
  const collection = await getCollectionById(id);
  if (!collection) return false;
  
  // Start a transaction
  await db.run('BEGIN TRANSACTION');
  
  try {
    // Delete collection avatar links first
    await db.run('DELETE FROM avatar_collections WHERE collection_id = ?', [id]);
    
    // Delete collection assets relations
    await db.run('DELETE FROM collection_assets WHERE collection_id = ?', [id]);
    
    // Delete the collection
    const result = await db.run('DELETE FROM collections WHERE id = ?', [id]);
    
    // Commit the transaction
    await db.run('COMMIT');
    
    // If deletion was successful, delete the image file
    if (result.changes > 0 && collection.thumbnail) {
      deleteImageFile(collection.thumbnail);
    }
    
    return result.changes > 0;
    
  } catch (err) {
    // Rollback on error
    await db.run('ROLLBACK');
    throw err;
  }
}

/**
 * Link a collection to an avatar
 * @param {number} collectionId - Collection ID
 * @param {number} avatarId - Avatar ID
 * @returns {Promise<boolean>} Success status
 */
async function linkToAvatar(collectionId, avatarId) {
  const dateLinked = new Date().toISOString();
  
  // Check if the link already exists
  const exists = await db.get(`
    SELECT 1 FROM avatar_collections
    WHERE collection_id = ? AND avatar_id = ?
  `, [collectionId, avatarId]);
  
  if (exists) return true; // Already linked
  
  // Delete any existing avatar links for this collection (assuming a collection can only be linked to one avatar)
  await db.run('DELETE FROM avatar_collections WHERE collection_id = ?', [collectionId]);
  
  // Create the new link
  const result = await db.run(`
    INSERT INTO avatar_collections (collection_id, avatar_id, date_linked)
    VALUES (?, ?, ?)
  `, [collectionId, avatarId, dateLinked]);
  
  return result.changes > 0;
}

/**
 * Unlink a collection from an avatar
 * @param {number} collectionId - Collection ID
 * @param {number} avatarId - Avatar ID
 * @returns {Promise<boolean>} Success status
 */
async function unlinkFromAvatar(collectionId, avatarId) {
  const result = await db.run(`
    DELETE FROM avatar_collections
    WHERE collection_id = ? AND avatar_id = ?
  `, [collectionId, avatarId]);
  
  return result.changes > 0;
}

/**
 * Add asset to collection
 * @param {number} collectionId - Collection ID
 * @param {number} assetId - Asset ID
 * @returns {Promise<boolean>} Success status
 */
async function addAssetToCollection(collectionId, assetId) {
  const dateAdded = new Date().toISOString();
  
  // Check if the asset is already in the collection
  const exists = await db.get(`
    SELECT 1 FROM collection_assets
    WHERE collection_id = ? AND asset_id = ?
  `, [collectionId, assetId]);
  
  if (exists) return true; // Already exists
  
  const result = await db.run(`
    INSERT INTO collection_assets (collection_id, asset_id, date_added)
    VALUES (?, ?, ?)
  `, [collectionId, assetId, dateAdded]);
  
  return result.changes > 0;
}

/**
 * Add multiple assets to collection
 * @param {number} collectionId - Collection ID
 * @param {Array<number>} assetIds - Array of asset IDs
 * @returns {Promise<boolean>} Success status
 */
async function addAssetsToCollection(collectionId, assetIds) {
  const dateAdded = new Date().toISOString();
  
  // Start a transaction
  await db.run('BEGIN TRANSACTION');
  
  try {
    // Get existing assets in the collection
    const existingAssets = await db.all(`
      SELECT asset_id FROM collection_assets
      WHERE collection_id = ?
    `, [collectionId]);
    
    const existingIds = existingAssets.map(a => a.asset_id);
    
    // Filter out assets that are already in the collection
    const newAssetIds = assetIds.filter(id => !existingIds.includes(id));
    
    // Add new assets
    for (const assetId of newAssetIds) {
      await db.run(`
        INSERT INTO collection_assets (collection_id, asset_id, date_added)
        VALUES (?, ?, ?)
      `, [collectionId, assetId, dateAdded]);
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

/**
 * Remove asset from collection
 * @param {number} collectionId - Collection ID
 * @param {number} assetId - Asset ID
 * @returns {Promise<boolean>} Success status
 */
async function removeAssetFromCollection(collectionId, assetId) {
  const result = await db.run(`
    DELETE FROM collection_assets
    WHERE collection_id = ? AND asset_id = ?
  `, [collectionId, assetId]);
  
  return result.changes > 0;
}

module.exports = {
  getAllCollections,
  getCollectionById,
  getCollectionAssets,
  getAvatarCollections,
  getLinkedAvatar,
  createCollection,
  updateCollection,
  deleteCollection,
  linkToAvatar,
  unlinkFromAvatar,
  addAssetToCollection,
  addAssetsToCollection,
  removeAssetFromCollection
};