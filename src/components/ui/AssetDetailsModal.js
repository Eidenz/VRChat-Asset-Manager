// src/components/ui/AssetDetailsModal.js
import React, { useState } from 'react';
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
  const [isFavorite, setIsFavorite] = useState(asset?.favorited || false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(asset?.notes || '');

  if (!asset) return null;

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleEditNotes = () => {
    setIsEditingNotes(true);
  };

  const handleSaveNotes = () => {
    // In a real app, you'd save this to your state management or backend
    setIsEditingNotes(false);
    // Update asset notes in parent component or state management
    console.log('Saving notes:', notes);
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

  const handleDownload = () => {
    if (asset.downloadUrl) {
      window.open(asset.downloadUrl, '_blank');
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
        <Typography variant="h2">{asset.name}</Typography>
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
              src={asset.thumbnail}
              alt={asset.name}
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
              >
                Download Asset
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleToggleFavorite}
                startIcon={isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              >
                {isFavorite ? 'Favorited' : 'Add to Favorites'}
              </Button>
            </Box>
          </Grid>

          {/* Asset Details */}
          <Grid item xs={12} md={7}>
            <InfoItem>
              <InfoLabel>Creator</InfoLabel>
              <InfoValue>{asset.creator}</InfoValue>
            </InfoItem>

            <InfoItem>
              <InfoLabel>Type</InfoLabel>
              <InfoValue>{asset.type}</InfoValue>
            </InfoItem>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <InfoItem>
                  <InfoLabel>Date Added</InfoLabel>
                  <InfoValue sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarTodayIcon fontSize="small" />
                    {formatDate(asset.dateAdded)}
                  </InfoValue>
                </InfoItem>
              </Grid>
              <Grid item xs={6}>
                <InfoItem>
                  <InfoLabel>Last Used</InfoLabel>
                  <InfoValue sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HistoryIcon fontSize="small" />
                    {formatDate(asset.lastUsed)}
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
                  <Typography variant="body2">{asset.fileSize}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Version:</Typography>
                  <Typography variant="body2">{asset.version}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Local Path:</Typography>
                  <Tooltip title={asset.filePath}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        maxWidth: '250px', 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                      }}
                      onClick={() => {navigator.clipboard.writeText(asset.filePath)}}
                    >
                      {asset.filePath}
                    </Typography>
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Download URL:</Typography>
                  <Tooltip title={asset.downloadUrl}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        maxWidth: '250px', 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                      onClick={() => {window.open(asset.downloadUrl, '_blank')}}
                    >
                      <LinkIcon fontSize="small" />
                      Original Source
                    </Typography>
                  </Tooltip>
                </Box>
              </Box>
            </InfoItem>

            <InfoItem>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <InfoLabel>Notes</InfoLabel>
                <IconButton size="small" onClick={isEditingNotes ? handleSaveNotes : handleEditNotes}>
                  {isEditingNotes ? <SaveIcon fontSize="small" /> : <EditIcon fontSize="small" />}
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
                  {asset.compatibleWith.map((base, index) => (
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
                  {asset.description}
                </Typography>
              </Box>
            )}
            
            {tabValue === 2 && (
              <Box>
                <Typography variant="h3" sx={{ mb: 2 }}>Tags</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {asset.tags.map((tag, index) => (
                    <StyledChip key={index} label={tag} />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button startIcon={<FileCopyIcon />} onClick={() => {navigator.clipboard.writeText(asset.filePath)}}>
          Copy Path
        </Button>
        <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssetDetailsModal;