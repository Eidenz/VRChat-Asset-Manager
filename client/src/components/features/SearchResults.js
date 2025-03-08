// First, let's create a SearchResults component
// src/components/features/SearchResults.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Tab,
  Tabs,
  Divider,
  CircularProgress,
  InputBase,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import FolderIcon from '@mui/icons-material/Folder';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import ClearIcon from '@mui/icons-material/Clear';

import { useApi } from '../../context/ApiContext';

const SearchResults = ({ open, onClose, initialQuery = '' }) => {
  const navigate = useNavigate();
  const { assets, avatars, collections } = useApi();
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState({
    assets: [],
    avatars: [],
    collections: []
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Perform search when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults({
        assets: [],
        avatars: [],
        collections: []
      });
      return;
    }
    
    setLoading(true);
    
    // Convert to lowercase for case-insensitive search
    const query = searchQuery.toLowerCase();
    
    // Search in assets
    const matchingAssets = assets.all.filter(asset => 
      asset.name.toLowerCase().includes(query) ||
      asset.creator.toLowerCase().includes(query) ||
      asset.description?.toLowerCase().includes(query) ||
      asset.tags?.some(tag => tag.toLowerCase().includes(query))
    );
    
    // Search in avatars
    const matchingAvatars = avatars.filter(avatar => 
      avatar.name.toLowerCase().includes(query) ||
      avatar.base.toLowerCase().includes(query) ||
      avatar.notes?.toLowerCase().includes(query)
    );
    
    // Search in collections
    const matchingCollections = collections.filter(collection => 
      collection.name.toLowerCase().includes(query) ||
      collection.description?.toLowerCase().includes(query)
    );
    
    setResults({
      assets: matchingAssets,
      avatars: matchingAvatars,
      collections: matchingCollections
    });
    
    setLoading(false);
    
    // Auto-select the tab with results
    if (matchingAssets.length > 0) {
      setActiveTab(0);
    } else if (matchingAvatars.length > 0) {
      setActiveTab(1);
    } else if (matchingCollections.length > 0) {
      setActiveTab(2);
    }
  }, [searchQuery, assets, avatars, collections]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Navigate to selected item
  const handleItemClick = (type, id) => {
    onClose();
    
    switch (type) {
      case 'asset':
        // For assets, we don't have a dedicated page, so we'll navigate to the type page
        // and potentially could implement selecting the asset there
        const asset = results.assets.find(a => a.id === id);
        if (asset) {
          switch (asset.type) {
            case 'Clothing':
              navigate('/clothing');
              break;
            case 'Prop':
              navigate('/props');
              break;
            case 'Texture':
              navigate('/textures');
              break;
            default:
              navigate('/');
          }
        }
        break;
      case 'avatar':
        navigate('/avatars');
        break;
      case 'collection':
        navigate(`/collections/${id}`);
        break;
      default:
        navigate('/');
    }
  };
  
  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  // Total results count
  const totalResults = results.assets.length + results.avatars.length + results.collections.length;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      PaperProps={{ sx: { minHeight: '60vh' } }}
    >
      <DialogTitle sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 1,
            p: 1
          }}>
            <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <InputBase
              placeholder="Search assets, avatars, collections..."
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              fullWidth
            />
            {searchQuery && (
              <IconButton size="small" onClick={handleClearSearch}>
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          <IconButton onClick={onClose} sx={{ ml: 1 }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <CircularProgress />
          </Box>
        ) : !searchQuery ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column' }}>
            <SearchIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Enter a search term to find assets, avatars, and collections
            </Typography>
          </Box>
        ) : totalResults === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column' }}>
            <SearchIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No results found for "{searchQuery}"
            </Typography>
          </Box>
        ) : (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="search results tabs">
                <Tab 
                  label={`Assets (${results.assets.length})`} 
                  disabled={results.assets.length === 0} 
                />
                <Tab 
                  label={`Avatars (${results.avatars.length})`} 
                  disabled={results.avatars.length === 0} 
                />
                <Tab 
                  label={`Collections (${results.collections.length})`} 
                  disabled={results.collections.length === 0} 
                />
              </Tabs>
            </Box>
            
            <Box sx={{ p: 2 }}>
              {activeTab === 0 && (
                <List>
                  {results.assets.map((asset) => (
                    <ListItem 
                      key={asset.id} 
                      alignItems="flex-start"
                      button
                      divider
                      onClick={() => handleItemClick('asset', asset.id)}
                    >
                      <ListItemAvatar>
                        <Avatar 
                          variant="rounded" 
                          src={asset.thumbnail}
                          alt={asset.name}
                          sx={{ width: 60, height: 60 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={asset.name}
                        secondary={
                          <Box>
                            <Typography
                              sx={{ display: 'block' }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {asset.creator} • {asset.type}
                            </Typography>
                            <Typography
                              sx={{ display: 'block' }}
                              component="span"
                              variant="body2"
                              color="text.secondary"
                            >
                              {asset.description}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              {asset.tags?.slice(0, 3).map((tag, index) => (
                                <Chip 
                                  key={index} 
                                  label={tag} 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              ))}
                              {asset.tags?.length > 3 && (
                                <Chip 
                                  label={`+${asset.tags.length - 3}`} 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              )}
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              
              {activeTab === 1 && (
                <List>
                  {results.avatars.map((avatar) => (
                    <ListItem 
                      key={avatar.id} 
                      alignItems="flex-start"
                      button
                      divider
                      onClick={() => handleItemClick('avatar', avatar.id)}
                    >
                      <ListItemAvatar>
                        <Avatar 
                          variant="rounded" 
                          src={avatar.thumbnail}
                          alt={avatar.name}
                          sx={{ width: 60, height: 60 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={avatar.name}
                        secondary={
                          <Box>
                            <Typography
                              sx={{ display: 'block' }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              Base: {avatar.base}
                            </Typography>
                            <Typography
                              sx={{ display: 'block' }}
                              component="span"
                              variant="body2"
                              color="text.secondary"
                            >
                              {avatar.notes}
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                              {avatar.isCurrent && (
                                <Chip 
                                  label="Current" 
                                  size="small" 
                                  color="success"
                                  sx={{ mr: 0.5 }}
                                />
                              )}
                              {avatar.favorited && (
                                <Chip 
                                  label="Favorite" 
                                  size="small" 
                                  color="error"
                                  sx={{ mr: 0.5 }}
                                />
                              )}
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              
              {activeTab === 2 && (
                <List>
                  {results.collections.map((collection) => (
                    <ListItem 
                      key={collection.id} 
                      alignItems="flex-start"
                      button
                      divider
                      onClick={() => handleItemClick('collection', collection.id)}
                    >
                      <ListItemAvatar>
                        <Avatar 
                          variant="rounded" 
                          src={collection.thumbnail}
                          alt={collection.name}
                          sx={{ width: 60, height: 60 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={collection.name}
                        secondary={
                          <Box>
                            <Typography
                              sx={{ display: 'block' }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'}
                            </Typography>
                            <Typography
                              sx={{ display: 'block' }}
                              component="span"
                              variant="body2"
                              color="text.secondary"
                            >
                              {collection.description}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SearchResults;