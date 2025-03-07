// src/pages/Collections.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Divider,
  Tooltip,
  Fade,
  CircularProgress,
  InputAdornment,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SortIcon from '@mui/icons-material/Sort';
import FolderIcon from '@mui/icons-material/Folder';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import CheckboxIcon from '@mui/icons-material/CheckBox';
import CheckboxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

// Import mock data - in a real app, you'd use context/redux
import { collections as mockCollections } from '../data/mockData';

const Collections = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState(mockCollections);
  const [loading, setLoading] = useState(true);
  const [currentCollection, setCurrentCollection] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [createEditDialogOpen, setCreateEditDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    folderPath: '',
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortOrder, setOrderOrder] = useState('dateDesc');
  const [error, setError] = useState('');

  // Simulate loading from a database
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenMenu = (event, collection) => {
    // Stop propagation to prevent navigation when clicking the menu button
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setCurrentCollection(collection);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenCreateDialog = () => {
    setIsEditing(false);
    setFormData({
      name: '',
      description: '',
      folderPath: '',
    });
    setCreateEditDialogOpen(true);
  };

  const handleOpenEditDialog = () => {
    setIsEditing(true);
    setFormData({
      name: currentCollection.name,
      description: currentCollection.description || '',
      folderPath: currentCollection.folderPath || '',
    });
    setCreateEditDialogOpen(true);
    handleCloseMenu();
  };

  const handleCloseDialog = () => {
    setCreateEditDialogOpen(false);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCreateCollection = () => {
    // Validate form
    if (!formData.name.trim()) {
      setError('Collection name is required');
      return;
    }

    // In a real app, you'd call an API to save this
    const newCollection = {
      id: isEditing ? currentCollection.id : Date.now(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      folderPath: formData.folderPath.trim(),
      thumbnail: isEditing 
        ? currentCollection.thumbnail 
        : `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/220/120`,
      itemCount: isEditing ? currentCollection.itemCount : 0,
      dateCreated: isEditing ? currentCollection.dateCreated : new Date().toISOString().split('T')[0],
    };

    if (isEditing) {
      // Update existing collection
      setCollections(collections.map(c => 
        c.id === currentCollection.id ? newCollection : c
      ));
    } else {
      // Add new collection
      setCollections([...collections, newCollection]);
    }

    handleCloseDialog();
  };

  const handleOpenDeleteConfirm = () => {
    setDeleteConfirmOpen(true);
    handleCloseMenu();
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
  };

  const handleDeleteCollection = () => {
    // In a real app, you'd call an API to delete this
    setCollections(collections.filter(c => c.id !== currentCollection.id));
    setDeleteConfirmOpen(false);
    setCurrentCollection(null);
  };

  const handleViewCollection = (collection) => {
    // Navigate to the collection detail page
    navigate(`/collections/${collection.id}`);
  };

  const handleSortChange = () => {
    let sortedCollections = [...collections];
    
    if (sortOrder === 'dateDesc') {
      // Switch to alphabetical
      sortedCollections.sort((a, b) => a.name.localeCompare(b.name));
      setOrderOrder('nameAsc');
    } else if (sortOrder === 'nameAsc') {
      // Switch to items count
      sortedCollections.sort((a, b) => b.itemCount - a.itemCount);
      setOrderOrder('itemsDesc');
    } else {
      // Back to date (newest first)
      sortedCollections.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
      setOrderOrder('dateDesc');
    }
    
    setCollections(sortedCollections);
  };

  const getSortButtonLabel = () => {
    switch (sortOrder) {
      case 'dateDesc': return 'Newest';
      case 'nameAsc': return 'A-Z';
      case 'itemsDesc': return 'Most Items';
      default: return 'Sort';
    }
  };

  return (
    <Box>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3 
        }}>
          <Typography variant="h1">Your Collections</Typography>
          
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
              variant="outlined"
              startIcon={<SortIcon />}
              onClick={handleSortChange}
            >
              {getSortButtonLabel()}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
            >
              New Collection
            </Button>
          </Box>
        </Box>
      </motion.div>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : collections.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <FolderIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h2" sx={{ mb: 2 }}>No Collections Yet</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Create your first collection to organize your VRChat assets
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleOpenCreateDialog}
          >
            Create Collection
          </Button>
        </Box>
      ) : (
        viewMode === 'grid' ? (
          <Grid container spacing={2}>
            {collections.map((collection, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={collection.id}>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Card 
                    sx={{ 
                      position: 'relative',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 8
                      }
                    }}
                  >
                    <IconButton
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8, 
                        bgcolor: 'rgba(0,0,0,0.5)', 
                        zIndex: 1,
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.7)'
                        }
                      }}
                      onClick={(e) => handleOpenMenu(e, collection)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <CardActionArea onClick={() => handleViewCollection(collection)}>
                      <CardMedia
                        component="img"
                        height="120"
                        image={collection.thumbnail}
                        alt={collection.name}
                      />
                      <CardContent>
                        <Typography variant="h3" noWrap sx={{ mb: 0.5 }}>
                          {collection.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'}
                        </Typography>
                        {collection.description && (
                          <Tooltip title={collection.description}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                mt: 1, 
                                opacity: 0.7,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {collection.description}
                            </Typography>
                          </Tooltip>
                        )}
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box>
            {collections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Card 
                  sx={{ 
                    mb: 2, 
                    display: 'flex', 
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <CardActionArea 
                    sx={{ display: 'flex', alignItems: 'stretch', p: 0 }}
                    onClick={() => handleViewCollection(collection)}
                  >
                    <CardMedia
                      component="img"
                      sx={{ width: 120, height: 'auto' }}
                      image={collection.thumbnail}
                      alt={collection.name}
                    />
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      p: 2, 
                      flexGrow: 1,
                      justifyContent: 'center' 
                    }}>
                      <Typography variant="h3" sx={{ mb: 0.5 }}>{collection.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'} • Created: {new Date(collection.dateCreated).toLocaleDateString()}
                      </Typography>
                      {collection.description && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            opacity: 0.7,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '500px'
                          }}
                        >
                          {collection.description}
                        </Typography>
                      )}
                    </Box>
                  </CardActionArea>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    pr: 2 
                  }}>
                    <IconButton onClick={(e) => handleOpenMenu(e, collection)}>
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Card>
              </motion.div>
            ))}
          </Box>
        )
      )}
      
      {/* Collection Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        TransitionComponent={Fade}
      >
        <MenuItem onClick={handleOpenEditDialog}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleOpenDeleteConfirm}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
      
      {/* Create/Edit Collection Dialog */}
      <Dialog 
        open={createEditDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{isEditing ? 'Edit Collection' : 'Create New Collection'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            id="name"
            name="name"
            label="Collection Name"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            sx={{ mb: 2, mt: 1 }}
            required
          />
          
          <TextField
            margin="dense"
            id="description"
            name="description"
            label="Description (Optional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            id="folderPath"
            name="folderPath"
            label="Folder Path (Optional)"
            type="text"
            fullWidth
            value={formData.folderPath}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FolderIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            helperText="Local folder path where collection assets are stored"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
          <Button 
            onClick={handleCreateCollection} 
            variant="contained" 
            disabled={!formData.name.trim()}
          >
            {isEditing ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
      >
        <DialogTitle>Delete Collection</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the collection "{currentCollection?.name}"? 
            This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Note: This will only delete the collection, not the actual asset files.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm} color="inherit">Cancel</Button>
          <Button onClick={handleDeleteCollection} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Collections;