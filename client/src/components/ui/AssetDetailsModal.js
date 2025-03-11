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
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  InputAdornment
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkIcon from '@mui/icons-material/Link';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import VerifiedIcon from '@mui/icons-material/Verified';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { formatCurrency, SUPPORTED_CURRENCIES, getCurrencyInfo } from '../../utils/currencyUtils';

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
  overflow: 'hidden'
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
  const [isEditingFileInfo, setIsEditingFileInfo] = useState(false);
  const [notes, setNotes] = useState('');
  const [fileInfo, setFileInfo] = useState({
    version: '',
    filePath: '',
    downloadUrl: '',
    price: '',
    currency: 'USD'
  });
  const [saving, setSaving] = useState(false);
  const [localAsset, setLocalAsset] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const { toggleAssetFavorite, updateAssetDetails, updateAssetLastUsed, assets, deleteAsset, preferredCurrency } = useApi();

  // Use localAsset to ensure we always show the latest data
  useEffect(() => {
    if (asset) {
      setLocalAsset(asset);
      setNotes(asset.notes || '');
      setFileInfo({
        version: asset.version || '',
        filePath: asset.filePath || '',
        downloadUrl: asset.downloadUrl || '',
        price: asset.price || '',
        currency: asset.currency || preferredCurrency || 'USD'
      });
    }
  }, [asset, preferredCurrency]);

  // Update localAsset when assets change (e.g. after toggling favorite)
  useEffect(() => {
    if (localAsset && assets.all) {
      // Find the latest version of this asset in the assets.all array
      const updatedAsset = assets.all.find(a => a.id === localAsset.id);
      if (updatedAsset) {
        setLocalAsset(updatedAsset);
        
        // Also update fileInfo state to match any external changes
        setFileInfo({
          version: updatedAsset.version || '',
          filePath: updatedAsset.filePath || '',
          downloadUrl: updatedAsset.downloadUrl || '',
          price: updatedAsset.price || '',
          currency: updatedAsset.currency || preferredCurrency || 'USD'
        });
      }
    }
  }, [assets, localAsset, preferredCurrency]);

  // Determine if tabs should be shown based on content
  const hasCompatibility = localAsset?.compatibleWith && localAsset.compatibleWith.length > 0;
  const hasDescription = localAsset?.description && localAsset.description.trim() !== '';
  const hasTags = localAsset?.tags && localAsset.tags.length > 0;
  
  // Determine if tabs should be shown at all
  const showTabs = hasCompatibility || hasDescription || hasTags;

  // If the active tab doesn't have content, try to find one that does
  useEffect(() => {
    if (showTabs) {
      if (tabValue === 0 && !hasCompatibility) {
        if (hasDescription) setTabValue(1);
        else if (hasTags) setTabValue(2);
      } else if (tabValue === 1 && !hasDescription) {
        if (hasCompatibility) setTabValue(0);
        else if (hasTags) setTabValue(2);
      } else if (tabValue === 2 && !hasTags) {
        if (hasCompatibility) setTabValue(0);
        else if (hasDescription) setTabValue(1);
      }
    }
  }, [tabValue, hasCompatibility, hasDescription, hasTags, showTabs]);

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

  const handleEditFileInfo = () => {
    setIsEditingFileInfo(true);
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      // Create an updated asset object with all properties
      const updatedAsset = {
        ...localAsset,
        notes
      };
      
      // Use the new updateAssetDetails function from context
      await updateAssetDetails(localAsset.id, updatedAsset);
      
      // Update local state
      setLocalAsset(updatedAsset);
      
      setIsEditingNotes(false);
    } catch (error) {
      console.error('Error updating notes:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFileInfo = async () => {
    setSaving(true);
    try {
      // Process price to include currency symbol
      let formattedPrice = fileInfo.price;
      if (formattedPrice && !formattedPrice.includes(getCurrencyInfo(fileInfo.currency).symbol)) {
        const numericValue = fileInfo.price.replace(/[^\d.]/g, '');
        if (numericValue) {
          formattedPrice = `${getCurrencyInfo(fileInfo.currency).symbol}${numericValue}`;
        }
      }
  
      // Create an updated asset object with ALL properties from localAsset
      // plus our updated properties
      const updatedAsset = {
        ...localAsset,
        version: fileInfo.version,
        filePath: fileInfo.filePath,
        downloadUrl: fileInfo.downloadUrl,
        price: formattedPrice,
        currency: fileInfo.currency
      };
      
      // Use the new updateAssetDetails function from context instead of direct API call
      await updateAssetDetails(localAsset.id, updatedAsset);
      
      // Update local state to reflect changes
      setLocalAsset(updatedAsset);
      
      // Apply the changes to the form state too
      setFileInfo({
        version: updatedAsset.version || '',
        filePath: updatedAsset.filePath || '',
        downloadUrl: updatedAsset.downloadUrl || '',
        price: updatedAsset.price || '',
        currency: updatedAsset.currency || 'USD'
      });
      
      // Exit edit mode
      setIsEditingFileInfo(false);
    } catch (error) {
      console.error('Error updating file info:', error);
      // Show error message to user
      alert('Failed to save changes: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const handleFileInfoChange = (e) => {
    const { name, value } = e.target;
    setFileInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriceChange = (e) => {
    const rawValue = e.target.value;
    // Just store the raw value for now - we'll format it on save
    setFileInfo(prev => ({
      ...prev,
      price: rawValue
    }));
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

  const handleOpenDeleteConfirm = () => {
    setDeleteConfirmOpen(true);
  };
  
  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
  };
  
  const handleDeleteAsset = async () => {
    setDeleting(true);
    try {
      await deleteAsset(localAsset.id);
      handleCloseDeleteConfirm();
      handleClose(); // Close the details modal
    } catch (error) {
      console.error('Error deleting asset:', error);
    } finally {
      setDeleting(false);
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <InfoLabel>File Information</InfoLabel>
                <IconButton 
                  size="small" 
                  onClick={isEditingFileInfo ? handleSaveFileInfo : handleEditFileInfo}
                  disabled={saving}
                >
                  {saving ? (
                    <CircularProgress size={20} />
                  ) : isEditingFileInfo ? (
                    <SaveIcon fontSize="small" />
                  ) : (
                    <EditIcon fontSize="small" />
                  )}
                </IconButton>
              </Box>
              {isEditingFileInfo ? (
                <Box 
                  sx={{ 
                    p: 2, 
                    backgroundColor: 'background.default', 
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}
                >

                  <TextField
                    fullWidth
                    label="Version"
                    name="version"
                    value={fileInfo.version}
                    onChange={handleFileInfoChange}
                    placeholder="e.g., 1.0"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="File Path"
                    name="filePath"
                    value={fileInfo.filePath}
                    onChange={handleFileInfoChange}
                    placeholder="Local path to the file"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Download URL"
                    name="downloadUrl"
                    value={fileInfo.downloadUrl}
                    onChange={handleFileInfoChange}
                    placeholder="URL where this asset can be downloaded"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LinkIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={8}>
                      <TextField
                        fullWidth
                        label="Price"
                        name="price"
                        value={fileInfo.price}
                        onChange={handlePriceChange}
                        placeholder={`${getCurrencyInfo(fileInfo.currency).symbol}0.00`}
                        size="small"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoneyIcon fontSize="small" />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="currency-select-label">Currency</InputLabel>
                        <Select
                          labelId="currency-select-label"
                          id="currency-select"
                          name="currency"
                          value={fileInfo.currency}
                          label="Currency"
                          onChange={handleFileInfoChange}
                        >
                          {SUPPORTED_CURRENCIES.map((currency) => (
                            <MenuItem key={currency.code} value={currency.code}>
                              {currency.code}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              ) : (
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

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Price:</Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: localAsset.price ? 'primary.main' : 'text.secondary'
                      }}
                    >
                      {localAsset.price ? 
                        `${localAsset.price} (${localAsset.currency || 'USD'})` : 
                        'Not specified'}
                    </Typography>
                  </Box>
                </Box>
              )}
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

        {/* Tabs section - Only show if there's actual content */}
        {showTabs && (
          <Box sx={{ width: '100%', mt: 4 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
              aria-label="asset details tabs"
            >
              {hasCompatibility && <Tab label="Compatibility" />}
              {hasDescription && <Tab label="Description" />}
              {hasTags && <Tab label="Tags" />}
            </Tabs>
            <Divider />
            
            <Box sx={{ p: 2 }}>
              {tabValue === 0 && hasCompatibility && (
                <Box>
                  <Typography variant="h3" sx={{ mb: 2 }}>Compatibility Information</Typography>
                  
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    This asset is compatible with the following avatar bases:
                  </Typography>
                  
                  <List sx={{ bgcolor: 'background.default', borderRadius: 2, mb: 3 }}>
                    {localAsset.compatibleWith && localAsset.compatibleWith.map((base, index) => {
                      // Check if this base is in the owned variants
                      const isOwned = localAsset.ownedVariant && (
                        Array.isArray(localAsset.ownedVariant) 
                          ? localAsset.ownedVariant.includes(base)
                          : localAsset.ownedVariant === base
                      );
                      
                      return (
                        <ListItem key={index} sx={{
                          position: 'relative',
                          bgcolor: 'transparent',
                          borderRadius: 1,
                          mb: 0.5
                        }}>
                          <ListItemIcon>
                            {isOwned ? (
                              <VerifiedIcon color="success" />
                            ) : (
                              <CheckCircleIcon color="disabled" />
                            )}
                          </ListItemIcon>
                          <ListItemText 
                            primary={base} 
                            secondary={isOwned ? "You own this variant" : "Compatible but not owned"}
                          />
                          {isOwned && (
                            <Box
                              sx={{
                                position: 'absolute',
                                right: 16,
                                bgcolor: 'success.main',
                                color: 'white',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <VerifiedIcon fontSize="small" sx={{ mr: 0.5 }} />
                              Owned
                            </Box>
                          )}
                        </ListItem>
                      );
                    })}
                  </List>
                </Box>
              )}
                
              {tabValue === 1 && hasDescription && (
                <Box>
                  <Typography variant="h3" sx={{ mb: 2 }}>Description</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {localAsset.description}
                  </Typography>
                </Box>
              )}
              
              {tabValue === 2 && hasTags && (
                <Box>
                  <Typography variant="h3" sx={{ mb: 2 }}>Tags</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {localAsset.tags && localAsset.tags.map((tag, index) => (
                      <StyledChip key={index} label={tag} />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        )}
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
        <Button 
          startIcon={<DeleteIcon />} 
          color="error" 
          onClick={handleOpenDeleteConfirm}
        >
          Delete
        </Button>
        <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>Close</Button>
      </DialogActions>

      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
      >
        <DialogTitle>Delete Asset</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{localAsset?.name}"? This will remove it from your library.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button 
            color="error" 
            onClick={handleDeleteAsset}
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default AssetDetailsModal;