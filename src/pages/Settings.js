// src/pages/Settings.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  FormControlLabel,
  Switch,
  InputAdornment,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import FolderIcon from '@mui/icons-material/Folder';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '../context/ThemeContext';

// Import settings from mock data
import { settings as initialSettings } from '../data/mockData';

const Settings = () => {
  const { mode, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Load settings on mount
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Remove backup related settings
      const { backupFrequency, lastBackup, ...otherSettings } = initialSettings;
      setSettings(otherSettings);
      setLoading(false);
    }, 800);
  }, []);

  const handleSettingChange = (setting, value) => {
    setSettings({
      ...settings,
      [setting]: value
    });
  };

  const handleSaveSettings = () => {
    // Simulate API call
    setTimeout(() => {
      // In a real app, you'd save to a backend or localStorage
      console.log('Saving settings:', settings);
      setSaveSuccess(true);
    }, 500);
  };

  const handleResetSettings = () => {
    // Remove backup related settings
    const { backupFrequency, lastBackup, ...otherSettings } = initialSettings;
    setSettings(otherSettings);
    setShowResetConfirm(false);
  };

  const handleCloseSaveSuccess = () => {
    setSaveSuccess(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h1">Settings</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              color="inherit"
              startIcon={<RestoreIcon />}
              onClick={() => setShowResetConfirm(true)}
            >
              Reset Defaults
            </Button>
            <Button 
              variant="contained" 
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
            >
              Save Settings
            </Button>
          </Box>
        </Box>
      </motion.div>
      
      {showResetConfirm && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Box>
              <Button color="inherit" size="small" onClick={() => setShowResetConfirm(false)}>
                Cancel
              </Button>
              <Button color="warning" size="small" onClick={handleResetSettings}>
                Reset
              </Button>
            </Box>
          }
        >
          Are you sure you want to reset all settings to their default values? This cannot be undone.
        </Alert>
      )}
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h3" sx={{ mb: 2 }}>Path Settings</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField 
              label="Default Avatars Path" 
              fullWidth 
              value={settings.defaultAvatarPath}
              onChange={(e) => handleSettingChange('defaultAvatarPath', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FolderIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Select the folder where your VRChat avatars are stored">
                      <IconButton edge="end">
                        <HelpOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
            <TextField 
              label="Default Assets Path" 
              fullWidth 
              value={settings.defaultAssetsPath}
              onChange={(e) => handleSettingChange('defaultAssetsPath', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FolderIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Select the folder where your VRChat assets are stored">
                      <IconButton edge="end">
                        <HelpOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
            <TextField 
              label="Unity Editor Path" 
              fullWidth 
              value={settings.unityPath}
              onChange={(e) => handleSettingChange('unityPath', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FolderIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Path to your Unity Editor executable">
                      <IconButton edge="end">
                        <HelpOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Paper>
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Paper sx={{ p: 3 }}>
          <Typography variant="h3" sx={{ mb: 2 }}>Appearance</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel 
              control={
                <Switch 
                  checked={mode === 'dark'}
                  onChange={toggleTheme}
                />
              } 
              label="Dark Mode" 
            />
            <FormControlLabel 
              control={
                <Switch 
                  checked={settings.showFilePaths}
                  onChange={(e) => handleSettingChange('showFilePaths', e.target.checked)}
                />
              } 
              label="Show File Paths" 
            />
          </Box>
        </Paper>
      </motion.div>
      
      {/* Success snackbar */}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={handleCloseSaveSuccess}
        message="Settings saved successfully"
        action={
          <IconButton size="small" color="inherit" onClick={handleCloseSaveSuccess}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
};

export default Settings;