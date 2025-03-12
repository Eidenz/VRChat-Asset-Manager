// src/components/features/CompatibilityChecker.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Button,
  TextField,
  Pagination,
  FormControlLabel,
  Switch,
  Card,
  CardMedia,
  CardContent,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VerifiedIcon from '@mui/icons-material/Verified';
import { motion } from 'framer-motion';
import { useApi } from '../../context/ApiContext';

const ITEMS_PER_PAGE = 10; // Number of assets to show per page

const CompatibilityChecker = () => {
  const { avatars, assets, loading } = useApi();
  
  // Selected avatar state
  const [selectedAvatarId, setSelectedAvatarId] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  
  // Assets filtering state
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetTypes, setSelectedAssetTypes] = useState([]);
  
  // Available asset types
  const [assetTypes, setAssetTypes] = useState([]);
  
  // Mode selection: 'avatar' or 'single'
  const [mode, setMode] = useState('avatar');
  
  // Selected asset for individual compatibility check
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  
  // Only show compatible assets toggle
  const [showOnlyCompatible, setShowOnlyCompatible] = useState(true);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedAssets, setPaginatedAssets] = useState([]);
  
  // Filtered compatible assets
  const [compatibleAssets, setCompatibleAssets] = useState([]);

  // Set available asset types from all assets
  useEffect(() => {
    if (assets.all && assets.all.length > 0) {
      const types = [...new Set(assets.all.map(asset => asset.type))];
      setAssetTypes(types);
    }
  }, [assets.all]);

  // Handle avatar selection
  useEffect(() => {
    if (selectedAvatarId && avatars.length > 0) {
      const avatar = avatars.find(a => a.id === parseInt(selectedAvatarId));
      setSelectedAvatar(avatar);
    } else {
      setSelectedAvatar(null);
    }
  }, [selectedAvatarId, avatars]);

  // Handle asset selection for individual compatibility check
  useEffect(() => {
    if (selectedAssetId && assets.all && assets.all.length > 0) {
      const asset = assets.all.find(a => a.id === parseInt(selectedAssetId));
      setSelectedAsset(asset);
    } else {
      setSelectedAsset(null);
    }
  }, [selectedAssetId, assets.all]);

  // Filter assets based on search query, type filters, and compatibility option
  useEffect(() => {
    if (!assets.all) return;
    
    let filtered = [...assets.all];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(query) || 
        asset.creator.toLowerCase().includes(query) ||
        (asset.description && asset.description.toLowerCase().includes(query)) ||
        (asset.tags && asset.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Apply type filter
    if (selectedAssetTypes.length > 0) {
      filtered = filtered.filter(asset => selectedAssetTypes.includes(asset.type));
    }
    
    setFilteredAssets(filtered);
    
    // Filter compatible assets
    if (selectedAvatar) {
      const compatibleFiltered = filtered.filter(asset => 
        asset.compatibleWith && 
        asset.compatibleWith.includes(selectedAvatar.base)
      );
      setCompatibleAssets(compatibleFiltered);
      
      // Calculate total pages for pagination of compatible assets
      setTotalPages(Math.ceil(compatibleFiltered.length / ITEMS_PER_PAGE));
    } else {
      setCompatibleAssets([]);
      setTotalPages(1);
    }
    
    // Reset to first page when filters change
    setPage(1);
  }, [searchQuery, selectedAssetTypes, assets.all, selectedAvatar]);

  // Update paginated assets when page changes
  useEffect(() => {
    if (compatibleAssets.length > 0) {
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      setPaginatedAssets(compatibleAssets.slice(startIndex, endIndex));
    } else {
      setPaginatedAssets([]);
    }
  }, [compatibleAssets, page]);

  const handleAvatarChange = (event) => {
    setSelectedAvatarId(event.target.value);
  };

  const handleAssetChange = (event) => {
    setSelectedAssetId(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleAssetTypeToggle = (type) => {
    setSelectedAssetTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    // Reset pagination when changing modes
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleToggleCompatibleOnly = (event) => {
    setShowOnlyCompatible(event.target.checked);
  };

  // Check if an asset variant is owned
  const isVariantOwned = (asset) => {
    if (!asset.ownedVariant || !selectedAvatar) return false;
    
    if (Array.isArray(asset.ownedVariant)) {
      return asset.ownedVariant.includes(selectedAvatar.base);
    } else {
      return asset.ownedVariant === selectedAvatar.base;
    }
  };

  // Check compatibility between selected asset and selected avatar
  const checkSingleCompatibility = () => {
    if (!selectedAsset || !selectedAvatar) return null;
    
    const compatible = selectedAsset.compatibleWith && 
                      selectedAsset.compatibleWith.includes(selectedAvatar.base);
    
    const owned = selectedAsset.ownedVariant && (
      Array.isArray(selectedAsset.ownedVariant) 
        ? selectedAsset.ownedVariant.includes(selectedAvatar.base)
        : selectedAsset.ownedVariant === selectedAvatar.base
    );
    
    return { compatible, owned };
  };

  if (loading.assets || loading.avatars) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Typography variant="h2" sx={{ mb: 3 }}>Asset Compatibility Checker</Typography>
        
        {/* Mode Selection */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Button
            variant={mode === 'avatar' ? 'contained' : 'outlined'}
            onClick={() => handleModeChange('avatar')}
          >
            Select Avatar & View Compatible Assets
          </Button>
          <Button
            variant={mode === 'single' ? 'contained' : 'outlined'}
            onClick={() => handleModeChange('single')}
          >
            Check Single Asset & Avatar
          </Button>
        </Box>
        
        {/* Avatar Selection */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="avatar-select-label">Select Avatar</InputLabel>
          <Select
            labelId="avatar-select-label"
            value={selectedAvatarId}
            label="Select Avatar"
            onChange={handleAvatarChange}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {avatars.map((avatar) => (
              <MenuItem key={avatar.id} value={avatar.id}>
                {avatar.name} ({avatar.base})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {/* Asset Selection for Single Mode */}
        {mode === 'single' && (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="asset-select-label">Select Asset</InputLabel>
            <Select
              labelId="asset-select-label"
              value={selectedAssetId}
              label="Select Asset"
              onChange={handleAssetChange}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {assets.all && assets.all.map((asset) => (
                <MenuItem key={asset.id} value={asset.id}>
                  {asset.name} ({asset.type})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </motion.div>
      
      {/* Avatar View Mode */}
      {mode === 'avatar' ? (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {selectedAvatar ? (
            <Box>
              <Typography variant="h3" sx={{ mb: 2 }}>
                Compatible Assets for {selectedAvatar.name}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  component="img"
                  src={selectedAvatar.thumbnail}
                  alt={selectedAvatar.name}
                  sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    mr: 2,
                    objectFit: 'cover',
                    border: '2px solid',
                    borderColor: 'primary.main'
                  }}
                />
                <Box>
                  <Typography variant="h4">{selectedAvatar.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Base: {selectedAvatar.base}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  placeholder="Search compatible assets..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                <Typography sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                  <FilterListIcon sx={{ mr: 0.5 }} /> Filter by type:
                </Typography>
                {assetTypes.map((type) => (
                  <Chip
                    key={type}
                    label={type}
                    onClick={() => handleAssetTypeToggle(type)}
                    color={selectedAssetTypes.includes(type) ? 'primary' : 'default'}
                    variant={selectedAssetTypes.includes(type) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
              
              {compatibleAssets.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  No compatible assets found for the {selectedAvatar.base} avatar base.
                </Alert>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Found {compatibleAssets.length} compatible assets for the {selectedAvatar.base} avatar base.
                  </Typography>
                  
                  <List sx={{ bgcolor: 'background.paper', borderRadius: 2, mb: 3 }}>
                    {paginatedAssets.map((asset) => (
                      <React.Fragment key={asset.id}>
                        <ListItem alignItems="flex-start">
                          <ListItemIcon>
                            {isVariantOwned(asset) ? (
                              <Tooltip title="You own this variant">
                                <VerifiedIcon color="success" />
                              </Tooltip>
                            ) : (
                              <Tooltip title="Compatible but not owned">
                                <CheckCircleIcon color="primary" />
                              </Tooltip>
                            )}
                          </ListItemIcon>
                          <Box 
                            component="img"
                            src={asset.thumbnail}
                            alt={asset.name}
                            sx={{ 
                              width: 60, 
                              height: 60, 
                              borderRadius: 1, 
                              mr: 2,
                              objectFit: 'cover'
                            }}
                          />
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="h6">{asset.name}</Typography>
                                <Chip label={asset.type} size="small" />
                              </Box>
                            }
                            secondary={
                              <React.Fragment>
                                <Typography component="span" variant="body2" color="text.primary">
                                  Creator: {asset.creator}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                  {asset.description && asset.description.substring(0, 100)}
                                  {asset.description && asset.description.length > 100 && '...'}
                                </Typography>
                                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                  {isVariantOwned(asset) ? (
                                    <Chip size="small" color="success" label="Owned" icon={<VerifiedIcon />} />
                                  ) : (
                                    <Chip size="small" color="primary" label="Compatible" />
                                  )}
                                  {asset.tags && asset.tags.slice(0, 3).map((tag, index) => (
                                    <Chip key={index} size="small" label={tag} variant="outlined" />
                                  ))}
                                </Box>
                              </React.Fragment>
                            }
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
                      <Pagination 
                        count={totalPages} 
                        page={page} 
                        onChange={handlePageChange} 
                        color="primary" 
                      />
                    </Box>
                  )}
                </>
              )}
            </Box>
          ) : (
            <Alert severity="info">
              Please select an avatar to view compatible assets.
            </Alert>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {selectedAvatar && selectedAsset ? (
            <Box>
              <Typography variant="h3" sx={{ mb: 3 }}>
                Compatibility Check Result
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                  <Card sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <CardMedia
                      component="img"
                      height={240}
                      image={selectedAsset.thumbnail}
                      alt={selectedAsset.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography variant="h4" sx={{ mb: 1 }}>{selectedAsset.name}</Typography>
                      <Chip label={selectedAsset.type} sx={{ mb: 2 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Creator: {selectedAsset.creator}
                      </Typography>
                      {selectedAsset.tags && selectedAsset.tags.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5 }}>
                          {selectedAsset.tags.map((tag, index) => (
                            <Chip key={index} label={tag} size="small" />
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={2} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}>
                  {checkSingleCompatibility() && (
                    checkSingleCompatibility().compatible ? (
                      <CheckCircleIcon 
                        color={checkSingleCompatibility().owned ? "success" : "primary"} 
                        sx={{ fontSize: 60, mb: 2 }}
                      />
                    ) : (
                      <CancelIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
                    )
                  )}
                  <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    {checkSingleCompatibility() && (
                      checkSingleCompatibility().compatible ? (
                        checkSingleCompatibility().owned ? (
                          "Owned & Compatible"
                        ) : (
                          "Compatible"
                        )
                      ) : (
                        "Not Compatible"
                      )
                    )}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={5}>
                  <Card sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <CardMedia
                      component="img"
                      height={240}
                      image={selectedAvatar.thumbnail}
                      alt={selectedAvatar.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography variant="h4" sx={{ mb: 1 }}>{selectedAvatar.name}</Typography>
                      <Chip label={`Base: ${selectedAvatar.base}`} sx={{ mb: 2 }} />
                      {selectedAvatar.notes && (
                        <Typography variant="body2" color="text.secondary">
                          {selectedAvatar.notes}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 4, textAlign: 'center', p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 'medium' }}>
                  {checkSingleCompatibility() && checkSingleCompatibility().compatible ? (
                    checkSingleCompatibility().owned ? (
                      `You own this asset for the ${selectedAvatar.base} avatar base.`
                    ) : (
                      `This asset is compatible with the ${selectedAvatar.base} avatar base, but you don't own this variant.`
                    )
                  ) : (
                    `This asset is not compatible with the ${selectedAvatar.base} avatar base.`
                  )}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" color="text.secondary">
                  {selectedAsset.compatibleWith && selectedAsset.compatibleWith.length > 0 ? (
                    <>
                      <Box component="span" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>Compatible with:</Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5 }}>
                        {selectedAsset.compatibleWith.map((base, index) => (
                          <Chip 
                            key={index} 
                            label={base} 
                            size="small"
                            color={base === selectedAvatar.base ? "primary" : "default"}
                            variant={base === selectedAvatar.base ? "filled" : "outlined"}
                          />
                        ))}
                      </Box>
                    </>
                  ) : (
                    "This asset doesn't have compatibility information."
                  )}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Alert severity="info">
              Please select both an avatar and an asset to check compatibility.
            </Alert>
          )}
        </motion.div>
      )}
    </Paper>
  );
};

export default CompatibilityChecker;