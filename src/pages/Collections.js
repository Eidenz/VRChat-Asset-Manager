// src/pages/Collections.js
import React, { useState } from 'react';
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
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SortIcon from '@mui/icons-material/Sort';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';

// Import mock data
import { collections } from '../data/mockData';

const Collections = () => {
  const [userCollections, setUserCollections] = useState(collections);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  const handleOpenMenu = (event, collection) => {
    setAnchorEl(event.currentTarget);
    setSelectedCollection(collection);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedCollection(null);
  };

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    setNewCollectionName('');
    setNewCollectionDescription('');
  };

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;
    
    const newCollection = {
      id: Date.now(),
      name: newCollectionName.trim(),
      description: newCollectionDescription.trim(),
      thumbnail: `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/220/120`,
      itemCount: 0,
    };
    
    setUserCollections([...userCollections, newCollection]);
    handleCloseCreateModal();
  };

  const handleDeleteCollection = () => {
    if (!selectedCollection) return;
    
    setUserCollections(userCollections.filter(c => c.id !== selectedCollection.id));
    handleCloseMenu();
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(userCollections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setUserCollections(items);
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
            >
              Sort
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateModal}
            >
              New Collection
            </Button>
          </Box>
        </Box>
      </motion.div>
      
      <Divider sx={{ mb: 3 }} />
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="collections" direction={viewMode === 'grid' ? 'horizontal' : 'vertical'}>
          {(provided) => (
            <Box 
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {viewMode === 'grid' ? (
                <Grid container spacing={2}>
                  {userCollections.map((collection, index) => (
                    <Draggable key={collection.id} draggableId={collection.id.toString()} index={index}>
                      {(provided) => (
                        <Grid 
                          item 
                          xs={12} 
                          sm={6} 
                          md={4} 
                          lg={3} 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                          >
                            <Card sx={{ position: 'relative' }}>
                              <IconButton
                                sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', zIndex: 1 }}
                                onClick={(e) => handleOpenMenu(e, collection)}
                              >
                                <MoreVertIcon />
                              </IconButton>
                              <CardActionArea>
                                <CardMedia
                                  component="img"
                                  height="120"
                                  image={collection.thumbnail}
                                  alt={collection.name}
                                />
                                <CardContent>
                                  <Typography variant="h3" noWrap>{collection.name}</Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {collection.itemCount} items
                                  </Typography>
                                </CardContent>
                              </CardActionArea>
                            </Card>
                          </motion.div>
                        </Grid>
                      )}
                    </Draggable>
                  ))}
                </Grid>
              ) : (
                <Box>
                  {userCollections.map((collection, index) => (
                    <Draggable key={collection.id} draggableId={collection.id.toString()} index={index}>
                      {(provided) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                        >
                          <Card 
                            sx={{ 
                              mb: 2, 
                              display: 'flex', 
                              height: 80,
                            }}
                          >
                            <CardMedia
                              component="img"
                              sx={{ width: 80 }}
                              image={collection.thumbnail}
                              alt={collection.name}
                            />
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              p: 2, 
                              flexGrow: 1 
                            }}>
                              <Typography variant="h3">{collection.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {collection.itemCount} items
                              </Typography>
                            </Box>
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
                      )}
                    </Draggable>
                  ))}
                </Box>
              )}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
      
      {/* Collection Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleCloseMenu}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteCollection}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
      
      {/* Create Collection Modal */}
      <Dialog 
        open={createModalOpen} 
        onClose={handleCloseCreateModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Collection</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Collection Name"
            type="text"
            fullWidth
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="description"
            label="Description (Optional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={newCollectionDescription}
            onChange={(e) => setNewCollectionDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateModal} color="inherit">Cancel</Button>
          <Button 
            onClick={handleCreateCollection} 
            variant="contained" 
            disabled={!newCollectionName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Collections;