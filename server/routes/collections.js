// server/routes/collections.js - Updated with avatar linking routes
const express = require('express');
const router = express.Router();
const collectionsModel = require('../models/collections');
const avatarsModel = require('../models/avatars');
const { body, param, validationResult } = require('express-validator');

/**
 * @route   GET /api/collections
 * @desc    Get all collections
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const collections = await collectionsModel.getAllCollections();
    
    // Format to match frontend expectations
    const formattedCollections = await Promise.all(collections.map(async collection => {
      let linkedAvatar = null;
      
      // If collection has a linked avatar, fetch its details
      if (collection.linked_avatar_id) {
        linkedAvatar = await avatarsModel.getAvatarById(collection.linked_avatar_id);
      }
      
      return {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        thumbnail: collection.thumbnail,
        dateCreated: collection.date_created,
        folderPath: collection.folder_path,
        itemCount: collection.item_count,
        linkedAvatarId: collection.linked_avatar_id,
        linkedAvatar: linkedAvatar ? {
          id: linkedAvatar.id,
          name: linkedAvatar.name,
          thumbnail: linkedAvatar.thumbnail,
          base: linkedAvatar.base
        } : null
      };
    }));
    
    res.json({ success: true, data: formattedCollections });
  } catch (err) {
    console.error('Error getting collections:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/collections/:id
 * @desc    Get collection by ID
 * @access  Public
 */
router.get('/:id',
  param('id').isInt().withMessage('Collection ID must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const collection = await collectionsModel.getCollectionById(req.params.id);
      
      if (!collection) {
        return res.status(404).json({ success: false, message: 'Collection not found' });
      }
      
      // Get linked avatar if there is one
      let linkedAvatar = null;
      if (collection.linked_avatar_id) {
        linkedAvatar = await avatarsModel.getAvatarById(collection.linked_avatar_id);
      }
      
      // Format to match frontend expectations
      const formattedCollection = {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        thumbnail: collection.thumbnail,
        dateCreated: collection.date_created,
        folderPath: collection.folder_path,
        itemCount: collection.item_count,
        linkedAvatarId: collection.linked_avatar_id,
        linkedAvatar: linkedAvatar ? {
          id: linkedAvatar.id,
          name: linkedAvatar.name,
          thumbnail: linkedAvatar.thumbnail,
          base: linkedAvatar.base
        } : null
      };
      
      res.json({ success: true, data: formattedCollection });
    } catch (err) {
      console.error('Error getting collection:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   GET /api/collections/:id/assets
 * @desc    Get collection assets
 * @access  Public
 */
router.get('/:id/assets',
  param('id').isInt().withMessage('Collection ID must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const collection = await collectionsModel.getCollectionById(req.params.id);
      
      if (!collection) {
        return res.status(404).json({ success: false, message: 'Collection not found' });
      }
      
      const assets = await collectionsModel.getCollectionAssets(req.params.id);
      
      // Format to match frontend expectations
      const formattedAssets = assets.map(asset => ({
        id: asset.id,
        name: asset.name,
        creator: asset.creator,
        description: asset.description,
        thumbnail: asset.thumbnail,
        dateAdded: asset.date_added,
        lastUsed: asset.last_used,
        fileSize: asset.file_size,
        filePath: asset.file_path,
        downloadUrl: asset.download_url,
        version: asset.version,
        type: asset.type,
        favorited: asset.favorited === 1,
        notes: asset.notes,
        tags: asset.tags || [],
        compatibleWith: asset.compatibleWith || [],
        dateAddedToCollection: asset.dateAddedToCollection
      }));
      
      res.json({ success: true, data: formattedAssets });
    } catch (err) {
      console.error('Error getting collection assets:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   GET /api/collections/avatar/:avatarId
 * @desc    Get collections linked to an avatar
 * @access  Public
 */
router.get('/avatar/:avatarId',
  param('avatarId').isInt().withMessage('Avatar ID must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const collections = await collectionsModel.getAvatarCollections(req.params.avatarId);
      
      // Format to match frontend expectations
      const formattedCollections = collections.map(collection => ({
        id: collection.id,
        name: collection.name,
        description: collection.description,
        thumbnail: collection.thumbnail,
        dateCreated: collection.date_created,
        folderPath: collection.folder_path,
        itemCount: collection.item_count,
        linkedAvatarId: parseInt(req.params.avatarId)
      }));
      
      res.json({ success: true, data: formattedCollections });
    } catch (err) {
      console.error('Error getting avatar collections:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   POST /api/collections
 * @desc    Create a new collection
 * @access  Public
 */
router.post('/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('thumbnail').notEmpty().withMessage('Thumbnail is required'),
    body('avatarId').optional().isInt().withMessage('Avatar ID must be an integer if provided')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const collection = await collectionsModel.createCollection(req.body);
      
      // If collection was created with an avatar link, include that in the response
      let linkedAvatar = null;
      if (collection.linkedAvatarId) {
        linkedAvatar = await avatarsModel.getAvatarById(collection.linkedAvatarId);
      }
      
      const responseData = {
        ...collection,
        linkedAvatar: linkedAvatar ? {
          id: linkedAvatar.id,
          name: linkedAvatar.name,
          thumbnail: linkedAvatar.thumbnail,
          base: linkedAvatar.base
        } : null
      };
      
      res.status(201).json({ success: true, data: responseData });
    } catch (err) {
      console.error('Error creating collection:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   PUT /api/collections/:id
 * @desc    Update a collection
 * @access  Public
 */
router.put('/:id',
  [
    param('id').isInt().withMessage('Collection ID must be an integer'),
    body('name').notEmpty().withMessage('Name is required'),
    body('avatarId').optional({ nullable: true }).isInt().withMessage('Avatar ID must be an integer if provided')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const success = await collectionsModel.updateCollection(req.params.id, req.body);
      
      if (!success) {
        return res.status(404).json({ success: false, message: 'Collection not found' });
      }
      
      // Get the updated collection
      const updatedCollection = await collectionsModel.getCollectionById(req.params.id);
      
      // Get linked avatar if there is one
      let linkedAvatar = null;
      if (updatedCollection.linked_avatar_id) {
        linkedAvatar = await avatarsModel.getAvatarById(updatedCollection.linked_avatar_id);
      }
      
      // Format to match frontend expectations
      const formattedCollection = {
        id: updatedCollection.id,
        name: updatedCollection.name,
        description: updatedCollection.description,
        thumbnail: updatedCollection.thumbnail,
        dateCreated: updatedCollection.date_created,
        folderPath: updatedCollection.folder_path,
        itemCount: updatedCollection.item_count,
        linkedAvatarId: updatedCollection.linked_avatar_id,
        linkedAvatar: linkedAvatar ? {
          id: linkedAvatar.id,
          name: linkedAvatar.name,
          thumbnail: linkedAvatar.thumbnail,
          base: linkedAvatar.base
        } : null
      };
      
      res.json({ success: true, data: formattedCollection });
    } catch (err) {
      console.error('Error updating collection:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   DELETE /api/collections/:id
 * @desc    Delete a collection
 * @access  Public
 */
router.delete('/:id',
  param('id').isInt().withMessage('Collection ID must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const success = await collectionsModel.deleteCollection(req.params.id);
      
      if (!success) {
        return res.status(404).json({ success: false, message: 'Collection not found' });
      }
      
      res.json({ success: true, message: 'Collection deleted' });
    } catch (err) {
      console.error('Error deleting collection:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   POST /api/collections/:id/link/:avatarId
 * @desc    Link a collection to an avatar
 * @access  Public
 */
router.post('/:id/link/:avatarId',
  [
    param('id').isInt().withMessage('Collection ID must be an integer'),
    param('avatarId').isInt().withMessage('Avatar ID must be an integer')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const success = await collectionsModel.linkToAvatar(req.params.id, req.params.avatarId);
      
      if (!success) {
        return res.status(404).json({ success: false, message: 'Collection or avatar not found' });
      }
      
      res.json({ success: true, message: 'Collection linked to avatar' });
    } catch (err) {
      console.error('Error linking collection to avatar:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   DELETE /api/collections/:id/link/:avatarId
 * @desc    Unlink a collection from an avatar
 * @access  Public
 */
router.delete('/:id/link/:avatarId',
  [
    param('id').isInt().withMessage('Collection ID must be an integer'),
    param('avatarId').isInt().withMessage('Avatar ID must be an integer')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const success = await collectionsModel.unlinkFromAvatar(req.params.id, req.params.avatarId);
      
      if (!success) {
        return res.status(404).json({ success: false, message: 'Collection or avatar not found or not linked' });
      }
      
      res.json({ success: true, message: 'Collection unlinked from avatar' });
    } catch (err) {
      console.error('Error unlinking collection from avatar:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   POST /api/collections/:id/assets
 * @desc    Add asset to collection
 * @access  Public
 */
router.post('/:id/assets',
  [
    param('id').isInt().withMessage('Collection ID must be an integer'),
    body('assetId').isInt().withMessage('Asset ID must be an integer')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const success = await collectionsModel.addAssetToCollection(req.params.id, req.body.assetId);
      
      res.json({ success: true, message: 'Asset added to collection' });
    } catch (err) {
      console.error('Error adding asset to collection:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   POST /api/collections/:id/assets/batch
 * @desc    Add multiple assets to collection
 * @access  Public
 */
router.post('/:id/assets/batch',
  [
    param('id').isInt().withMessage('Collection ID must be an integer'),
    body('assetIds').isArray().withMessage('Asset IDs must be an array')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const success = await collectionsModel.addAssetsToCollection(req.params.id, req.body.assetIds);
      
      res.json({ success: true, message: 'Assets added to collection' });
    } catch (err) {
      console.error('Error adding assets to collection:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   DELETE /api/collections/:id/assets/:assetId
 * @desc    Remove asset from collection
 * @access  Public
 */
router.delete('/:id/assets/:assetId',
  [
    param('id').isInt().withMessage('Collection ID must be an integer'),
    param('assetId').isInt().withMessage('Asset ID must be an integer')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const success = await collectionsModel.removeAssetFromCollection(req.params.id, req.params.assetId);
      
      if (!success) {
        return res.status(404).json({ success: false, message: 'Asset not found in collection' });
      }
      
      res.json({ success: true, message: 'Asset removed from collection' });
    } catch (err) {
      console.error('Error removing asset from collection:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

module.exports = router;