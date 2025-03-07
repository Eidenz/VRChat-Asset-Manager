// src/pages/Favorites.js
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
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';

// Import components
import AssetCard from '../components/ui/AssetCard';
import AvatarCard from '../components/ui/AvatarCard';

// Import API context
import { useApi } from '../context/ApiContext';

const Favorites = () => {
  // Get data from API context
  const { assets, avatars, loading, errors } = useApi();
  
  // Local state
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    types: [],
    tags: []
  });
  const [sortOption, setSortOption] = useState('dateDesc');
  const [viewMode, setViewMode] = useState('grid');
  const [tabValue, setTabValue] = useState('all');
  
  // Get available filters from assets
  const [availableFilters, setAvailableFilters] = useState({
    types: [],
    tags: []
  });

  // Calculate available filters from favorited assets
  useEffect(() => {
    if (assets.favorites.length > 0) {
      const types = [...new Set(assets.favorites.map(asset => asset.type))];
      const tags = [...new Set(assets.favorites.flatMap(asset => asset.tags || []))];
      
      setAvailableFilters({
        types,
        tags
      });
    }
  }, [assets.favorites]);

  // Update filtered assets when search, filters, or tab changes
  useEffect(() => {
    if ((!assets.favorites.length && tabValue !== 'avatars') && (avatars.length === 0 && tabValue === 'avatars')) return;
    
    // Determine which items to filter based on tab
    let itemsToFilter = [];
    if (tabValue === 'all' || tabValue === 'assets') {
      itemsToFilter = assets.favorites;
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      itemsToFilter = itemsToFilter.filter(asset => 
        asset.name.toLowerCase().includes(query) || 
        asset.creator.toLowerCase().includes(query) ||
        (asset.description && asset.description.toLowerCase().includes(query)) ||
        (asset.tags && asset.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Apply type filter
    if (activeFilters.types.length) {
      itemsToFilter = itemsToFilter.filter(asset => 
        activeFilters.types.includes(asset.type)
      );
    }
    
    // Apply tag filter
    if (activeFilters.tags.length) {
      itemsToFilter = itemsToFilter.filter(asset => 
        asset.tags && asset.tags.some(tag => activeFilters.tags.includes(tag))
      );
    }
    
    // Apply sorting
    itemsToFilter = sortAssets(itemsToFilter, sortOption);
    
    setFilteredAssets(itemsToFilter);
  }, [searchQuery, activeFilters, sortOption, assets.favorites, avatars, tabValue]);

  // Get favorited avatars
  const favoritedAvatars = avatars.filter(avatar => avatar.favorited);

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
      case 'typeAsc':
        return sorted.sort((a, b) => a.type.localeCompare(b.type));
      case 'creatorAsc':
        return sorted.sort((a, b) => a.creator.localeCompare(b.creator));
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
      types: [],
      tags: []
    });
    setSearchQuery('');
    handleFilterClose();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const isLoading = loading.assets || loading.avatars;
  const hasError = errors.assets || errors.avatars;

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
          <Typography variant="h1">Favorites</Typography>
          
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
          </Box>
        </Box>
      </motion.div>
      
      {/* Filter Tabs - Show All or specific types */}
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
            <Tab label="All Favorites" value="all" />
            <Tab label="Assets" value="assets" />
            <Tab label="Avatars" value="avatars" />
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
              {tabValue === 'avatars' 
                ? `${favoritedAvatars.length} ${favoritedAvatars.length === 1 ? 'avatar' : 'avatars'}`
                : `${filteredAssets.length} ${filteredAssets.length === 1 ? 'item' : 'items'}`}
            </Typography>
            
            {(activeFilters.types.length > 0 || activeFilters.tags.length > 0) && tabValue !== 'avatars' && (
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
                <Button 
                  size="small" 
                  onClick={handleClearFilters}
                  sx={{ ml: 1 }}
                >
                  Clear All
                </Button>
              </Box>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Search favorites..."
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
            
            {tabValue !== 'avatars' && (
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={handleFilterClick}
              >
                Filter
              </Button>
            )}
            
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
      
      {/* Asset/Avatar Grid */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : hasError ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h2" color="error" sx={{ mb: 2 }}>Error Loading Data</Typography>
          <Typography variant="body1">{errors.assets || errors.avatars}</Typography>
        </Box>
      ) : tabValue === 'avatars' ? (
        favoritedAvatars.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h2" sx={{ mb: 2 }}>No Favorited Avatars</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              You haven't favorited any avatars yet.
            </Typography>
          </Box>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Grid container spacing={3}>
              {favoritedAvatars.map((avatar, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={avatar.id}>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                  >
                    <AvatarCard avatar={avatar} />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )
      ) : filteredAssets.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h2" sx={{ mb: 2 }}>No Favorites Found</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {assets.favorites.length === 0 
              ? "You haven't favorited any assets yet." 
              : "No favorites match your current filters."}
          </Typography>
          {assets.favorites.length > 0 && (
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
          onClick={() => handleSortChange('typeAsc')}
          selected={sortOption === 'typeAsc'}
        >
          Type
        </MenuItem>
        <MenuItem 
          onClick={() => handleSortChange('creatorAsc')}
          selected={sortOption === 'creatorAsc'}
        >
          Creator
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Favorites;