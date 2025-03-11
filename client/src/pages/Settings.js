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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { motion } from 'framer-motion';
import FolderIcon from '@mui/icons-material/Folder';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '../context/ThemeContext';
import { SUPPORTED_CURRENCIES } from '../utils/currencyUtils';

// Import API context
import { useApi } from '../context/ApiContext';

const Settings = () => {
  const { mode, toggleTheme } = useTheme();
  const { settings, loading, errors, updateSettings } = useApi();
  
  const [formSettings, setFormSettings] = useState(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Initialize form with settings from API
  useEffect(() => {
    if (Object.keys(settings).length > 0) {
      setFormSettings(settings);
    }
  }, [settings]);

  const handleSettingChange = (setting, value) => {
    setFormSettings({
      ...formSettings,
      [setting]: value
    });
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettings(formSettings);
      setSaveSuccess(true);
      setSaveError(null);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveError(error.message || 'Failed to save settings');
    }
  };

  const handleResetSettings = () => {
    // Reset to initial values
    setFormSettings(settings);
    setShowResetConfirm(false);
  };

  const handleCloseSaveSuccess = () => {
    setSaveSuccess(false);
  };

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
              disabled={loading.settings}
            >
              {loading.settings ? <CircularProgress size={24} /> : 'Save Settings'}
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

      {saveError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {saveError}
        </Alert>
      )}
      
      {errors.settings && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.settings}
        </Alert>
      )}
      
      {loading.settings && !formSettings ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
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
                  value={formSettings?.defaultAvatarPath || ''}
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
                  value={formSettings?.defaultAssetsPath || ''}
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
                  value={formSettings?.unityPath || ''}
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
                      checked={formSettings?.showFilePaths || false}
                      onChange={(e) => handleSettingChange('showFilePaths', e.target.checked)}
                    />
                  } 
                  label="Show File Paths" 
                />
                <FormControlLabel 
                  control={
                    <Switch 
                      checked={formSettings?.autoSync || false}
                      onChange={(e) => handleSettingChange('autoSync', e.target.checked)}
                    />
                  } 
                  label="Auto Sync" 
                />
              </Box>
              <Typography variant="h3" sx={{ mb: 2, mt: 3 }}>Currency Settings</Typography>
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel id="currency-select-label">Preferred Currency</InputLabel>
                  <Select
                    labelId="currency-select-label"
                    id="currency-select"
                    value={formSettings.currency_preference || 'USD'}
                    onChange={(e) => handleSettingChange('currency_preference', e.target.value)}
                    label="Preferred Currency"
                  >
                    {SUPPORTED_CURRENCIES.map((currency) => (
                      <MenuItem key={currency.code} value={currency.code}>
                        {currency.symbol} - {currency.name} ({currency.code})
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    This will be used as the default currency for all asset prices
                  </FormHelperText>
                </FormControl>
              </Box>
            </Paper>
          </motion.div>
        </>
      )}
      
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