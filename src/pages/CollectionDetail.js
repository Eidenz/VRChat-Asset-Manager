// src/pages/CollectionDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Button,
  Divider,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Breadcrumbs,
  Link,
  Tooltip,
  Card,
  CardMedia,
  CardContent
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CheckboxIcon from '@mui/icons-material/CheckBox';

// Import components
import AssetCard from '../components/ui/AssetCard';

// Import mock data - in a real app, you'd use context/redux
import { collections, getAllAssets } from '../data/mockData';

const CollectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    types: [],
    tags: []
  });
  const [sortOption, setSortOption] = useState('dateDesc');
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [addAssetDialogOpen, setAddAssetDialogOpen] = useState(false);
  const [removingAsset, setRemovingAsset] = useState(null);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [loadingAssets, setLoadingAssets] = useState(false);
  
  // Get available filters from assets
  const [availableFilters, setAvailableFilters] = useState({
    types: [],
    tags: []
  });

  // Mock loading the collection and its assets
  useEffect(() => {
    // In a real app, you'd fetch this data from an API
    setTimeout(() => {
      const foundCollection = collections.find(c => c.id.toString() === id);
      
      if (foundCollection) {
        setCollection(foundCollection);
        
        // For demo purposes, get all assets and randomly assign some to this collection
        const allAssets = getAllAssets();
        const collectionAssets = allAssets
          .filter(() => Math.random() > 0.3) // Randomly include ~70% of assets
          .map(asset => ({
            ...asset,
            dateAddedToCollection: new Date(
              Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
            ).toISOString()
          }));
        
        setAssets(collectionAssets);
        setFilteredAssets(collectionAssets);
        
        // Extract available filters
        const types = [...new Set(collectionAssets.map(asset => asset.type))];
        const tags = [...new Set(collectionAssets.flatMap(asset => asset.tags))];
        
        setAvailableFilters({
          types,
          tags
        });
      }
      
      setLoading(false);
    }, 1000);
  }, [id]);

  useEffect(() => {
    if (!addAssetDialogOpen) return;
    
    setLoadingAssets(true);
    setSelectedAssets([]);
    setAssetSearchQuery('');
    
    // In a real app, this would be an API call to fetch assets not in the collection
    setTimeout(() => {
      const allAssets = getAllAssets();
      
      // Filter out assets already in the collection
      const collectionAssetIds = assets.map(asset => asset.id);
      const availableAssets = allAssets.filter(asset => !collectionAssetIds.includes(asset.id));
      
      setAvailableAssets(availableAssets);
      setLoadingAssets(false);
    }, 1000);
  }, [addAssetDialogOpen, assets]);

  // Update filtered assets when search or filters change
  useEffect(() => {
    if (!assets.length) return;
    
    let filtered = [...assets];
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(query) || 
        asset.creator.toLowerCase().includes(query) ||
        asset.description.toLowerCase().includes(query) ||
        asset.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply type filter
    if (activeFilters.types.length) {
      filtered = filtered.filter(asset => 
        activeFilters.types.includes(asset.type)
      );
    }
    
    // Apply tag filter
    if (activeFilters.tags.length) {
      filtered = filtered.filter(asset => 
        asset.tags.some(tag => activeFilters.tags.includes(tag))
      );
    }
    
    // Apply sorting
    filtered = sortAssets(filtered, sortOption);
    
    setFilteredAssets(filtered);
  }, [searchQuery, activeFilters, sortOption, assets]);

  // Sort assets based on selected option
  const sortAssets = (assetList, option) => {
    const sorted = [...assetList];
    
    switch (option) {
      case 'nameAsc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'nameDesc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'dateAsc':
        return sorted.sort((a, b) => new Date(a.dateAddedToCollection) - new Date(b.dateAddedToCollection));
      case 'dateDesc':
        return sorted.sort((a, b) => new Date(b.dateAddedToCollection) - new Date(a.dateAddedToCollection));
      case 'creatorAsc':
        return sorted.sort((a, b) => a.creator.localeCompare(b.creator));
      case 'typeAsc':
        return sorted.sort((a, b) => a.type.localeCompare(b.type));
      default:
        return sorted;
    }
  };

  // Event handlers
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => {
      const current = [...prev[filterType]];
      
      if (current.includes(value)) {
        // Remove if already selected
        return {
          ...prev,
          [filterType]: current.filter(item => item !== value)
        };
      } else {
        // Add if not selected
        return {
          ...prev,
          [filterType]: [...current, value]
        };
      }
    });
  };

  const handleClearFilters = () => {
    setActiveFilters({
      types: [],
      tags: []
    });
    setSearchQuery('');
    handleFilterClose();
  };

  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleSortChange = (option) => {
    setSortOption(option);
    handleSortClose();
  };

  const handleOpenAddAssetDialog = () => {
    setAddAssetDialogOpen(true);
  };

  const getFilteredAvailableAssets = () => {
    if (!assetSearchQuery) return availableAssets;
    
    const query = assetSearchQuery.toLowerCase();
    return availableAssets.filter(asset => 
      asset.name.toLowerCase().includes(query) || 
      asset.creator.toLowerCase().includes(query) ||
      asset.type.toLowerCase().includes(query) ||
      asset.tags.some(tag => tag.toLowerCase().includes(query))
    );
  };

  const handleCloseAddAssetDialog = () => {
    setAddAssetDialogOpen(false);
    setSelectedAssets([]);
    setAssetSearchQuery('');
  };

  const handleToggleAsset = (asset) => {
    setSelectedAssets(prev => {
      if (prev.some(a => a.id === asset.id)) {
        return prev.filter(a => a.id !== asset.id);
      } else {
        return [...prev, asset];
      }
    });
  };

  const handleAddAssetToCollection = () => {
    // In a real app, you'd call an API to add assets to the collection
    // For now, we'll just add them to the local state
    const updatedAssets = [...assets, ...selectedAssets.map(asset => ({
      ...asset,
      dateAddedToCollection: new Date().toISOString()
    }))];
    
    setAssets(updatedAssets);
    
    // Close the dialog and reset selection
    handleCloseAddAssetDialog();
    setSelectedAssets([]);
  };

  const handleOpenRemoveConfirm = (asset) => {
    setRemovingAsset(asset);
    setRemoveConfirmOpen(true);
  };

  const handleCloseRemoveConfirm = () => {
    setRemoveConfirmOpen(false);
    setRemovingAsset(null);
  };

  const handleRemoveAssetFromCollection = () => {
    // In a real app, you'd call an API to remove the asset from the collection
    if (removingAsset) {
      setAssets(assets.filter(a => a.id !== removingAsset.id));
    }
    handleCloseRemoveConfirm();
  };

  const handleGoBack = () => {
    navigate('/collections');
  };

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render not found state
  if (!collection) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h2" sx={{ mb: 2 }}>Collection Not Found</Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          The collection you're looking for doesn't exist or has been deleted.
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={handleGoBack}
        >
          Back to Collections
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs and Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link 
            underline="hover" 
            color="inherit" 
            sx={{ cursor: 'pointer' }}
            onClick={handleGoBack}
          >
            Collections
          </Link>
          <Typography color="text.primary">{collection.name}</Typography>
        </Breadcrumbs>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              sx={{ mr: 1 }} 
              onClick={handleGoBack}
              aria-label="go back"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h1">{collection.name}</Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddAssetDialog}
          >
            Add Asset
          </Button>
        </Box>
        
        {collection.description && (
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.8 }}>
            {collection.description}
          </Typography>
        )}
        
        {collection.folderPath && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3, 
            p: 2, 
            bgcolor: 'background.paper',
            borderRadius: 1,
            maxWidth: 'fit-content'
          }}>
            <FolderIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="body2">
              {collection.folderPath}
            </Typography>
          </Box>
        )}
      </motion.div>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Filters and Search */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography>
              {filteredAssets.length} {filteredAssets.length === 1 ? 'asset' : 'assets'}
            </Typography>
            
            {(activeFilters.types.length > 0 || activeFilters.tags.length > 0) && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography sx={{ mx: 1 }}>•</Typography>
                {activeFilters.types.map(type => (
                  <Chip 
                    key={type} 
                    label={type} 
                    size="small" 
                    onDelete={() => handleFilterChange('types', type)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
                {activeFilters.tags.map(tag => (
                  <Chip 
                    key={tag} 
                    label={tag} 
                    size="small" 
                    onDelete={() => handleFilterChange('tags', tag)}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
                {(activeFilters.types.length > 0 || activeFilters.tags.length > 0) && (
                  <Button 
                    size="small" 
                    onClick={handleClearFilters}
                    sx={{ ml: 1 }}
                  >
                    Clear Filters
                  </Button>
                )}
              </Box>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Search assets..."
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 250 }}
            />
            
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={handleFilterClick}
            >
              Filter
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<SortIcon />}
              onClick={handleSortClick}
            >
              Sort
            </Button>
          </Box>
        </Box>
      </motion.div>
      
      {/* Assets Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {filteredAssets.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h2" sx={{ mb: 2 }}>No Assets Found</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {assets.length === 0 
                ? "This collection doesn't have any assets yet." 
                : "No assets match your current filters."}
            </Typography>
            {assets.length === 0 ? (
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={handleOpenAddAssetDialog}
              >
                Add Your First Asset
              </Button>
            ) : (
              <Button 
                variant="outlined" 
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredAssets.map((asset, index) => (
              <Grid item xs={12} sm={6} md={4} key={asset.id}>
                <Box sx={{ position: 'relative' }}>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                  >
                    <AssetCard asset={asset} />
                    
                    <Tooltip title="Remove from collection">
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 44,
                          right: 12,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          color: 'error.light',
                          '&:hover': {
                            bgcolor: 'error.main',
                            color: 'white'
                          }
                        }}
                        onClick={() => handleOpenRemoveConfirm(asset)}
                      >
                        <RemoveCircleOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </motion.div>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </motion.div>
      
      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        sx={{ 
          '& .MuiPaper-root': { 
            width: 280,
            maxHeight: 500,
            overflow: 'auto' 
          } 
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="h3" sx={{ mb: 2 }}>Filter By Type</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 3 }}>
            {availableFilters.types.map(type => (
              <Chip
                key={type}
                label={type}
                onClick={() => handleFilterChange('types', type)}
                color={activeFilters.types.includes(type) ? 'primary' : 'default'}
                variant={activeFilters.types.includes(type) ? 'filled' : 'outlined'}
                size="small"
                sx={{ m: 0.5 }}
              />
            ))}
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h3" sx={{ mb: 2 }}>Filter By Tag</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {availableFilters.tags.map(tag => (
              <Chip
                key={tag}
                label={tag}
                onClick={() => handleFilterChange('tags', tag)}
                color={activeFilters.tags.includes(tag) ? 'secondary' : 'default'}
                variant={activeFilters.tags.includes(tag) ? 'filled' : 'outlined'}
                size="small"
                sx={{ m: 0.5 }}
              />
            ))}
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={handleClearFilters}>
              Clear All
            </Button>
            <Button onClick={handleFilterClose} sx={{ ml: 1 }}>
              Close
            </Button>
          </Box>
        </Box>
      </Menu>
      
      {/* Sort Menu */}
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={handleSortClose}
      >
        <MenuItem 
          onClick={() => handleSortChange('dateDesc')}
          selected={sortOption === 'dateDesc'}
        >
          Newest First
        </MenuItem>
        <MenuItem 
          onClick={() => handleSortChange('dateAsc')}
          selected={sortOption === 'dateAsc'}
        >
          Oldest First
        </MenuItem>
        <MenuItem 
          onClick={() => handleSortChange('nameAsc')}
          selected={sortOption === 'nameAsc'}
        >
          Name (A-Z)
        </MenuItem>
        <MenuItem 
          onClick={() => handleSortChange('nameDesc')}
          selected={sortOption === 'nameDesc'}
        >
          Name (Z-A)
        </MenuItem>
        <MenuItem 
          onClick={() => handleSortChange('creatorAsc')}
          selected={sortOption === 'creatorAsc'}
        >
          Creator
        </MenuItem>
        <MenuItem 
          onClick={() => handleSortChange('typeAsc')}
          selected={sortOption === 'typeAsc'}
        >
          Asset Type
        </MenuItem>
      </Menu>
      
      {/* Add Asset Dialog */}
      <Dialog
        open={addAssetDialogOpen}
        onClose={handleCloseAddAssetDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Assets to Collection</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Search assets..."
            value={assetSearchQuery}
            onChange={(e) => setAssetSearchQuery(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          {loadingAssets ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : availableAssets.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h3" sx={{ mb: 2 }}>No Available Assets</Typography>
              <Typography variant="body1" color="text.secondary">
                All your assets are already in this collection.
              </Typography>
            </Box>
          ) : getFilteredAvailableAssets().length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h3" sx={{ mb: 2 }}>No Matching Assets</Typography>
              <Typography variant="body1" color="text.secondary">
                No assets match your search query.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ height: '400px', overflow: 'auto' }}>
              <Grid container spacing={2}>
                {getFilteredAvailableAssets().map(asset => (
                  <Grid item xs={12} sm={6} md={4} key={asset.id}>
                    <Card 
                      sx={{ 
                        position: 'relative',
                        cursor: 'pointer',
                        border: selectedAssets.some(a => a.id === asset.id) 
                          ? '2px solid' 
                          : '2px solid transparent',
                        borderColor: 'primary.main',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => handleToggleAsset(asset)}
                    >
                      {selectedAssets.some(a => a.id === asset.id) && (
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8, 
                            zIndex: 1,
                            bgcolor: 'primary.main',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <CheckboxIcon sx={{ color: 'white', fontSize: 18 }} />
                        </Box>
                      )}
                      <CardMedia
                        component="img"
                        height="120"
                        image={asset.thumbnail}
                        alt={asset.name}
                      />
                      <CardContent sx={{ pb: 1 }}>
                        <Typography variant="h3" noWrap>{asset.name}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            {asset.type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            By: {asset.creator}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', pl: 2 }}>
            <Typography variant="body2">
              {selectedAssets.length} {selectedAssets.length === 1 ? 'asset' : 'assets'} selected
            </Typography>
            <Box>
              <Button onClick={handleCloseAddAssetDialog}>Cancel</Button>
              <Button 
                variant="contained"
                onClick={handleAddAssetToCollection}
                disabled={selectedAssets.length === 0}
              >
                Add to Collection
              </Button>
            </Box>
          </Box>
        </DialogActions>
      </Dialog>
      
      {/* Remove Asset Confirmation Dialog */}
      <Dialog
        open={removeConfirmOpen}
        onClose={handleCloseRemoveConfirm}
      >
        <DialogTitle>Remove Asset from Collection</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove "{removingAsset?.name}" from this collection? 
            This will not delete the asset from your library.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemoveConfirm}>Cancel</Button>
          <Button 
            onClick={handleRemoveAssetFromCollection} 
            color="error"
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CollectionDetail;