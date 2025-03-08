// src/components/features/AssetUploader.js - Updated with custom avatar bases support
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Checkbox,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Dialog,
  ListItemText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkIcon from '@mui/icons-material/Link';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Divider } from '@mui/material';

// Import API context and upload service
import { useApi } from '../../context/ApiContext';
import { uploadsAPI } from '../../services/upload';

const steps = ['Asset Details', 'Compatibility', 'Review'];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
};

const FALLBACK_ASSET_TYPES = [
  { id: 'clothing', name: 'Clothing' },
  { id: 'prop', name: 'Prop' },
  { id: 'accessory', name: 'Accessory' },
  { id: 'texture', name: 'Texture' },
  { id: 'animation', name: 'Animation' },
  { id: 'avatar', name: 'Full Avatar' },
  { id: 'shader', name: 'Shader' },
  { id: 'audio', name: 'Audio' },
  { id: 'prefab', name: 'Prefab' },
  { id: 'script', name: 'Script/Component' }
];

// Styled component for the upload area
const UploadArea = styled(Paper)(({ theme, isDragActive }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: isDragActive ? 
    theme.palette.action.hover : 
    theme.palette.background.default,
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  minHeight: 200,
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  }
}));

const ThumbnailPreview = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: 200,
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  }
}));

const AssetUploader = ({ onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [assetData, setAssetData] = useState({
    name: '',
    description: '',
    creator: '',
    downloadUrl: '',
    type: '',
    tags: [],
    compatibleWith: [],
    notes: '',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const [newTagValue, setNewTagValue] = useState('');
  const [showNewAvatarBaseInput, setShowNewAvatarBaseInput] = useState(false);
  const [newAvatarBaseName, setNewAvatarBaseInput] = useState('');
  const [newAvatarBaseId, setNewAvatarBaseId] = useState('');
  
  // Get data and functions from API context
  const { assetsAPI, avatarsAPI, fetchAssets } = useApi();
  
  // State for data loaded from API
  const [assetTypes, setAssetTypes] = useState([]);
  const [avatarBases, setAvatarBases] = useState([]);
  const [customAvatarBases, setCustomAvatarBases] = useState([]);
  const [assetTags, setAssetTags] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Load asset types, avatar bases, and tags on component mount
  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        // Fetch asset types
        let typesList = [];
        try {
          const typesResponse = await assetsAPI.getTypes();
          typesList = typesResponse.data;
          console.log('Loaded asset types:', typesList);
          
          // If types list is empty, use fallback
          if (!typesList || typesList.length === 0) {
            console.warn('No asset types returned from API, using fallback');
            typesList = FALLBACK_ASSET_TYPES;
          }
        } catch (typeError) {
          console.error('Error loading asset types:', typeError);
          typesList = FALLBACK_ASSET_TYPES;
        }
        setAssetTypes(typesList);
        
        // Fetch avatar bases
        try {
          const basesResponse = await avatarsAPI.getBases();
          const retrievedBases = basesResponse.data || [];
          setAvatarBases(retrievedBases);
          
          // Try to load custom bases from localStorage
          try {
            const savedCustomBases = localStorage.getItem('customAvatarBases');
            if (savedCustomBases) {
              const parsedBases = JSON.parse(savedCustomBases);
              setCustomAvatarBases(parsedBases);
            }
          } catch (localStorageError) {
            console.error('Error loading custom bases from localStorage:', localStorageError);
          }
        } catch (basesError) {
          console.error('Error loading avatar bases:', basesError);
          setAvatarBases([]);
        }
        
        // Fetch tags
        try {
          const tagsResponse = await assetsAPI.getTags();
          setAssetTags(tagsResponse.data || []);
        } catch (tagsError) {
          console.error('Error loading tags:', tagsError);
          setAssetTags([]);
        }
      } catch (error) {
        console.error('Error loading options:', error);
        setUploadError('Failed to load asset options. Using fallback values.');
        
        // Set fallback values
        setAssetTypes(FALLBACK_ASSET_TYPES);
      } finally {
        setLoadingOptions(false);
      }
    };
    
    fetchOptions();
  }, [assetsAPI, avatarsAPI]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleAddNewTag = () => {
    if (newTagValue && !assetData.tags.includes(newTagValue)) {
      // Add new tag to assetData
      setAssetData(prev => ({
        ...prev,
        tags: [...prev.tags, newTagValue]
      }));
      
      // Add to available tags if not already there
      if (!assetTags.some(tag => 
        (typeof tag === 'object' ? tag.name === newTagValue : tag === newTagValue)
      )) {
        setAssetTags(prev => [...prev, newTagValue]);
      }
      
      // Reset input
      setNewTagValue('');
      setShowNewTagInput(false);
    }
  };
  
  const handleAddNewAvatarBase = () => {
    if (newAvatarBaseName) {
      // Generate an ID if not provided
      const baseId = newAvatarBaseId || newAvatarBaseName.toLowerCase().replace(/\s+/g, '');
      
      // Create the new avatar base
      const newBase = {
        id: baseId,
        name: newAvatarBaseName
      };
      
      // Add to custom avatar bases
      const updatedCustomBases = [...customAvatarBases, newBase];
      setCustomAvatarBases(updatedCustomBases);
      
      // Save to localStorage for persistence
      try {
        localStorage.setItem('customAvatarBases', JSON.stringify(updatedCustomBases));
      } catch (error) {
        console.error('Error saving custom bases to localStorage:', error);
      }
      
      // If the asset is compatible with the new avatar base, add it to compatibleWith
      if (!assetData.compatibleWith.includes(newAvatarBaseName)) {
        setAssetData(prev => ({
          ...prev,
          compatibleWith: [...prev.compatibleWith, newAvatarBaseName]
        }));
      }
      
      // Reset input fields
      setNewAvatarBaseInput('');
      setNewAvatarBaseId('');
      setShowNewAvatarBaseInput(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAssetData({
      ...assetData,
      [name]: value,
    });
  };

  const handleTagsChange = (event) => {
    const {
      target: { value },
    } = event;
    setAssetData({
      ...assetData,
      tags: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleCompatibilityChange = (event) => {
    const {
      target: { value },
    } = event;
    setAssetData({
      ...assetData,
      compatibleWith: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleSubmit = async () => {
    setUploading(true);
    setUploadError('');
    
    try {
      // Determine which thumbnail to use
      let thumbnailUrl;
      if (assetData.serverUploadedImage) {
        console.log('Using server-uploaded image:', assetData.serverUploadedImage);
        thumbnailUrl = assetData.serverUploadedImage;
      } else {
        // Use a random placeholder image as fallback
        console.log('No server image, using placeholder');
        const randomId = Math.floor(Math.random() * 200);
        thumbnailUrl = `https://picsum.photos/id/${randomId}/280/200`;
      }
      
      // Prepare asset data for API
      let assetForApi = {
        ...assetData,
        fileSize: imageFile ? `${(imageFile.size / (1024 * 1024)).toFixed(2)} MB` : '10 MB', // Format file size
        filePath: `D:/VRChat/Assets/${assetData.type}/${assetData.name}.unitypackage`, // Placeholder path
        dateAdded: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        favorited: false,
        // Use the determined thumbnail URL
        thumbnail: thumbnailUrl,
        // Make sure type is set correctly
        type: assetData.type
      };
      
      // Log the data being sent for debugging
      console.log('Sending asset data:', { 
        thumbnail: assetForApi.thumbnail,
        serverUploadedImage: assetData.serverUploadedImage
      });
      
      // Call API to create asset
      const response = await assetsAPI.create(assetForApi);
      console.log('Asset created with response:', response);
      
      // Refresh assets list after successful creation
      await fetchAssets();
      
      setUploadSuccess(true);
    } catch (error) {
      console.error('Error creating asset:', error);
      setUploadSuccess(false);
      setUploadError(error.message || 'Failed to add asset. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setAssetData({
      name: '',
      description: '',
      creator: '',
      downloadUrl: '',
      type: '',
      tags: [],
      compatibleWith: [],
      notes: '',
    });
    setImageFile(null);
    setImagePreview('');
    setUploadSuccess(false);
    setUploadError('');
  };
  
  // Handle file selection for image upload
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };
  
  // Handle drag and drop events
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleImageUpload(file);
    }
  };
  
  // Common function to handle image upload
  const handleImageUpload = async (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file.');
      return;
    }
    
    setImageFile(file);
    
    // Create local preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Upload to server
    try {
      setUploadingImage(true);
      const result = await uploadsAPI.uploadImage(file);
      
      if (result.success) {
        console.log('Image upload successful:', result.data);
        // Store the URL from the server response and flag that it's from server
        setImagePreview(result.data.url);
        // Add a data attribute to track that this is a server-uploaded image
        setAssetData(prev => ({
          ...prev,
          serverUploadedImage: result.data.url
        }));
      } else {
        setUploadError('Failed to upload image.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('Error uploading image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };
  
  // Handle click on upload area
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  
  // Remove uploaded image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  // Combine API avatar bases with custom avatar bases
  const allAvatarBases = [...avatarBases, ...customAvatarBases];

  return (
    <>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h2">Add New Asset</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 2 }} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {loadingOptions ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading asset options...</Typography>
          </Box>
        ) : (
          <>
            {activeStep === 0 && (
              <Box>
                <Typography variant="h3" sx={{ mb: 2 }}>Asset Information</Typography>
                
                {/* Image Upload Section */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Asset Thumbnail</Typography>
                  
                  {imagePreview ? (
                    <ThumbnailPreview>
                      <img src={imagePreview} alt="Asset preview" />
                      <IconButton 
                        sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8, 
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          color: '#fff',
                          '&:hover': {
                            backgroundColor: 'rgba(255,0,0,0.7)',
                          }
                        }}
                        onClick={handleRemoveImage}
                      >
                        <DeleteIcon />
                      </IconButton>
                      {uploadingImage && (
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            right: 0, 
                            bottom: 0, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            backgroundColor: 'rgba(0,0,0,0.5)'
                          }}
                        >
                          <CircularProgress />
                        </Box>
                      )}
                    </ThumbnailPreview>
                  ) : (
                    <UploadArea 
                      onDragOver={handleDragOver} 
                      onDrop={handleDrop}
                      onClick={handleUploadClick}
                      isDragActive={false}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        style={{ display: 'none' }} 
                        accept="image/*" 
                      />
                      <CloudUploadIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body1">
                        Drag & drop an image here, or click to select
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Recommended size: 280x200 pixels, max size: 5MB
                      </Typography>
                      {uploadingImage && (
                        <Box sx={{ mt: 2 }}>
                          <CircularProgress size={24} />
                        </Box>
                      )}
                    </UploadArea>
                  )}
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Asset Name"
                      name="name"
                      value={assetData.name}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Creator"
                      name="creator"
                      value={assetData.creator}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel required>Asset Type</InputLabel>
                      <Select
                        name="type"
                        value={assetData.type}
                        onChange={handleChange}
                        label="Asset Type"
                      >
                        <MenuItem value=""><em>Select a type</em></MenuItem>
                        {assetTypes.map((type) => (
                          <MenuItem key={type.id} value={type.name}>
                            {type.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Download URL"
                      name="downloadUrl"
                      value={assetData.downloadUrl}
                      onChange={handleChange}
                      placeholder="https://example.com/asset"
                      required
                      helperText="URL where this asset can be downloaded from"
                      InputProps={{
                        startAdornment: (
                          <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={assetData.description}
                      onChange={handleChange}
                      multiline
                      rows={4}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Tags</InputLabel>
                    <Select
                      multiple
                      name="tags"
                      value={assetData.tags}
                      onChange={handleTagsChange}
                      input={<OutlinedInput label="Tags" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                      MenuProps={MenuProps}
                    >
                      {assetTags.map((tag) => (
                        <MenuItem key={typeof tag === 'object' ? tag.id : tag} value={typeof tag === 'object' ? tag.name : tag}>
                          <Checkbox checked={assetData.tags.indexOf(typeof tag === 'object' ? tag.name : tag) > -1} />
                          {typeof tag === 'object' ? tag.name : tag}
                        </MenuItem>
                      ))}
                      <Divider sx={{ my: 1 }} />
                      <MenuItem 
                        sx={{ fontStyle: 'italic', color: 'primary.main' }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowNewTagInput(true);
                        }}
                      >
                        <AddIcon fontSize="small" sx={{ mr: 1 }} />
                        Add new tag
                      </MenuItem>
                    </Select>
                  </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notes"
                      name="notes"
                      value={assetData.notes}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      placeholder="Add your personal notes about this asset..."
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {activeStep === 1 && (
              <Box>
                <Typography variant="h3" sx={{ mb: 2 }}>Compatibility Information</Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Select which avatar bases this asset is compatible with.
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Compatible Avatar Bases</InputLabel>
                  <Select
                    multiple
                    name="compatibleWith"
                    value={assetData.compatibleWith}
                    onChange={handleCompatibilityChange}
                    input={<OutlinedInput label="Compatible Avatar Bases" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {allAvatarBases.map((base) => (
                      <MenuItem key={base.id} value={base.name}>
                        <Checkbox checked={assetData.compatibleWith.indexOf(base.name) > -1} />
                        <ListItemText primary={base.name} />
                      </MenuItem>
                    ))}
                    <Divider sx={{ my: 1 }} />
                    <MenuItem
                      sx={{ fontStyle: 'italic', color: 'primary.main' }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowNewAvatarBaseInput(true);
                      }}
                    >
                      <AddIcon fontSize="small" sx={{ mr: 1 }} />
                      Add new avatar base
                    </MenuItem>
                  </Select>
                </FormControl>

                <Dialog open={showNewAvatarBaseInput} onClose={() => setShowNewAvatarBaseInput(false)}>
                  <DialogTitle>Add New Avatar Base</DialogTitle>
                  <DialogContent>
                    <TextField
                      autoFocus
                      margin="dense"
                      label="Base Name"
                      fullWidth
                      value={newAvatarBaseName}
                      onChange={(e) => setNewAvatarBaseInput(e.target.value)}
                    />
                    <TextField
                      margin="dense"
                      label="Base ID"
                      fullWidth
                      value={newAvatarBaseId}
                      onChange={(e) => setNewAvatarBaseId(e.target.value)}
                      helperText="Optional: Provide a unique ID for this base"
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setShowNewAvatarBaseInput(false)}>Cancel</Button>
                    <Button onClick={handleAddNewAvatarBase} disabled={!newAvatarBaseName}>
                      Add
                    </Button>
                  </DialogActions>
                </Dialog>
                
                <Alert severity="info" sx={{ mb: 3 }}>
                  Being specific about compatibility helps you find suitable assets for your avatars later.
                </Alert>
              </Box>
            )}
            
            {activeStep === 2 && (
              <Box>
                <Typography variant="h3" sx={{ mb: 2 }}>Review & Add Asset</Typography>
                
                {!uploading && !uploadSuccess && (
                  <Grid container spacing={3}>
                    {/* Image Preview */}
                    <Grid item xs={12}>
                      {imagePreview ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                          <img 
                            src={imagePreview} 
                            alt="Asset thumbnail" 
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: 200, 
                              borderRadius: 8,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }} 
                          />
                        </Box>
                      ) : (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          bgcolor: 'background.default',
                          borderRadius: 2,
                          p: 3,
                          mb: 3
                        }}>
                          <ImageIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography color="text.secondary">
                            No image provided (a placeholder will be used)
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                
                    <Grid item xs={12} md={6}>
                      <Typography variant="h3" sx={{ mb: 1 }}>Asset Details</Typography>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary">Name</Typography>
                        <Typography variant="body1">{assetData.name || 'Not specified'}</Typography>
                      </Box>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary">Creator</Typography>
                        <Typography variant="body1">{assetData.creator || 'Not specified'}</Typography>
                      </Box>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary">Type</Typography>
                        <Typography variant="body1">{assetData.type || 'Not specified'}</Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h3" sx={{ mb: 1 }}>Link & Compatibility</Typography>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary">Download URL</Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: assetData.downloadUrl ? 'primary.main' : 'text.secondary',
                            fontStyle: assetData.downloadUrl ? 'normal' : 'italic'
                          }}
                        >
                          {assetData.downloadUrl || 'Not specified'}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary">Compatible Avatar Bases</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                          {assetData.compatibleWith.length > 0 ? (
                            assetData.compatibleWith.map((base) => (
                              <Chip key={base} label={base} size="small" />
                            ))
                          ) : (
                            <Typography variant="body1" fontStyle="italic">None specified</Typography>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                    
                    {assetData.description && (
                      <Grid item xs={12}>
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="h3" sx={{ mb: 1 }}>Description</Typography>
                          <Typography variant="body1">{assetData.description}</Typography>
                        </Box>
                      </Grid>
                    )}

                    {assetData.notes && (
                      <Grid item xs={12}>
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="h3" sx={{ mb: 1 }}>Personal Notes</Typography>
                          <Typography variant="body1">{assetData.notes}</Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                )}
                
                {uploading && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                    <CircularProgress size={60} sx={{ mb: 3 }} />
                    <Typography variant="h3">Adding Asset...</Typography>
                    <Typography variant="body1" color="text.secondary">
                      Please wait while we add this asset to your library.
                    </Typography>
                  </Box>
                )}
                
                {uploadSuccess && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        backgroundColor: 'success.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        mb: 3,
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 50, color: 'white' }} />
                    </Box>
                    <Typography variant="h2" sx={{ mb: 2 }}>Asset Added Successfully!</Typography>
                    <Typography variant="body1" sx={{ mb: 4 }}>
                      The asset has been added to your library.
                    </Typography>
                    <Button variant="contained" onClick={handleReset}>
                      Add Another Asset
                    </Button>
                  </Box>
                )}
                
                {uploadError && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {uploadError}
                  </Alert>
                )}
              </Box>
            )}
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button
          disabled={activeStep === 0 || uploading || uploadSuccess || loadingOptions}
          onClick={handleBack}
        >
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={uploading || uploadSuccess || !assetData.name || !assetData.creator || !assetData.downloadUrl || loadingOptions}
          >
            Add Asset
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={
              loadingOptions ||
              (activeStep === 0 && (!assetData.name || !assetData.creator || !assetData.downloadUrl))
            }
          >
            Next
          </Button>
        )}
      </DialogActions>

      <Dialog open={showNewTagInput} onClose={() => setShowNewTagInput(false)}>
        <DialogTitle>Add New Tag</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tag Name"
            fullWidth
            value={newTagValue}
            onChange={(e) => setNewTagValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newTagValue && !assetData.tags.includes(newTagValue)) {
                handleAddNewTag();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewTagInput(false)}>Cancel</Button>
          <Button 
            onClick={handleAddNewTag}
            disabled={!newTagValue || assetData.tags.includes(newTagValue)}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AssetUploader;