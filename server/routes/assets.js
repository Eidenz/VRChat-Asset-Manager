// server/routes/assets.js - Asset routes
const express = require('express');
const router = express.Router();
const assetsModel = require('../models/assets');
const { body, param, query, validationResult } = require('express-validator');

/**
 * Format an asset from the database for API response
 * @param {Object} asset - Asset from database
 * @returns {Object} Formatted asset
 */
const formatAsset = (asset) => {
  return {
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
    compatibleWith: asset.compatibleWith || []
  };
};

/**
 * @route   GET /api/assets
 * @desc    Get all assets
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const assets = await assetsModel.getAllAssets();
    const formattedAssets = assets.map(formatAsset);
    
    res.json({ success: true, data: formattedAssets });
  } catch (err) {
    console.error('Error getting assets:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/assets/recent
 * @desc    Get recently added assets
 * @access  Public
 */
router.get('/recent', 
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    
    try {
      const assets = await assetsModel.getRecentAssets(limit);
      const formattedAssets = assets.map(formatAsset);
      
      res.json({ success: true, data: formattedAssets });
    } catch (err) {
      console.error('Error getting recent assets:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   GET /api/assets/favorites
 * @desc    Get favorited assets
 * @access  Public
 */
router.get('/favorites', async (req, res) => {
  try {
    const assets = await assetsModel.getFavoritedAssets();
    const formattedAssets = assets.map(formatAsset);
    
    res.json({ success: true, data: formattedAssets });
  } catch (err) {
    console.error('Error getting favorited assets:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/assets/types/:type
 * @desc    Get assets by type
 * @access  Public
 */
router.get('/types/:type', 
  param('type').notEmpty().withMessage('Type is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const assets = await assetsModel.getAssetsByType(req.params.type);
      const formattedAssets = assets.map(formatAsset);
      
      res.json({ success: true, data: formattedAssets });
    } catch (err) {
      console.error('Error getting assets by type:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   GET /api/assets/:id
 * @desc    Get asset by ID
 * @access  Public
 */
router.get('/:id', 
  param('id').isInt().withMessage('Asset ID must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const asset = await assetsModel.getAssetById(req.params.id);
      
      if (!asset) {
        return res.status(404).json({ success: false, message: 'Asset not found' });
      }
      
      const formattedAsset = formatAsset(asset);
      
      res.json({ success: true, data: formattedAsset });
    } catch (err) {
      console.error('Error getting asset:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   POST /api/assets
 * @desc    Create a new asset
 * @access  Public
 */
router.post('/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('creator').notEmpty().withMessage('Creator is required'),
    body('thumbnail').notEmpty().withMessage('Thumbnail is required'),
    body('type').notEmpty().withMessage('Type is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const asset = await assetsModel.createAsset(req.body);
      res.status(201).json({ success: true, data: asset });
    } catch (err) {
      console.error('Error creating asset:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   PUT /api/assets/:id
 * @desc    Update an asset
 * @access  Public
 */
router.put('/:id',
  [
    param('id').isInt().withMessage('Asset ID must be an integer'),
    body('name').notEmpty().withMessage('Name is required'),
    body('creator').notEmpty().withMessage('Creator is required'),
    body('type').notEmpty().withMessage('Type is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const success = await assetsModel.updateAsset(req.params.id, req.body);
      
      if (!success) {
        return res.status(404).json({ success: false, message: 'Asset not found' });
      }
      
      // Get the updated asset
      const updatedAsset = await assetsModel.getAssetById(req.params.id);
      const formattedAsset = formatAsset(updatedAsset);
      
      res.json({ success: true, data: formattedAsset });
    } catch (err) {
      console.error('Error updating asset:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   PUT /api/assets/:id/used
 * @desc    Update asset last used date
 * @access  Public
 */
router.put('/:id/used',
  param('id').isInt().withMessage('Asset ID must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const success = await assetsModel.updateAssetLastUsed(req.params.id);
      
      if (!success) {
        return res.status(404).json({ success: false, message: 'Asset not found' });
      }
      
      res.json({ success: true, message: 'Asset last used date updated' });
    } catch (err) {
      console.error('Error updating asset last used date:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   PUT /api/assets/:id/favorite
 * @desc    Toggle asset favorite status
 * @access  Public
 */
router.put('/:id/favorite',
  param('id').isInt().withMessage('Asset ID must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const result = await assetsModel.toggleFavorite(req.params.id);
      
      res.json({
        success: result.success,
        favorited: result.favorited,
        message: result.favorited ? 'Asset added to favorites' : 'Asset removed from favorites'
      });
    } catch (err) {
      console.error('Error toggling asset favorite:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   DELETE /api/assets/:id
 * @desc    Delete an asset
 * @access  Public
 */
router.delete('/:id',
  param('id').isInt().withMessage('Asset ID must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const success = await assetsModel.deleteAsset(req.params.id);
      
      if (!success) {
        return res.status(404).json({ success: false, message: 'Asset not found' });
      }
      
      res.json({ success: true, message: 'Asset deleted' });
    } catch (err) {
      console.error('Error deleting asset:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   GET /api/assets/types/all
 * @desc    Get all asset types
 * @access  Public
 */
router.get('/types/all', async (req, res) => {
  try {
    const types = await assetsModel.getAllAssetTypes();
    res.json({ success: true, data: types });
  } catch (err) {
    console.error('Error getting asset types:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/assets/tags/all
 * @desc    Get all tags
 * @access  Public
 */
router.get('/tags/all', async (req, res) => {
  try {
    const tags = await assetsModel.getAllTags();
    res.json({ success: true, data: tags });
  } catch (err) {
    console.error('Error getting tags:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;