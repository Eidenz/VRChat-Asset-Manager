// server/routes/settings.js - Settings routes
const express = require('express');
const router = express.Router();
const settingsModel = require('../models/settings');
const { body, param, validationResult } = require('express-validator');

/**
 * @route   GET /api/settings
 * @desc    Get all settings
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const settings = await settingsModel.getAllSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    console.error('Error getting settings:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/settings/:key
 * @desc    Get setting by key
 * @access  Public
 */
router.get('/:key',
  param('key').notEmpty().withMessage('Setting key is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const value = await settingsModel.getSetting(req.params.key);
      
      if (value === null) {
        return res.status(404).json({ success: false, message: 'Setting not found' });
      }
      
      res.json({ success: true, data: { key: req.params.key, value } });
    } catch (err) {
      console.error('Error getting setting:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   PUT /api/settings/:key
 * @desc    Update a setting
 * @access  Public
 */
router.put('/:key',
  [
    param('key').notEmpty().withMessage('Setting key is required'),
    body('value').exists().withMessage('Setting value is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const success = await settingsModel.updateSetting(req.params.key, req.body.value);
      
      res.json({ 
        success: true, 
        message: 'Setting updated',
        data: { key: req.params.key, value: req.body.value }
      });
    } catch (err) {
      console.error('Error updating setting:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   POST /api/settings
 * @desc    Update multiple settings
 * @access  Public
 */
router.post('/',
  body().isObject().withMessage('Request body must be an object'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const success = await settingsModel.updateSettings(req.body);
      
      res.json({ 
        success: true, 
        message: 'Settings updated',
        data: req.body
      });
    } catch (err) {
      console.error('Error updating settings:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

module.exports = router;