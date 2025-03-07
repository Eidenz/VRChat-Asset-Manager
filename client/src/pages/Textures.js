// src/pages/Textures.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Chip,
  Divider,
  CircularProgress,
  Dialog,
  Paper,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  IconButton,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import AddIcon from '@mui/icons-material/Add';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DownloadIcon from '@mui/icons-material/Download';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Import components
import AssetCard from '../components/ui/AssetCard';
import AssetUploader from '../components/features/AssetUploader';
import AssetDetailsModal from '../components/ui/AssetDetailsModal';

// Import API context
import { useApi } from '../context/ApiContext';

const Textures = () => {
  // Get assets and functions from API context
  const { 
    assets, 
    loading, 
    errors, 
    toggleAssetFavorite, 
    assetsAPI 
  } = useApi();

  // Local state
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    tags: [],
    creators: []
  });
  const [sortOption, setSortOption] = useState('dateDesc');
  const [viewMode, setViewMode] = useState('grid');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [availableFilters, setAvailableFilters] = useState({
    tags: [],
    creators: []
  });
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Extract texture assets and prepare filters when assets are loaded
  useEffect(() => {
    if (assets.textures && assets.textures.length > 0) {
      setFilteredAssets(assets.textures);
      
      // Extract available filters
      const tags = [...new Set(assets.textures.flatMap(asset => asset.tags || []))];
      const creators = [...new Set(assets.textures.map(asset => asset.creator))];
      
      setAvailableFilters({
        tags,
        creators
      });
    }
  }, [assets.textures]);

  // Update filtered assets when search or filters change
  useEffect(() => {
    if (!assets.textures || assets.textures.length === 0) return;
    
    let filtered = [...assets.textures];
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(query) || 
        asset.creator.toLowerCase().includes(query) ||
        (asset.description && asset.description.toLowerCase().includes(query)) ||
        (asset.tags && asset.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Apply tag filter
    if (activeFilters.tags.length) {
      filtered = filtered.filter(asset => 
        asset.tags && asset.tags.some(tag => activeFilters.tags.includes(tag))
      );
    }
    
    // Apply creator filter
    if (activeFilters.creators.length) {
      filtered = filtered.filter(asset => 
        activeFilters.creators.includes(asset.creator)
      );
    }
    
    // Apply sorting
    filtered = sortAssets(filtered, sortOption);
    
    setFilteredAssets(filtered);
  }, [searchQuery, activeFilters, sortOption, assets.textures]);

  // Sort assets based on selected option
  const sortAssets = (assetList, option) => {
    const sorted = [...assetList];
    
    switch (option) {
      case 'nameAsc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'nameDesc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'dateAsc':
        return sorted.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
      case 'dateDesc':
        return sorted.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
      case 'creatorAsc':
        return sorted.sort((a, b) => a.creator.localeCompare(b.creator));
      case 'sizeAsc':
        return sorted.sort((a, b) => {
          const sizeA = parseFloat((a.fileSize || '0').replace(/[^\d.]/g, ''));
          const sizeB = parseFloat((b.fileSize || '0').replace(/[^\d.]/g, ''));
          return sizeA - sizeB;
        });
      case 'sizeDesc':
        return sorted.sort((a, b) => {
          const sizeA = parseFloat((a.fileSize || '0').replace(/[^\d.]/g, ''));
          const sizeB = parseFloat((b.fileSize || '0').replace(/[^\d.]/g, ''));
          return sizeB - sizeA;
        });
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
      tags: [],
      creators: []
    });
    setSearchQuery('');
    handleFilterClose();
  };

  const handleOpenUploadDialog = () => {
    setUploadDialogOpen(true);
  };

  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
  };

  const handleToggleFavorite = async (asset, e) => {
    if (e) e.stopPropagation();
    
    try {
      await toggleAssetFavorite(asset.id);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleOpenDetails = (asset) => {
    setSelectedAsset(asset);
    setDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsModalOpen(false);
  };

  const handleDownload = (asset, e) => {
    if (e) e.stopPropagation();
    if (asset.downloadUrl) {
      window.open(asset.downloadUrl, '_blank');
    }
  };

  return (
    <Box>
      {/* Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3 
        }}>
          <Typography variant="h1">Textures & Materials</Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant={viewMode === 'grid' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('grid')}
              sx={{ minWidth: 40, width: 40, height: 40, p: 0 }}
            >
              <ViewModuleIcon />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('list')}
              sx={{ minWidth: 40, width: 40, height: 40, p: 0 }}
            >
              <ViewListIcon />
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenUploadDialog}
            >
              Add Texture
            </Button>
          </Box>
        </Box>
      </motion.div>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Search and Filters */}
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
              {filteredAssets.length} {filteredAssets.length === 1 ? 'item' : 'items'}
            </Typography>
            
            {(activeFilters.tags.length > 0 || activeFilters.creators.length > 0) && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography sx={{ mx: 1 }}>•</Typography>
                {activeFilters.tags.map(tag => (
                  <Chip 
                    key={tag} 
                    label={tag} 
                    size="small" 
                    onDelete={() => handleFilterChange('tags', tag)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
                {activeFilters.creators.map(creator => (
                  <Chip 
                    key={creator} 
                    label={`By: ${creator}`} 
                    size="small" 
                    onDelete={() => handleFilterChange('creators', creator)}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
                {(activeFilters.tags.length > 0 || activeFilters.creators.length > 0) && (
                  <Button 
                    size="small" 
                    onClick={handleClearFilters}
                    sx={{ ml: 1 }}
                  >
                    Clear All
                  </Button>
                )}
              </Box>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Search textures..."
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
      
      {/* Asset Grid */}
      {loading.assets ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : errors.assets ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h2" color="error" sx={{ mb: 2 }}>Error Loading Textures</Typography>
          <Typography variant="body1">{errors.assets}</Typography>
        </Box>
      ) : filteredAssets.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h2" sx={{ mb: 2 }}>No Textures Found</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {assets.textures && assets.textures.length === 0 
              ? "You haven't added any texture assets yet." 
              : "No textures match your current filters."}
          </Typography>
          {assets.textures && assets.textures.length === 0 ? (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={handleOpenUploadDialog}
            >
              Add Your First Texture
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
      ) : viewMode === 'grid' ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Grid container spacing={3}>
            {filteredAssets.map((asset, index) => (
              <Grid item xs={12} sm={6} md={4} key={asset.id}>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                >
                  <AssetCard asset={asset} />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredAssets.map((asset, index) => (
              <motion.div
                key={asset.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              >
                <Card sx={{ display: 'flex', overflow: 'hidden' }}>
                  <CardActionArea 
                    sx={{ display: 'flex', textAlign: 'left', alignItems: 'stretch' }}
                    onClick={() => handleOpenDetails(asset)}
                  >
                    <Box sx={{ position: 'relative', width: 120 }}>
                      <CardMedia
                        component="img"
                        sx={{ width: 120, height: '100%', objectFit: 'cover' }}
                        image={asset.thumbnail}
                        alt={asset.name}
                      />
                      <IconButton
                        onClick={(e) => handleToggleFavorite(asset, e)}
                        size="small"
                        sx={{ 
                          position: 'absolute', 
                          right: 4, 
                          top: 4, 
                          width: 28, 
                          height: 28,
                          backgroundColor: asset.favorited ? 'error.main' : 'rgba(0,0,0,0.5)',
                          color: '#fff',
                          '&:hover': {
                            backgroundColor: asset.favorited ? 'error.dark' : 'primary.main',
                          }
                        }}
                      >
                        {asset.favorited ? 
                          <FavoriteIcon fontSize="small" /> : 
                          <FavoriteBorderIcon fontSize="small" />
                        }
                      </IconButton>
                    </Box>
                    <CardContent sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="h3">{asset.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            By: {asset.creator} • {asset.fileSize}
                          </Typography>
                        </Box>
                        <Chip 
                          label={asset.type} 
                          size="small" 
                          color="primary"
                          sx={{ height: 22, fontSize: 12 }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1, mb: 1 }}>
                        {asset.tags && asset.tags.map((tag, idx) => (
                          <Chip key={idx} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          mt: 'auto' 
                        }}
                      >
                        {asset.description}
                      </Typography>
                    </CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'center', 
                      p: 2, 
                      gap: 1 
                    }}>
                      <Tooltip title="Download">
                        <IconButton onClick={(e) => handleDownload(asset, e)} disabled={!asset.downloadUrl}>
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Details">
                        <IconButton onClick={() => handleOpenDetails(asset)}>
                          <InfoOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardActionArea>
                </Card>
              </motion.div>
            ))}
          </Box>
        </motion.div>
      )}
      
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
          <Typography variant="h3" sx={{ mb: 2 }}>Filter By Tag</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 3 }}>
            {availableFilters.tags.map(tag => (
              <Chip
                key={tag}
                label={tag}
                onClick={() => handleFilterChange('tags', tag)}
                color={activeFilters.tags.includes(tag) ? 'primary' : 'default'}
                variant={activeFilters.tags.includes(tag) ? 'filled' : 'outlined'}
                size="small"
                sx={{ m: 0.5 }}
              />
            ))}
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h3" sx={{ mb: 2 }}>Filter By Creator</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {availableFilters.creators.map(creator => (
              <Chip
                key={creator}
                label={creator}
                onClick={() => handleFilterChange('creators', creator)}
                color={activeFilters.creators.includes(creator) ? 'secondary' : 'default'}
                variant={activeFilters.creators.includes(creator) ? 'filled' : 'outlined'}
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
          Creator (A-Z)
        </MenuItem>
        <MenuItem 
          onClick={() => handleSortChange('sizeAsc')}
          selected={sortOption === 'sizeAsc'}
        >
          Size (Small to Large)
        </MenuItem>
        <MenuItem 
          onClick={() => handleSortChange('sizeDesc')}
          selected={sortOption === 'sizeDesc'}
        >
          Size (Large to Small)
        </MenuItem>
      </Menu>
      
      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={handleCloseUploadDialog}
        fullWidth
        maxWidth="md"
      >
        <AssetUploader onClose={handleCloseUploadDialog} />
      </Dialog>
      
      {/* Details Modal */}
      {selectedAsset && (
        <AssetDetailsModal
          open={detailsModalOpen}
          handleClose={handleCloseDetails}
          asset={selectedAsset}
        />
      )}
    </Box>
  );
};

export default Textures;