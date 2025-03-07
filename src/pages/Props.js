// src/pages/Props.js
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

// Import mock data and helper functions
import { propAssets, assetTags } from '../data/mockData';

const Props = () => {
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState([]);
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
  const [tabValue, setTabValue] = useState('all');

  // Load assets on mount
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAssets(propAssets);
      setFilteredAssets(propAssets);
      
      // Extract available filters
      const tags = [...new Set(propAssets.flatMap(asset => asset.tags))];
      const creators = [...new Set(propAssets.map(asset => asset.creator))];
      
      setAvailableFilters({
        tags,
        creators
      });
      
      setLoading(false);
    }, 1000);
  }, []);

  // Update filtered assets when search or filters change
  useEffect(() => {
    if (!assets.length) return;
    
    let filtered = [...assets];
    
    // Filter by current tab
    if (tabValue !== 'all') {
      filtered = filtered.filter(asset => 
        asset.tags.some(tag => tag.toLowerCase() === tabValue.toLowerCase())
      );
    }
    
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
    
    // Apply tag filter
    if (activeFilters.tags.length) {
      filtered = filtered.filter(asset => 
        asset.tags.some(tag => activeFilters.tags.includes(tag))
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
  }, [searchQuery, activeFilters, sortOption, assets, tabValue]);

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

  // Get prop categories from assets
  const propCategories = [...new Set(propAssets.flatMap(asset => 
    asset.tags.filter(tag => tag !== 'Prop')
  ))];

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
              Add Prop
            </Button>
          </Box>
        </Box>
      </motion.div>
      
      {/* Category Tabs */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Box sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 1 }}
          >
            <Tab label="All Props" value="all" />
            <Tab label="Weapons" value="Weapon" />
            <Tab label="Medieval" value="Medieval" />
            <Tab label="Sci-Fi" value="Sci-Fi" />
            <Tab label="Fantasy" value="Fantasy" />
            {propCategories
              .filter(cat => !['Weapon', 'Medieval', 'Sci-Fi', 'Fantasy'].includes(cat))
              .map(category => (
                <Tab key={category} label={category} value={category} />
              ))
            }
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
              placeholder="Search props..."
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
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : filteredAssets.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h2" sx={{ mb: 2 }}>No Props Found</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {assets.length === 0 
              ? "You haven't added any prop assets yet." 
              : "No props match your current filters."}
          </Typography>
          {assets.length === 0 ? (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={handleOpenUploadDialog}
            >
              Add Your First Prop
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