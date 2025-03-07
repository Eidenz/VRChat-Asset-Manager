// server/routes/collections.js - Collection routes
const express = require('express');
const router = express.Router();
const collectionsModel = require('../models/collections');
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
    const formattedCollections = collections.map(collection => ({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      thumbnail: collection.thumbnail,
      dateCreated: collection.date_created,
      folderPath: collection.folder_path,
      itemCount: collection.item_count
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
      
      // Format to match frontend expectations
      const formattedCollection = {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        thumbnail: collection.thumbnail,
        dateCreated: collection.date_created,
        folderPath: collection.folder_path,
        itemCount: collection.item_count
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
 * @route   POST /api/collections
 * @desc    Create a new collection
 * @access  Public
 */
router.post('/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('thumbnail').notEmpty().withMessage('Thumbnail is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const collection = await collectionsModel.createCollection(req.body);
      res.status(201).json({ success: true, data: collection });
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
    body('name').notEmpty().withMessage('Name is required')
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
      
      // Format to match frontend expectations
      const formattedCollection = {
        id: updatedCollection.id,
        name: updatedCollection.name,
        description: updatedCollection.description,
        thumbnail: updatedCollection.thumbnail,
        dateCreated: updatedCollection.date_created,
        folderPath: updatedCollection.folder_path,
        itemCount: updatedCollection.item_count
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