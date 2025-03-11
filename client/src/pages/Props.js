// src/pages/Props.js - with simplified tabs for Props and Accessories
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
  IconButton,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import AddIcon from '@mui/icons-material/Add';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';

// Import components
import AssetCard from '../components/ui/AssetCard';
import AssetUploader from '../components/features/AssetUploader';

// Import API context
import { useApi } from '../context/ApiContext';

const Props = () => {
  // Get assets data from API context
  const { assets, loading, errors, assetsAPI } = useApi();
  
  // Local state
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    tags: [],
    creators: [],
    priceRange: null
  });
  const [sortOption, setSortOption] = useState('dateDesc');
  const [viewMode, setViewMode] = useState('grid');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [availableFilters, setAvailableFilters] = useState({
    tags: [],
    creators: []
  });
  const [tabValue, setTabValue] = useState('props');
  const [availableTags, setAvailableTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);

  const priceRanges = [
    { label: 'Free', min: 0, max: 0 },
    { label: 'Under $5', min: 0.01, max: 5 },
    { label: '$5 - $10', min: 5, max: 10 },
    { label: '$10 - $20', min: 10, max: 20 },
    { label: '$20 - $50', min: 20, max: 50 },
    { label: 'Over $50', min: 50, max: null }
  ];
  
  const filterAssetsByPrice = (assets, priceRange) => {
    if (!priceRange) return assets;
    
    return assets.filter(asset => {
      // If no price is set, exclude when filtering by price
      if (!asset.price) return false;
      
      // Extract numeric value from price string (remove $ and any other non-numeric chars)
      const priceValue = parseFloat(asset.price.replace(/[^0-9.]/g, ''));
      
      // Check if price is within range
      if (priceRange.min === 0 && priceRange.max === 0) {
        // Special case for free assets
        return priceValue === 0;
      } else if (priceRange.max === null) {
        // For "Over X" ranges
        return priceValue >= priceRange.min;
      } else {
        // For regular ranges
        return priceValue >= priceRange.min && priceValue <= priceRange.max;
      }
    });
  };

  // Fetch available tags
  useEffect(() => {
    const fetchTags = async () => {
      setLoadingTags(true);
      try {
        const response = await assetsAPI.getTags();
        setAvailableTags(response.data);
      } catch (error) {
        console.error('Error fetching tags:', error);
      } finally {
        setLoadingTags(false);
      }
    };

    fetchTags();
  }, [assetsAPI]);

  // Get all props and accessories assets
  useEffect(() => {
    // Combine props and accessories to a single array for filtering
    const propsAndAccessories = [
      ...assets.props,
      ...assets.accessories
    ];
    
    if (propsAndAccessories.length > 0) {
      // Extract unique creators
      const creators = [...new Set(propsAndAccessories.map(asset => asset.creator))];
      
      // Extract unique tags from all props and accessories assets
      const tags = [...new Set(propsAndAccessories.flatMap(asset => asset.tags || []))];
      
      setAvailableFilters({
        tags,
        creators
      });
    }
  }, [assets.props, assets.accessories]);

  // Update filtered assets when search, filters, or tab changes
  useEffect(() => {
    // Determine which items to filter based on tab
    let itemsToFilter = [];
    if (tabValue === 'props') {
      itemsToFilter = assets.props;
    } else if (tabValue === 'accessories') {
      itemsToFilter = assets.accessories;
    } else {
      // If we ever add an "all" tab
      itemsToFilter = [...assets.props, ...assets.accessories];
    }
    
    if (!itemsToFilter.length) return;
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      itemsToFilter = itemsToFilter.filter(asset => 
        asset.name.toLowerCase().includes(query) || 
        asset.creator.toLowerCase().includes(query) ||
        asset.description.toLowerCase().includes(query) ||
        asset.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply tag filter
    if (activeFilters.tags.length) {
      itemsToFilter = itemsToFilter.filter(asset => 
        asset.tags.some(tag => activeFilters.tags.includes(tag))
      );
    }
    
    // Apply creator filter
    if (activeFilters.creators.length) {
      itemsToFilter = itemsToFilter.filter(asset => 
        activeFilters.creators.includes(asset.creator)
      );
    }

    if (activeFilters.priceRange) {
      itemsToFilter = filterAssetsByPrice(itemsToFilter, activeFilters.priceRange);
    }
    
    // Apply sorting
    itemsToFilter = sortAssets(itemsToFilter, sortOption);
    
    setFilteredAssets(itemsToFilter);
  }, [searchQuery, activeFilters, sortOption, assets.props, assets.accessories, tabValue]);

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
      case 'priceAsc':
        return sorted.sort((a, b) => {
          const priceA = a.price ? parseFloat(a.price.replace(/[^0-9.]/g, '')) : 0;
          const priceB = b.price ? parseFloat(b.price.replace(/[^0-9.]/g, '')) : 0;
          return priceA - priceB;
        });
      case 'priceDesc':
        return sorted.sort((a, b) => {
          const priceA = a.price ? parseFloat(a.price.replace(/[^0-9.]/g, '')) : 0;
          const priceB = b.price ? parseFloat(b.price.replace(/[^0-9.]/g, '')) : 0;
          return priceB - priceA;
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Get the current display name based on the tab
  const getDisplayName = () => {
    switch(tabValue) {
      case 'props':
        return 'Props';
      case 'accessories':
        return 'Accessories';
      default:
        return 'Props & Accessories';
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
          <Typography variant="h1">Props & Accessories</Typography>
          
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
              Add {tabValue === 'accessories' ? 'Accessory' : 'Prop'}
            </Button>
          </Box>
        </Box>
      </motion.div>
      
      {/* Category Tabs - Simplified to just Props and Accessories */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Box sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{ mb: 1 }}
          >
            <Tab label="Props" value="props" />
            <Tab label="Accessories" value="accessories" />
          </Tabs>
        </Box>
      </motion.div>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Search and Filters */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
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
                {activeFilters.priceRange && (
                  <Chip 
                    label={`Price: ${activeFilters.priceRange.label}`} 
                    size="small" 
                    onDelete={() => setActiveFilters(prev => ({ ...prev, priceRange: null }))}
                    color="primary"
                    variant="outlined"
                  />
                )}
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
              placeholder={`Search ${getDisplayName().toLowerCase()}...`}
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
          <Typography variant="h2" color="error" sx={{ mb: 2 }}>Error Loading {getDisplayName()}</Typography>
          <Typography variant="body1">{errors.assets}</Typography>
        </Box>
      ) : filteredAssets.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h2" sx={{ mb: 2 }}>No {getDisplayName()} Found</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {tabValue === 'props' && assets.props.length === 0 
              ? "You haven't added any prop assets yet." 
              : tabValue === 'accessories' && assets.accessories.length === 0 
              ? "You haven't added any accessory assets yet."
              : "No items match your current filters."}
          </Typography>
          {(tabValue === 'props' && assets.props.length === 0) || 
           (tabValue === 'accessories' && assets.accessories.length === 0) ? (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={handleOpenUploadDialog}
            >
              Add Your First {tabValue === 'accessories' ? 'Accessory' : 'Prop'}
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
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
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
          {loadingTags ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
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
          )}
          
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

          <Typography variant="h3" sx={{ mb: 2 }}>Filter By Price</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 3 }}>
              {priceRanges.map((range) => (
                <Chip
                  key={range.label}
                  label={range.label}
                  onClick={() => {
                    // Toggle price range filter
                    const newRange = activeFilters.priceRange && 
                                    activeFilters.priceRange.label === range.label 
                                    ? null : range;
                    setActiveFilters(prev => ({
                      ...prev,
                      priceRange: newRange
                    }));
                  }}
                  color={activeFilters.priceRange?.label === range.label ? 'primary' : 'default'}
                  variant={activeFilters.priceRange?.label === range.label ? 'filled' : 'outlined'}
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
          onClick={() => handleSortChange('priceAsc')}
          selected={sortOption === 'priceAsc'}
        >
          Price (Low to High)
        </MenuItem>
        <MenuItem 
          onClick={() => handleSortChange('priceDesc')}
          selected={sortOption === 'priceDesc'}
        >
          Price (High to Low)
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
    </Box>
  );
};

export default Props;