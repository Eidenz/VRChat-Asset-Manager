// src/components/features/CompatibilityChecker.js
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Tooltip,
  Snackbar
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import VerifiedIcon from '@mui/icons-material/Verified';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import { styled } from '@mui/material/styles';

// Import API context
import { useApi } from '../../context/ApiContext';

const ResultItem = styled(Box)(({ theme, status }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: 
    status === 'yes' ? 'rgba(0, 184, 148, 0.1)' : 
    status === 'mostly' || status === 'partial' ? 'rgba(253, 203, 110, 0.1)' : 
    status === 'no' ? 'rgba(231, 76, 60, 0.1)' : 'transparent',
  marginBottom: theme.spacing(1),
}));

// Asset card for the compatible assets list
const AssetCard = styled(Card)(({ theme, owned }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  transition: 'transform 0.2s ease-in-out',
  cursor: 'pointer',  // Add cursor pointer to indicate it's clickable
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
  },
  ...(owned === false && {
    opacity: 0.7,
    border: '1px dashed rgba(255,255,255,0.2)',
  }),
}));

const OwnershipBadge = styled(Box)(({ theme, owned }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  padding: '4px 8px',
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 12,
  fontWeight: 500,
  backgroundColor: owned ? theme.palette.success.main : theme.palette.error.main,
  color: '#fff',
  zIndex: 1,
}));

// Download button overlay
const DownloadOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.2s ease-in-out',
  zIndex: 2,
  '&:hover': {
    opacity: 1,
  },
}));

// Note: In the future, this could be fetched from the backend
// For now, we'll keep it in the component as a fallback
const compatibilityMatrix = {
  'Feline3.0': {
    'HumanMale4.2': {
      boneStructure: 'partial',
      materials: 'yes',
      animations: 'partial',
      notes: 'Limb proportions differ significantly'
    },
    'HumanFemale4.2': {
      boneStructure: 'partial',
      materials: 'yes',
      animations: 'partial',
      notes: 'Limb proportions differ significantly'
    },
    'Fantasy2.0': {
      boneStructure: 'mostly',
      materials: 'yes',
      animations: 'mostly',
      notes: 'Good compatibility overall with minor adjustments'
    }
  },
  'HumanMale4.2': {
    'HumanFemale4.2': {
      boneStructure: 'yes',
      materials: 'yes',
      animations: 'yes',
      notes: 'Excellent compatibility with minimal adjustments'
    },
    'HumanSlim3.1': {
      boneStructure: 'mostly',
      materials: 'yes',
      animations: 'mostly',
      notes: 'Some scaling needed for best results'
    }
  }
};

const CompatibilityChecker = () => {
  // Use the API context
  const { avatars, assets, loading, errors, assetsAPI } = useApi();

  const [sourceAvatar, setSourceAvatar] = useState('');
  const [asset, setAsset] = useState('');
  const [avatarBase, setAvatarBase] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [compatibleAssets, setCompatibleAssets] = useState([]);
  const [mode, setMode] = useState('list'); // 'asset' or 'list'
  const [compatibilityData, setCompatibilityData] = useState(compatibilityMatrix);
  const [searchAttempted, setSearchAttempted] = useState(false);
  // Add a state for notifications
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Get all assets from api context
  const allAssets = assets.all || [];
  const allAvatars = avatars || [];

  // Extract all unique avatar bases from avatars
  const uniqueBases = [...new Set(allAvatars.map(avatar => avatar.base))];

  const handleSourceAvatarChange = (event) => {
    setSourceAvatar(event.target.value);
    setResults(null);
  };

  const handleAssetChange = (event) => {
    setAsset(event.target.value);
    setResults(null);
  };

  const handleAvatarBaseChange = (event) => {
    setAvatarBase(event.target.value);
    setCompatibleAssets([]);
    setResults(null);
    setSearchAttempted(false); // Reset search attempted flag
  };

  const handleModeChange = (event) => {
    setMode(event.target.value);
    setResults(null);
    setCompatibleAssets([]);
    setSearchAttempted(false);
    setSourceAvatar('');
    setAsset('');
    setAvatarBase('');
  };

  const findCompatibleAssets = () => {
    if (!avatarBase) return;
    
    setLocalLoading(true);
    
    try {
      // Filter assets that are compatible with the selected avatar base
      const compatible = allAssets.filter(asset => {
        
        // Handle case where compatibleWith is not an array or is undefined
        if (!asset.compatibleWith || !Array.isArray(asset.compatibleWith)) {
          return false;
        }
        
        // Check each base in the compatibleWith array
        for (const base of asset.compatibleWith) {
          if (base.toLowerCase() === avatarBase.toLowerCase()) {
            return true;
          }
        }
        
        return false;
      });
      
      // Map compatible assets to include owned status
      const enhancedCompatibleAssets = compatible.map(asset => {
        // Check if this asset's ownedVariant array includes the selected avatarBase
        let owned = false;
        
        if (asset.ownedVariant) {
          if (Array.isArray(asset.ownedVariant)) {
            // If ownedVariant is an array, check if the selected base is in it
            owned = asset.ownedVariant.some(variant => 
              variant.toLowerCase() === avatarBase.toLowerCase()
            );
          } else {
            // If ownedVariant is a string, compare directly
            owned = asset.ownedVariant.toLowerCase() === avatarBase.toLowerCase();
          }
        }
        
        return { ...asset, owned };
      });
      
      setCompatibleAssets(enhancedCompatibleAssets);
    } catch (error) {
      console.error('Error finding compatible assets:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const checkCompatibility = async () => {
    // For list mode, directly call findCompatibleAssets and return
    if (mode === 'list') {
      setSearchAttempted(true);
      findCompatibleAssets();
      return;
    }
    
    // For asset mode, proceed with regular checks
    if (!sourceAvatar || !asset) return;
    
    setLocalLoading(true);
    
    try {
      // In a future implementation, this could be an API call
      // For now, we'll handle the check locally
      
      let mockResults;
      
      // Check asset compatibility with avatar
      const selectedAsset = allAssets.find(a => a.id.toString() === asset);
      if (!selectedAsset) {
        setLocalLoading(false);
        return;
      }
      
      const selectedAvatar = allAvatars.find(a => a.id.toString() === sourceAvatar);
      if (!selectedAvatar) {
        setLocalLoading(false);
        return;
      }
      
      // Use actual compatibility check - no more simulation
      const isCompatible = selectedAsset.compatibleWith && 
                           selectedAsset.compatibleWith.some(base => 
                             base.toLowerCase() === selectedAvatar.base.toLowerCase()
                           );
      
      // Use actual owned variant check
      const isOwned = selectedAsset.ownedVariant &&
                      (Array.isArray(selectedAsset.ownedVariant)
                        ? selectedAsset.ownedVariant.some(variant =>
                            variant.toLowerCase() === selectedAvatar.base.toLowerCase()
                          )
                        : selectedAsset.ownedVariant.toLowerCase() === selectedAvatar.base.toLowerCase()
                      );
      
      mockResults = {
        overall: isCompatible ? 'yes' : 'partial',
        owned: isOwned
      };
      
      setResults(mockResults);
    } catch (error) {
      console.error('Error checking compatibility:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const getStatusSeverity = (status) => {
    switch(status) {
      case 'yes': return 'success';
      case 'mostly': 
      case 'partial': return 'warning';
      case 'no': return 'error';
      case 'unknown':
      case 'info':
      default: return 'info';
    }
  };

  // Updated handler for asset card click to open download link
  const handleAssetCardClick = async (assetId) => {
    // Find the asset from the compatible assets
    const selectedAsset = compatibleAssets.find(asset => asset.id === assetId);
    
    if (selectedAsset) {
      try {
        // Check if download URL exists
        if (selectedAsset.downloadUrl) {
          // Open the download URL in a new tab
          window.open(selectedAsset.downloadUrl, '_blank');
        } else {
          // Show notification that there's no download link
          setNotification({
            open: true,
            message: 'No download link available for this asset',
            severity: 'warning'
          });
        }
      } catch (error) {
        console.error('Error handling asset click:', error);
        setNotification({
          open: true,
          message: 'Error opening download link',
          severity: 'error'
        });
      }
    }
  };

  // Close notification handler
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Show loading state if loading data from API
  if (loading.avatars || loading.assets) {
    return (
      <Paper sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 3 }}>
        <Typography variant="h2" sx={{ mb: 2 }}>Compatibility Checker</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  // Show error state if there's an API error
  if (errors.avatars || errors.assets) {
    return (
      <Paper sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 3 }}>
        <Typography variant="h2" sx={{ mb: 2 }}>Compatibility Checker</Typography>
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.avatars || errors.assets}
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 3 }}>
      <Typography variant="h2" sx={{ mb: 2 }}>Compatibility Checker</Typography>
      
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="mode-select-label">What do you want to check?</InputLabel>
          <Select
            labelId="mode-select-label"
            id="mode-select"
            value={mode}
            onChange={handleModeChange}
            label="What do you want to check?"
          >
            <MenuItem value="list">List all compatible assets for an avatar base</MenuItem>
            <MenuItem value="asset">Asset compatibility with an avatar</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Different input fields based on mode */}
      {mode === 'list' && (
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="avatar-base-select-label">Avatar Base</InputLabel>
            <Select
              labelId="avatar-base-select-label"
              id="avatar-base-select"
              value={avatarBase}
              onChange={handleAvatarBaseChange}
              label="Avatar Base"
            >
              <MenuItem value=""><em>Select an avatar base</em></MenuItem>
              {uniqueBases.map((base) => (
                <MenuItem key={base} value={base}>
                  {base}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button 
            variant="contained" 
            fullWidth 
            sx={{ mt: 2 }}
            disabled={localLoading || !avatarBase}
            onClick={checkCompatibility}
          >
            {localLoading ? <CircularProgress size={24} color="inherit" /> : 'Find Compatible Assets'}
          </Button>
        </Box>
      )}
      
      {mode === 'asset' && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="source-avatar-select-label">Your Avatar</InputLabel>
              <Select
                labelId="source-avatar-select-label"
                id="source-avatar-select"
                value={sourceAvatar}
                onChange={handleSourceAvatarChange}
                label="Your Avatar"
              >
                <MenuItem value=""><em>Select an avatar</em></MenuItem>
                {avatars.map((avatar) => (
                  <MenuItem key={avatar.id} value={avatar.id.toString()}>
                    {avatar.name} ({avatar.base})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="asset-select-label">Asset to Check</InputLabel>
              <Select
                labelId="asset-select-label"
                id="asset-select"
                value={asset}
                onChange={handleAssetChange}
                label="Asset to Check"
              >
                <MenuItem value=""><em>Select an asset</em></MenuItem>
                {allAssets.map((asset) => (
                  <MenuItem key={asset.id} value={asset.id.toString()}>
                    {asset.name} ({asset.type})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button 
              variant="contained" 
              fullWidth 
              disabled={localLoading || !sourceAvatar || !asset}
              onClick={checkCompatibility}
            >
              {localLoading ? <CircularProgress size={24} color="inherit" /> : 'Check Compatibility'}
            </Button>
          </Grid>
        </Grid>
      )}
      
      {/* Compatible Assets List (for "list" mode) */}
      {mode === 'list' && compatibleAssets.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h3">Compatible Assets for {avatarBase}</Typography>
            <Chip 
              label={`${compatibleAssets.length} assets found`} 
              color="primary" 
            />
          </Box>
          
          <Grid container spacing={3}>
            {compatibleAssets.map((asset) => (
              <Grid item xs={12} sm={6} md={4} key={asset.id}>
                <Tooltip 
                  title={asset.downloadUrl ? "Click to open download link" : "No download link available"} 
                  arrow
                >
                  <AssetCard owned={asset.owned}>
                    <CardActionArea onClick={() => handleAssetCardClick(asset.id)}>
                      <OwnershipBadge owned={asset.owned}>
                        {asset.owned ? (
                          <>
                            <VerifiedIcon fontSize="small" />
                            Owned
                          </>
                        ) : (
                          <>
                            <CloseIcon fontSize="small" />
                            Not Owned
                          </>
                        )}
                      </OwnershipBadge>
                      
                      {/* Add download overlay that appears on hover */}
                      <DownloadOverlay>
                        <Button
                          variant="contained"
                          startIcon={<DownloadIcon />}
                          disabled={!asset.downloadUrl}
                        >
                          Download
                        </Button>
                      </DownloadOverlay>
                      
                      <CardMedia
                        component="img"
                        height="140"
                        image={asset.thumbnail}
                        alt={asset.name}
                      />
                      <CardContent>
                        <Typography variant="h3">{asset.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {asset.type} • by {asset.creator}
                        </Typography>
                        <Box sx={{ display: 'flex', mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                          {asset.tags && asset.tags.slice(0, 2).map((tag, idx) => (
                            <Chip key={idx} label={tag} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </AssetCard>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      {/* Compatibility Results (for "asset" mode) */}
      {mode === 'asset' && results && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="h3" sx={{ mb: 2 }}>Compatibility Results</Typography>
          
          <Alert 
            severity={getStatusSeverity(results.overall)}
            sx={{ mb: 3 }}
          >
            {results.overall === 'yes'
              ? 'This asset is compatible with your avatar!'
              : results.overall === 'mostly'
              ? 'This asset is mostly compatible with your avatar with minor adjustments needed.'
              : results.overall === 'partial'
              ? 'This asset was not made for this avatar and will require significant adjustments.'
              : results.overall === 'no'
              ? 'This asset is not compatible with your avatar.'
              : 'Compatibility is unknown - you may need to test manually.'
            }
          </Alert>
          
          {/* Add ownership badge for asset mode */}
          {mode === 'asset' && results.owned !== undefined && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              p: 2, 
              borderRadius: 1,
              bgcolor: results.owned ? 'success.main' : 'error.main',
              color: 'white',
              mb: 3
            }}>
              {results.owned ? (
                <>
                  <VerifiedIcon sx={{ mr: 2 }} />
                  <Typography>
                    You own the correct variant of this asset for your avatar.
                  </Typography>
                </>
              ) : (
                <>
                  <CloseIcon sx={{ mr: 2 }} />
                  <Typography>
                    You do not own the specific variant of this asset for this avatar. You might need to purchase the correct variant.
                  </Typography>
                </>
              )}
            </Box>
          )}
        </Box>
      )}
      
      {/* Message when no compatible assets are found */}
      {mode === 'list' && avatarBase && compatibleAssets.length === 0 && !localLoading && searchAttempted && (
        <Alert severity="info" sx={{ mt: 3 }}>
          No compatible assets found for {avatarBase}. Try selecting a different avatar base.
        </Alert>
      )}
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        message={notification.message}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default CompatibilityChecker;