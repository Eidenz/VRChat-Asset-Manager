// server/routes/avatars.js - Updated to include linked collections
const express = require('express');
const router = express.Router();
const avatarsModel = require('../models/avatars');
const { body, param, validationResult } = require('express-validator');

/**
 * @route   GET /api/avatars
 * @desc    Get all avatars
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const avatars = await avatarsModel.getAllAvatars();
    
    // Convert favorited from 0/1 to boolean
    const formattedAvatars = avatars.map(avatar => ({
      ...avatar,
      id: avatar.id,
      name: avatar.name,
      base: avatar.base,
      thumbnail: avatar.thumbnail,
      dateAdded: avatar.date_added,
      lastUsed: avatar.last_used,
      filePath: avatar.file_path,
      notes: avatar.notes,
      favorited: avatar.favorited === 1,
      isCurrent: avatar.is_current === 1,
      linkedCollectionsCount: avatar.linked_collections_count || 0
    }));
    
    res.json({ success: true, data: formattedAvatars });
  } catch (err) {
    console.error('Error getting avatars:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/avatars/:id
 * @desc    Get avatar by ID
 * @access  Public
 */
router.get('/:id', 
  param('id').isInt().withMessage('Avatar ID must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const avatar = await avatarsModel.getAvatarById(req.params.id);
      
      if (!avatar) {
        return res.status(404).json({ success: false, message: 'Avatar not found' });
      }
      
      // Format the avatar data to match frontend expectations
      const formattedAvatar = {
        ...avatar,
        id: avatar.id,
        name: avatar.name,
        base: avatar.base,
        thumbnail: avatar.thumbnail,
        dateAdded: avatar.date_added,
        lastUsed: avatar.last_used,
        filePath: avatar.file_path,
        notes: avatar.notes,
        favorited: avatar.favorited === 1,
        isCurrent: avatar.is_current === 1,
        linkedCollectionsCount: avatar.linked_collections_count || 0
      };
      
      res.json({ success: true, data: formattedAvatar });
    } catch (err) {
      console.error('Error getting avatar:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   GET /api/avatars/:id/collections
 * @desc    Get collections linked to an avatar
 * @access  Public
 */
router.get('/:id/collections', 
  param('id').isInt().withMessage('Avatar ID must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const collections = await avatarsModel.getLinkedCollections(req.params.id);
      
      // Format collections to match frontend expectations
      const formattedCollections = collections.map(collection => ({
        id: collection.id,
        name: collection.name,
        description: collection.description,
        thumbnail: collection.thumbnail,
        dateCreated: collection.date_created,
        folderPath: collection.folder_path,
        itemCount: collection.item_count,
        linkedAvatarId: parseInt(req.params.id)
      }));
      
      res.json({ success: true, data: formattedCollections });
    } catch (err) {
      console.error('Error getting linked collections:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   POST /api/avatars
 * @desc    Create a new avatar
 * @access  Public
 */
router.post('/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('base').notEmpty().withMessage('Base is required'),
    body('thumbnail').notEmpty().withMessage('Thumbnail is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const avatar = await avatarsModel.createAvatar(req.body);
      res.status(201).json({ success: true, data: avatar });
    } catch (err) {
      console.error('Error creating avatar:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   PUT /api/avatars/:id
 * @desc    Update an avatar
 * @access  Public
 */
router.put('/:id',
  [
    param('id').isInt().withMessage('Avatar ID must be an integer'),
    body('name').notEmpty().withMessage('Name is required'),
    body('base').notEmpty().withMessage('Base is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const success = await avatarsModel.updateAvatar(req.params.id, req.body);
      
      if (!success) {
        return res.status(404).json({ success: false, message: 'Avatar not found' });
      }
      
      // Get the updated avatar
      const updatedAvatar = await avatarsModel.getAvatarById(req.params.id);
      
      // Format the avatar data to match frontend expectations
      const formattedAvatar = {
        ...updatedAvatar,
        id: updatedAvatar.id,
        name: updatedAvatar.name,
        base: updatedAvatar.base,
        thumbnail: updatedAvatar.thumbnail,
        dateAdded: updatedAvatar.date_added,
        lastUsed: updatedAvatar.last_used,
        filePath: updatedAvatar.file_path,
        notes: updatedAvatar.notes,
        favorited: updatedAvatar.favorited === 1,
        isCurrent: updatedAvatar.is_current === 1,
        linkedCollectionsCount: updatedAvatar.linked_collections_count || 0
      };
      
      res.json({ success: true, data: formattedAvatar });
    } catch (err) {
      console.error('Error updating avatar:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   PUT /api/avatars/:id/current
 * @desc    Toggle avatar current status
 * @access  Public
 */
router.put('/:id/current',
  param('id').isInt().withMessage('Avatar ID must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const result = await avatarsModel.toggleCurrentStatus(req.params.id);
      
      res.json({
        success: result.success,
        isCurrent: result.isCurrent,
        message: result.isCurrent ? 
          'Avatar set as current' : 
          'Avatar removed from current'
      });
    } catch (err) {
      console.error('Error toggling avatar current status:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   PUT /api/avatars/:id/favorite
 * @desc    Toggle avatar favorite status
 * @access  Public
 */
router.put('/:id/favorite',
  param('id').isInt().withMessage('Avatar ID must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const result = await avatarsModel.toggleFavorite(req.params.id);
      
      res.json({
        success: result.success,
        favorited: result.favorited,
        message: result.favorited ? 'Avatar added to favorites' : 'Avatar removed from favorites'
      });
    } catch (err) {
      console.error('Error toggling avatar favorite:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   DELETE /api/avatars/:id
 * @desc    Delete an avatar
 * @access  Public
 */
router.delete('/:id',
  param('id').isInt().withMessage('Avatar ID must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const success = await avatarsModel.deleteAvatar(req.params.id);
      
      if (!success) {
        return res.status(404).json({ success: false, message: 'Avatar not found' });
      }
      
      res.json({ success: true, message: 'Avatar deleted' });
    } catch (err) {
      console.error('Error deleting avatar:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   GET /api/avatars/bases/all
 * @desc    Get all avatar bases
 * @access  Public
 */
router.get('/bases/all', async (req, res) => {
  try {
    const bases = await avatarsModel.getAllAvatarBases();
    res.json({ success: true, data: bases });
  } catch (err) {
    console.error('Error getting avatar bases:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/avatars/bases
 * @desc    Create a new avatar base
 * @access  Public
 */
router.post('/bases',
  [
    body('name').notEmpty().withMessage('Base name is required'),
    body('id').optional().isString().withMessage('Base ID must be a string')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const { name, id } = req.body;
      const baseId = id || name.toLowerCase().replace(/\s+/g, '');
      
      const newBase = await avatarsModel.createAvatarBase({ id: baseId, name });
      res.status(201).json({ success: true, data: newBase });
    } catch (error) {
      console.error('Error creating avatar base:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

module.exports = router;