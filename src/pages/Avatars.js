// src/pages/Avatars.js
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
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  IconButton,
  Tooltip,
  Paper,
  Tab,
  Tabs,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FolderIcon from '@mui/icons-material/Folder';
import HistoryIcon from '@mui/icons-material/History';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CloseIcon from '@mui/icons-material/Close';

// Import components
import AvatarCard from '../components/ui/AvatarCard';

// Import mock data and helper functions
import { avatars, avatarBases } from '../data/mockData';

// Styled components for avatar card
const StyledAvatarCard = styled(Card)(({ theme, active }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'relative',
  transition: 'all 0.3s ease',
  ...(active && {
    border: `2px solid ${theme.palette.primary.main}`,
    boxShadow: `0 0 12px ${theme.palette.primary.main}`,
  }),
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10]
  }
}));

const CurrentAvatarBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  backgroundColor: theme.palette.success.main,
  color: '#fff',
  padding: '4px 8px',
  borderRadius: theme.shape.borderRadius,
  fontSize: 12,
  fontWeight: 500,
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: 4
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '8px',
  '& svg': {
    color: theme.palette.text.secondary
  }
}));

const Avatars = () => {
  const [loading, setLoading] = useState(true);
  const [avatarList, setAvatarList] = useState([]);
  const [filteredAvatars, setFilteredAvatars] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    bases: []
  });
  const [sortOption, setSortOption] = useState('lastUsedDesc');
  const [tabValue, setTabValue] = useState('all');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newBaseDialogOpen, setNewBaseDialogOpen] = useState(false);
  const [newBaseName, setNewBaseName] = useState('');
  const [newAvatarData, setNewAvatarData] = useState({
    name: '',
    base: '',
    filePath: '',
    notes: ''
  });

  // Load avatars on mount
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Add favorite state if not already present
      const avatarsWithFavoriteState = avatars.map(avatar => ({
        ...avatar,
        favorited: avatar.favorited || false
      }));
      
      setAvatarList(avatarsWithFavoriteState);
      setFilteredAvatars(avatarsWithFavoriteState);
      setLoading(false);
    }, 1000);
  }, []);

  // Update filtered avatars when search or filters change
  useEffect(() => {
    if (!avatarList.length) return;
    
    let filtered = [...avatarList];
    
    // Filter by tabs
    if (tabValue === 'favorites') {
      filtered = filtered.filter(avatar => avatar.favorited);
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(avatar => 
        avatar.name.toLowerCase().includes(query) || 
        avatar.base.toLowerCase().includes(query) ||
        (avatar.notes && avatar.notes.toLowerCase().includes(query))
      );
    }
    
    // Apply base filter
    if (activeFilters.bases.length) {
      filtered = filtered.filter(avatar => 
        activeFilters.bases.includes(avatar.base)
      );
    }
    
    // Apply sorting
    filtered = sortAvatars(filtered, sortOption);
    
    setFilteredAvatars(filtered);
  }, [searchQuery, activeFilters, sortOption, avatarList, tabValue]);

  // Sort avatars based on selected option
  const sortAvatars = (avatarList, option) => {
    const sorted = [...avatarList];
    
    switch (option) {
      case 'nameAsc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'nameDesc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'dateAsc':
        return sorted.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
      case 'dateDesc':
        return sorted.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
      case 'lastUsedDesc':
        return sorted.sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed));
      case 'baseAsc':
        return sorted.sort((a, b) => a.base.localeCompare(b.base));
      default:
        return sorted;
    }
  };

  // Check if an avatar is the currently active one
  const isCurrentAvatar = (avatar) => {
    // Assuming the first avatar in the lastUsed sort is the current one
    const sortedByLastUsed = [...avatarList].sort((a, b) => 
      new Date(b.lastUsed) - new Date(a.lastUsed)
    );
    
    return sortedByLastUsed.length > 0 && sortedByLastUsed[0].id === avatar.id;
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
      bases: []
    });
    setSearchQuery('');
    handleFilterClose();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAvatarClick = (avatar) => {
    setSelectedAvatar(avatar);
    setDetailsDialogOpen(true);
  };

  const handleOpenMenu = (e, avatar) => {
    e.stopPropagation();
    setSelectedAvatar(avatar);
    setMenuAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  const handleAddDialogOpen = () => {
    setAddDialogOpen(true);
  };

  const handleAddDialogClose = () => {
    setAddDialogOpen(false);
    setNewAvatarData({
      name: '',
      base: '',
      filePath: '',
      notes: ''
    });
  };

  const handleDetailsDialogClose = () => {
    setDetailsDialogOpen(false);
  };

  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
    handleCloseMenu();
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleEditAvatar = () => {
    // Prefill form with selected avatar data
    setNewAvatarData({
      name: selectedAvatar.name,
      base: selectedAvatar.base,
      filePath: selectedAvatar.filePath,
      notes: selectedAvatar.notes
    });
    setAddDialogOpen(true);
    handleCloseMenu();
  };

  const handleNewAvatarChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'base' && value === 'new_base') {
      setNewBaseDialogOpen(true);
      return;
    }
    
    setNewAvatarData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewBaseDialogClose = () => {
    setNewBaseDialogOpen(false);
    setNewBaseName('');
  };

  const handleAddNewBase = () => {
    if (!newBaseName.trim()) return;
    
    // In a real app, this would be an API call to add the new base
    // For now, we'll just update the newAvatarData
    setNewAvatarData(prev => ({
      ...prev,
      base: newBaseName.trim()
    }));
    
    // Close the dialog
    handleNewBaseDialogClose();
  };

  const handleSaveAvatar = () => {
    // For new avatar
    if (!selectedAvatar) {
      const newAvatar = {
        id: Date.now(),
        name: newAvatarData.name,
        base: newAvatarData.base,
        filePath: newAvatarData.filePath,
        notes: newAvatarData.notes,
        thumbnail: `https://picsum.photos/id/${Math.floor(Math.random() * 200)}/160/180`,
        dateAdded: new Date().toISOString(),
        lastUsed: new Date().toISOString()
      };
      
      setAvatarList([...avatarList, newAvatar]);
    } else {
      // For editing existing avatar
      const updatedAvatars = avatarList.map(avatar => 
        avatar.id === selectedAvatar.id ? {
          ...avatar,
          name: newAvatarData.name,
          base: newAvatarData.base,
          filePath: newAvatarData.filePath,
          notes: newAvatarData.notes
        } : avatar
      );
      
      setAvatarList(updatedAvatars);
    }
    
    handleAddDialogClose();
  };

  const handleDeleteAvatar = () => {
    const updatedAvatars = avatarList.filter(avatar => avatar.id !== selectedAvatar.id);
    setAvatarList(updatedAvatars);
    handleDeleteDialogClose();
  };

  const handleSetAsCurrent = () => {
    // Set the selected avatar as the current one by updating its lastUsed date
    const updatedAvatars = avatarList.map(avatar => 
      avatar.id === selectedAvatar.id ? {
        ...avatar,
        lastUsed: new Date().toISOString()
      } : avatar
    );
    
    setAvatarList(updatedAvatars);
    handleCloseMenu();
  };
  
  const handleToggleFavorite = (avatar, e) => {
    if (e) e.stopPropagation();
    
    // Update the avatars array with the toggled favorite state
    const updatedAvatars = avatarList.map(a => 
      a.id === avatar.id ? {
        ...a,
        favorited: !a.favorited
      } : a
    );
    
    setAvatarList(updatedAvatars);
    setFilteredAvatars(prev => prev.map(a => 
      a.id === avatar.id ? {
        ...a,
        favorited: !a.favorited
      } : a
    ));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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
          <Typography variant="h1">Your Avatars</Typography>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddDialogOpen}
          >
            Add Avatar
          </Button>
        </Box>
      </motion.div>
      
      {/* Filter Tabs */}
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
            <Tab label="All Avatars" value="all" />
            <Tab label="Favorites" value="favorites" />
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
              {filteredAvatars.length} {filteredAvatars.length === 1 ? 'avatar' : 'avatars'}
            </Typography>
            
            {activeFilters.bases.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography sx={{ mx: 1 }}>•</Typography>
                {activeFilters.bases.map(base => (
                  <Chip 
                    key={base} 
                    label={`Base: ${base}`} 
                    size="small" 
                    onDelete={() => handleFilterChange('bases', base)}
                    color="primary"
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
              placeholder="Search avatars..."
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
      
      {/* Avatar Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : filteredAvatars.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h2" sx={{ mb: 2 }}>No Avatars Found</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {avatarList.length === 0 
              ? "You haven't added any avatars yet." 
              : "No avatars match your current filters."}
          </Typography>
          {avatarList.length === 0 ? (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={handleAddDialogOpen}
            >
              Add Your First Avatar
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
            {filteredAvatars.map((avatar, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={avatar.id}>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                >
                  <StyledAvatarCard active={isCurrentAvatar(avatar)}>
                    <CardActionArea onClick={() => handleAvatarClick(avatar)}>
                      {isCurrentAvatar(avatar) && (
                        <CurrentAvatarBadge>
                          <CheckCircleIcon fontSize="small" />
                          Current
                        </CurrentAvatarBadge>
                      )}
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: isCurrentAvatar(avatar) ? 100 : 8, 
                        zIndex: 1 
                      }}>
                        <IconButton
                          sx={{
                            backgroundColor: avatar.favorited ? 'error.main' : 'rgba(0,0,0,0.5)',
                            color: '#fff',
                            width: 32,
                            height: 32,
                            '&:hover': {
                              backgroundColor: avatar.favorited ? 'error.dark' : 'primary.main',
                            }
                          }}
                          onClick={(e) => handleToggleFavorite(avatar, e)}
                          size="small"
                        >
                          {avatar.favorited ? 
                            <FavoriteIcon fontSize="small" /> : 
                            <FavoriteBorderIcon fontSize="small" />
                          }
                        </IconButton>
                      </Box>
                      <CardMedia
                        component="img"
                        height="200"
                        image={avatar.thumbnail}
                        alt={avatar.name}
                        sx={{ 
                          transition: 'transform 0.5s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          }
                        }}
                      />
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="h3" sx={{ mb: 0.5 }}>{avatar.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Base: {avatar.base}
                            </Typography>
                          </Box>
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleOpenMenu(e, avatar)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Box>
                        
                        <Divider sx={{ my: 1.5 }} />
                        
                        <InfoItem>
                          <CalendarTodayIcon fontSize="small" />
                          <Typography variant="body2" color="text.secondary">
                            Added: {formatDate(avatar.dateAdded)}
                          </Typography>
                        </InfoItem>
                        
                        <InfoItem>
                          <HistoryIcon fontSize="small" />
                          <Typography variant="body2" color="text.secondary">
                            Last used: {formatDate(avatar.lastUsed)}
                          </Typography>
                        </InfoItem>
                      </CardContent>
                    </CardActionArea>
                  </StyledAvatarCard>
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
          <Typography variant="h3" sx={{ mb: 2 }}>Filter By Avatar Base</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 3 }}>
            {avatarBases.map(base => (
              <Chip
                key={base.id}
                label={base.name}
                onClick={() => handleFilterChange('bases', base.name)}
                color={activeFilters.bases.includes(base.name) ? 'primary' : 'default'}
                variant={activeFilters.bases.includes(base.name) ? 'filled' : 'outlined'}
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
          onClick={() => handleSortChange('lastUsedDesc')}
          selected={sortOption === 'lastUsedDesc'}
        >
          Recently Used
        </MenuItem>
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
          onClick={() => handleSortChange('baseAsc')}
          selected={sortOption === 'baseAsc'}
        >
          Base (A-Z)
        </MenuItem>
      </Menu>
      
      {/* Avatar Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleSetAsCurrent}>
          <PlayArrowIcon fontSize="small" sx={{ mr: 1 }} />
          Set as Current
        </MenuItem>
        <MenuItem onClick={() => {
          handleToggleFavorite(selectedAvatar);
          handleCloseMenu();
        }}>
          {selectedAvatar?.favorited ? (
            <>
              <FavoriteIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
              Remove from Favorites
            </>
          ) : (
            <>
              <FavoriteBorderIcon fontSize="small" sx={{ mr: 1 }} />
              Add to Favorites
            </>
          )}
        </MenuItem>
        <MenuItem onClick={handleEditAvatar}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteDialogOpen}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
      
      {/* Add/Edit Avatar Dialog */}
      <Dialog open={addDialogOpen} onClose={handleAddDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedAvatar ? 'Edit Avatar' : 'Add New Avatar'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField 
              label="Avatar Name"
              name="name"
              value={newAvatarData.name}
              onChange={handleNewAvatarChange}
              fullWidth
            />
            
            <FormControl fullWidth>
              <InputLabel>Base Model</InputLabel>
              <Select
                name="base"
                value={newAvatarData.base}
                onChange={handleNewAvatarChange}
                label="Base Model"
              >
                {avatarBases.map(base => (
                  <MenuItem key={base.id} value={base.name}>
                    {base.name}
                  </MenuItem>
                ))}
                <Divider />
                <MenuItem value="new_base">
                  <em>+ Add New Base</em>
                </MenuItem>
              </Select>
            </FormControl>
            
            <TextField 
              label="File Path"
              name="filePath"
              value={newAvatarData.filePath}
              onChange={handleNewAvatarChange}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FolderIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField 
              label="Notes"
              name="notes"
              value={newAvatarData.notes}
              onChange={handleNewAvatarChange}
              fullWidth
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveAvatar}
            disabled={!newAvatarData.name || !newAvatarData.base}
          >
            {selectedAvatar ? 'Save Changes' : 'Add Avatar'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Avatar Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={handleDetailsDialogClose}
        maxWidth="md"
        fullWidth
      >
        {selectedAvatar && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h2">{selectedAvatar.name}</Typography>
                <IconButton onClick={handleDetailsDialogClose}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                  <Box
                    component="img"
                    src={selectedAvatar.thumbnail}
                    alt={selectedAvatar.name}
                    sx={{
                      width: '100%',
                      borderRadius: 2,
                      mb: 2
                    }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    onClick={() => {
                      handleSetAsCurrent();
                      handleDetailsDialogClose();
                    }}
                    disabled={isCurrentAvatar(selectedAvatar)}
                    sx={{ mb: 2 }}
                  >
                    {isCurrentAvatar(selectedAvatar) ? 'Current Avatar' : 'Set as Current'}
                  </Button>
                  <Button
                    fullWidth
                    variant={selectedAvatar.favorited ? "contained" : "outlined"}
                    color={selectedAvatar.favorited ? "error" : "primary"}
                    startIcon={selectedAvatar.favorited ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    onClick={() => {
                      handleToggleFavorite(selectedAvatar);
                    }}
                    sx={{ mb: 2 }}
                  >
                    {selectedAvatar.favorited ? 'Remove from Favorites' : 'Add to Favorites'}
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      handleEditAvatar();
                      handleDetailsDialogClose();
                    }}
                  >
                    Edit Avatar
                  </Button>
                </Grid>
                <Grid item xs={12} md={7}>
                  <Typography variant="h3" sx={{ mb: 2 }}>Avatar Details</Typography>
                  
                  <Paper sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Base</Typography>
                        <Typography variant="body1">{selectedAvatar.base}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Added</Typography>
                        <Typography variant="body1">{formatDate(selectedAvatar.dateAdded)}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Last Used</Typography>
                        <Typography variant="body1">{formatDate(selectedAvatar.lastUsed)}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Status</Typography>
                        <Chip 
                          label={isCurrentAvatar(selectedAvatar) ? "Current" : "Inactive"} 
                          color={isCurrentAvatar(selectedAvatar) ? "success" : "default"}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                  
                  <Typography variant="h3" sx={{ mb: 1 }}>File Location</Typography>
                  <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FolderIcon color="primary" />
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontFamily: 'monospace',
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {selectedAvatar.filePath}
                    </Typography>
                  </Paper>
                  
                  {selectedAvatar.notes && (
                    <>
                      <Typography variant="h3" sx={{ mb: 1 }}>Notes</Typography>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="body1">{selectedAvatar.notes}</Typography>
                      </Paper>
                    </>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDetailsDialogClose}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete Avatar</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedAvatar?.name}"? This will only remove it from your library, not delete the actual file.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button color="error" onClick={handleDeleteAvatar}>Delete</Button>
        </DialogActions>
      </Dialog>
      
      {/* New Base Dialog */}
      <Dialog open={newBaseDialogOpen} onClose={handleNewBaseDialogClose}>
        <DialogTitle>Add New Avatar Base</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label="Base Name"
              value={newBaseName}
              onChange={(e) => setNewBaseName(e.target.value)}
              placeholder="e.g., NekoModular2.5"
              helperText="Enter the name of the new avatar base"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNewBaseDialogClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddNewBase}
            disabled={!newBaseName.trim()}
          >
            Add Base
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Avatars;