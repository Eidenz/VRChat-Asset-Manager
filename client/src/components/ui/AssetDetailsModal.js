// src/components/ui/AssetDetailsModal.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Divider,
  TextField,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DownloadIcon from '@mui/icons-material/Download';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HistoryIcon from '@mui/icons-material/History';
import DescriptionIcon from '@mui/icons-material/Description';
import StorageIcon from '@mui/icons-material/Storage';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkIcon from '@mui/icons-material/Link';
import { styled } from '@mui/material/styles';

// Import API context
import { useApi } from '../../context/ApiContext';

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: 'rgba(255,255,255,0.05)',
  color: theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  },
}));

const InfoItem = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  marginBottom: theme.spacing(0.5),
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
}));

const AssetDetailsModal = ({ open, handleClose, asset }) => {
  const [tabValue, setTabValue] = useState(0);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [localAsset, setLocalAsset] = useState(null);
  
  const { toggleAssetFavorite, assetsAPI, updateAssetLastUsed, assets } = useApi();

  // Use localAsset to ensure we always show the latest data
  useEffect(() => {
    if (asset) {
      setLocalAsset(asset);
      setNotes(asset.notes || '');
    }
  }, [asset]);

  // Update localAsset when assets change (e.g. after toggling favorite)
  useEffect(() => {
    if (localAsset && assets.all) {
      // Find the latest version of this asset in the assets.all array
      const updatedAsset = assets.all.find(a => a.id === localAsset.id);
      if (updatedAsset) {
        setLocalAsset(updatedAsset);
      }
    }
  }, [assets, localAsset]);

  if (!localAsset) return null;

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleToggleFavorite = async () => {
    try {
      await toggleAssetFavorite(localAsset.id);
      // The localAsset will be updated via the effect hook when assets change
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleEditNotes = () => {
    setIsEditingNotes(true);
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      // Save the notes
      await assetsAPI.update(localAsset.id, { 
        ...localAsset,
        notes
      });
      
      // Update local asset copy
      setLocalAsset({
        ...localAsset,
        notes
      });
      
      setIsEditingNotes(false);
    } catch (error) {
      console.error('Error updating notes:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
  };

  const handleDownload = async () => {
    if (localAsset.downloadUrl) {
      // Update last used date when downloading
      try {
        await updateAssetLastUsed(localAsset.id);
      } catch (error) {
        console.error('Error updating last used date:', error);
      }
      
      window.open(localAsset.downloadUrl, '_blank');
    } else {
      console.log('No download URL available');
      alert('No download URL available for this asset');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: 'background.paper',
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h2">{localAsset.name}</Typography>
        <IconButton aria-label="close" onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Asset Image */}
          <Grid item xs={12} md={5}>
            <Box
              component="img"
              src={localAsset.thumbnail}
              alt={localAsset.name}
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}
            />
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button 
                variant="contained" 
                fullWidth
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                disabled={!localAsset.downloadUrl}
              >
                Download Asset
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleToggleFavorite}
                startIcon={localAsset.favorited ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              >
                {localAsset.favorited ? 'Favorited' : 'Add to Favorites'}
              </Button>
            </Box>
          </Grid>

          {/* Asset Details */}
          <Grid item xs={12} md={7}>
            <InfoItem>
              <InfoLabel>Creator</InfoLabel>
              <InfoValue>{localAsset.creator}</InfoValue>
            </InfoItem>

            <InfoItem>
              <InfoLabel>Type</InfoLabel>
              <InfoValue>{localAsset.type}</InfoValue>
            </InfoItem>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <InfoItem>
                  <InfoLabel>Date Added</InfoLabel>
                  <InfoValue sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarTodayIcon fontSize="small" />
                    {formatDate(localAsset.dateAdded)}
                  </InfoValue>
                </InfoItem>
              </Grid>
              <Grid item xs={6}>
                <InfoItem>
                  <InfoLabel>Last Used</InfoLabel>
                  <InfoValue sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HistoryIcon fontSize="small" />
                    {formatDate(localAsset.lastUsed)}
                  </InfoValue>
                </InfoItem>
              </Grid>
            </Grid>

            <InfoItem>
              <InfoLabel>File Information</InfoLabel>
              <Box 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'background.default', 
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1 
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Size:</Typography>
                  <Typography variant="body2">{localAsset.fileSize || 'Unknown'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Version:</Typography>
                  <Typography variant="body2">{localAsset.version || 'N/A'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Local Path:</Typography>
                  <Tooltip title={localAsset.filePath || 'No path specified'}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        maxWidth: '250px', 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        if (localAsset.filePath) 
                          navigator.clipboard.writeText(localAsset.filePath);
                      }}
                    >
                      {localAsset.filePath || 'No path specified'}
                    </Typography>
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Download URL:</Typography>
                  <Tooltip title={localAsset.downloadUrl || 'No URL specified'}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        maxWidth: '250px', 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: localAsset.downloadUrl ? 'pointer' : 'default',
                        color: localAsset.downloadUrl ? 'primary.main' : 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                      onClick={() => {
                        if (localAsset.downloadUrl) 
                          window.open(localAsset.downloadUrl, '_blank');
                      }}
                    >
                      {localAsset.downloadUrl ? (
                        <>
                          <LinkIcon fontSize="small" />
                          Original Source
                        </>
                      ) : (
                        'No URL specified'
                      )}
                    </Typography>
                  </Tooltip>
                </Box>
              </Box>
            </InfoItem>

            <InfoItem>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <InfoLabel>Notes</InfoLabel>
                <IconButton 
                  size="small" 
                  onClick={isEditingNotes ? handleSaveNotes : handleEditNotes}
                  disabled={saving}
                >
                  {saving ? (
                    <CircularProgress size={20} />
                  ) : isEditingNotes ? (
                    <SaveIcon fontSize="small" />
                  ) : (
                    <EditIcon fontSize="small" />
                  )}
                </IconButton>
              </Box>
              {isEditingNotes ? (
                <TextField
                  multiline
                  rows={4}
                  fullWidth
                  value={notes}
                  onChange={handleNotesChange}
                  variant="outlined"
                  placeholder="Add your notes about this asset here..."
                />
              ) : (
                <InfoValue>{notes || 'No notes yet.'}</InfoValue>
              )}
            </InfoItem>
          </Grid>
        </Grid>

        {/* Tabs section */}
        <Box sx={{ width: '100%', mt: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            aria-label="asset details tabs"
          >
            <Tab label="Compatibility" />
            <Tab label="Description" />
            <Tab label="Tags" />
          </Tabs>
          <Divider />
          
          <Box sx={{ p: 2 }}>
            {tabValue === 0 && (
              <Box>
                <Typography variant="h3" sx={{ mb: 2 }}>Compatibility Information</Typography>
                
                <Typography variant="body1" sx={{ mb: 2 }}>
                  This asset is compatible with the following avatar bases:
                </Typography>
                
                <List sx={{ bgcolor: 'background.default', borderRadius: 2, mb: 3 }}>
                  {localAsset.compatibleWith && localAsset.compatibleWith.map((base, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary={base} />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="body1" sx={{ mb: 2 }}>
                  For best results, ensure your avatar uses standard bone naming and has a humanoid rig.
                </Typography>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="h3" sx={{ mb: 2 }}>Installation Notes</Typography>
                  <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 2 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      1. Extract the package into your Unity project
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      2. Drag the prefab onto your avatar in the hierarchy
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      3. Adjust the position as needed
                    </Typography>
                    <Typography variant="body1">
                      4. Add the provided animator controller layers to your avatar's FX controller
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
            
            {tabValue === 1 && (
              <Box>
                <Typography variant="h3" sx={{ mb: 2 }}>Description</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {localAsset.description || 'No description provided.'}
                </Typography>
              </Box>
            )}
            
            {tabValue === 2 && (
              <Box>
                <Typography variant="h3" sx={{ mb: 2 }}>Tags</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {localAsset.tags && localAsset.tags.map((tag, index) => (
                    <StyledChip key={index} label={tag} />
                  ))}
                  {(!localAsset.tags || localAsset.tags.length === 0) && (
                    <Typography variant="body1">No tags assigned to this asset.</Typography>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          startIcon={<FileCopyIcon />} 
          onClick={() => {
            if (localAsset.filePath)
              navigator.clipboard.writeText(localAsset.filePath);
          }}
          disabled={!localAsset.filePath}
        >
          Copy Path
        </Button>
        <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssetDetailsModal;