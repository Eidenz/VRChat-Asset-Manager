// src/pages/Collections.js
import React, { useState } from 'react';
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
  FormControl, 
  InputLabel, 
  Select,
  FormHelperText
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
import ImageUploader from '../components/ui/ImageUploader';
import AvatarIcon from '@mui/icons-material/Person';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';

// Import API context
import { useApi } from '../context/ApiContext';

const Collections = () => {
  const navigate = useNavigate();
  const { 
    collections, 
    avatars, 
    loading, 
    errors, 
    createCollection, 
    collectionsAPI, 
    fetchCollections,
    linkCollectionToAvatar,
    unlinkCollectionFromAvatar 
  } = useApi();
  
  const [currentCollection, setCurrentCollection] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [createEditDialogOpen, setCreateEditDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    folderPath: '',
    thumbnail: '',
    avatarId: null
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortOrder, setOrderOrder] = useState('dateDesc');
  const [sortedCollections, setSortedCollections] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [linkAvatarDialogOpen, setLinkAvatarDialogOpen] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState('');
  const [linkingAvatar, setLinkingAvatar] = useState(false);

  // Update sorted collections when collections or sort order changes
  React.useEffect(() => {
    if (!collections.length) return;
    
    let sorted = [...collections];
    
    if (sortOrder === 'dateDesc') {
      sorted.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
    } else if (sortOrder === 'nameAsc') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'itemsDesc') {
      sorted.sort((a, b) => b.itemCount - a.itemCount);
    }
    
    setSortedCollections(sorted);
  }, [collections, sortOrder]);

  const getAvatarOptions = () => {
    // If no avatars are loaded yet, return an empty array
    if (!avatars || avatars.length === 0) {
      return [];
    }
    
    // Sort avatars by name for easier selection
    return [...avatars].sort((a, b) => a.name.localeCompare(b.name));
  };

  const handleOpenMenu = (event, collection) => {
    // Stop propagation to prevent navigation when clicking the menu button
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setCurrentCollection(collection);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleImageUpload = (imageUrl) => {
    setFormData({
      ...formData,
      thumbnail: imageUrl,
    });
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
      thumbnail: currentCollection.thumbnail,
      avatarId: currentCollection.linkedAvatarId || null
    });
    setCreateEditDialogOpen(true);
    handleCloseMenu();
  };

  const handleOpenLinkAvatarDialog = () => {
    setSelectedAvatarId('');
    setLinkAvatarDialogOpen(true);
    handleCloseMenu();
  };
  
  const handleCloseLinkAvatarDialog = () => {
    setLinkAvatarDialogOpen(false);
  };

  const handleLinkToAvatar = async () => {
    if (!selectedAvatarId) {
      setError('Please select an avatar');
      return;
    }
  
    setLinkingAvatar(true);
    try {
      await linkCollectionToAvatar(currentCollection.id, parseInt(selectedAvatarId));
      await fetchCollections(); // Refresh collections to update UI
      handleCloseLinkAvatarDialog();
    } catch (err) {
      console.error('Error linking collection to avatar:', err);
      setError('Failed to link collection to avatar');
    } finally {
      setLinkingAvatar(false);
    }
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

  const handleCreateCollection = async () => {
    // Validate form
    if (!formData.name.trim()) {
      setError('Collection name is required');
      return;
    }
  
    setSubmitting(true);
    setError('');
  
    try {
      if (isEditing) {
        // Update existing collection
        await collectionsAPI.update(currentCollection.id, {
          ...formData,
          // Use the uploaded thumbnail if available, otherwise keep the current one
          thumbnail: formData.thumbnail || currentCollection.thumbnail
        });
      } else {
        // Create new collection
        // If no custom thumbnail was uploaded, generate a random one
        const randomId = Math.floor(Math.random() * 200);
        const thumbnail = formData.thumbnail || `https://picsum.photos/id/${randomId}/220/120`;
        
        await createCollection({
          ...formData,
          thumbnail
        });
      }
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error creating/updating collection:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteConfirm = () => {
    setDeleteConfirmOpen(true);
    handleCloseMenu();
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
  };

  const handleDeleteCollection = async () => {
    setDeleteLoading(true);
    
    try {
      await collectionsAPI.delete(currentCollection.id);
      
      // Add this line to refresh collections data
      await fetchCollections();
      
      setDeleteConfirmOpen(false);
      setCurrentCollection(null);
    } catch (err) {
      console.error('Error deleting collection:', err);
      setError(err.message || 'An error occurred while deleting');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewCollection = (collection) => {
    // Navigate to the collection detail page
    navigate(`/collections/${collection.id}`);
  };

  const handleSortChange = () => {
    let newSortOrder;
    
    if (sortOrder === 'dateDesc') {
      // Switch to alphabetical
      newSortOrder = 'nameAsc';
    } else if (sortOrder === 'nameAsc') {
      // Switch to items count
      newSortOrder = 'itemsDesc';
    } else {
      // Back to date (newest first)
      newSortOrder = 'dateDesc';
    }
    
    setOrderOrder(newSortOrder);
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
      
      {/* Error display */}
      {errors.collections && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.collections}
        </Alert>
      )}
      
      {/* Loading State */}
      {loading.collections ? (
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
            {sortedCollections.map((collection, index) => (
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
                        {collection.linkedAvatar && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                            <LinkIcon fontSize="small" color="primary" />
                            <Typography variant="body2" color="primary.light">
                              Linked to: {collection.linkedAvatar.name}
                            </Typography>
                          </Box>
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
            {sortedCollections.map((collection, index) => (
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
                      {collection.linkedAvatar && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 1 }}>
                          <LinkIcon fontSize="small" color="primary" />
                          <Typography variant="body2" color="primary.light">
                            Linked to: {collection.linkedAvatar.name}
                          </Typography>
                        </Box>
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
        {currentCollection?.linkedAvatarId ? (
          <MenuItem onClick={() => {
            unlinkCollectionFromAvatar(currentCollection.id, currentCollection.linkedAvatarId);
            handleCloseMenu();
          }}>
            <LinkOffIcon fontSize="small" sx={{ mr: 1 }} />
            Unlink from Avatar
          </MenuItem>
        ) : (
          <MenuItem onClick={handleOpenLinkAvatarDialog}>
            <LinkIcon fontSize="small" sx={{ mr: 1 }} />
            Link to Avatar
          </MenuItem>
        )}
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
          
          <ImageUploader 
            onImageUpload={handleImageUpload} 
            initialImage={isEditing ? currentCollection?.thumbnail : ''}
          />
          
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

          <Grid item xs={12}>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="avatar-select-label">Link to Avatar (Optional)</InputLabel>
              <Select
                labelId="avatar-select-label"
                id="avatar-select"
                name="avatarId"
                value={formData.avatarId || ''}
                onChange={handleInputChange}
                displayEmpty
                label="Link to Avatar (Optional)"
                startAdornment={
                  <InputAdornment position="start">
                    <AvatarIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {getAvatarOptions().map((avatar) => (
                  <MenuItem key={avatar.id} value={avatar.id}>
                    {avatar.name} ({avatar.base})
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Linking a collection to an avatar helps organize assets specifically for that character
              </FormHelperText>
            </FormControl>
          </Grid>
          
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
            disabled={!formData.name.trim() || submitting}
          >
            {submitting ? <CircularProgress size={24} /> : isEditing ? 'Save Changes' : 'Create'}
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
          <Button 
            onClick={handleDeleteCollection} 
            color="error"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={linkAvatarDialogOpen}
        onClose={handleCloseLinkAvatarDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Link Collection to Avatar</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2, mt: 1 }}>
            Select an avatar to link to "{currentCollection?.name}"
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Linking a collection to an avatar helps organize assets specifically for that character.
          </Typography>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="link-avatar-select-label">Select Avatar</InputLabel>
            <Select
              labelId="link-avatar-select-label"
              id="link-avatar-select"
              value={selectedAvatarId}
              onChange={(e) => setSelectedAvatarId(e.target.value)}
              label="Select Avatar"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {avatars && avatars.map((avatar) => (
                <MenuItem key={avatar.id} value={avatar.id}>
                  {avatar.name} ({avatar.base})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLinkAvatarDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleLinkToAvatar}
            disabled={!selectedAvatarId || linkingAvatar}
          >
            {linkingAvatar ? <CircularProgress size={24} /> : 'Link Avatar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Collections;