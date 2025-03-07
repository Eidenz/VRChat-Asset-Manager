// src/components/features/AssetUploader.js
import React, { useState, useRef } from 'react';
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
  FormControlLabel,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Import types and compatibility data from mock data
import { assetTypes, avatarBases, assetTags } from '../../data/mockData';

const steps = ['Asset Details', 'Upload Files', 'Compatibility', 'Review'];

const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed rgba(255, 255, 255, 0.2)`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: 'rgba(126, 77, 210, 0.05)',
  },
}));

const FileItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
  backgroundColor: 'rgba(255,255,255,0.05)',
  borderRadius: theme.shape.borderRadius,
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
};

const AssetUploader = ({ onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [files, setFiles] = useState([]);
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
  
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files).map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: URL.createObjectURL(file)
    }));
    
    setFiles([...files, ...newFiles]);
  };
  
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    URL.revokeObjectURL(newFiles[index].preview);
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
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

  const handleSubmit = () => {
    setUploading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // 90% chance of success for the simulation
      if (Math.random() > 0.1) {
        setUploadSuccess(true);
        setUploadError('');
      } else {
        setUploadSuccess(false);
        setUploadError('There was an error adding the asset. Please try again.');
      }
      setUploading(false);
    }, 2000);
  };

  const handleReset = () => {
    setActiveStep(0);
    setFiles([]);
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
    setUploadSuccess(false);
    setUploadError('');
  };

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
        
        {activeStep === 0 && (
          <Box>
            <Typography variant="h3" sx={{ mb: 2 }}>Asset Information</Typography>
            
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
                  <InputLabel>Asset Type</InputLabel>
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
                  helperText="Where can this asset be downloaded from?"
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
                      <MenuItem key={tag} value={tag}>
                        <Checkbox checked={assetData.tags.indexOf(tag) > -1} />
                        {tag}
                      </MenuItem>
                    ))}
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
            <Typography variant="h3" sx={{ mb: 2 }}>Upload Files (Optional)</Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              If you have local copies of this asset, you can upload them here for easy access. This is optional if you've provided a download URL.
            </Typography>
            
            <input
              type="file"
              multiple
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept=".zip,.unitypackage,image/*,.fbx,.gltf,.glb"
            />
            
            <UploadBox onClick={handleUploadClick}>
              <CloudUploadIcon fontSize="large" sx={{ mb: 2 }} />
              <Typography variant="h3" sx={{ mb: 1 }}>
                Click to select files
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Accept .zip, .unitypackage, image files, .fbx, .gltf, and .glb files
              </Typography>
            </UploadBox>
            
            {files.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h3" sx={{ mb: 2 }}>Uploaded Files ({files.length})</Typography>
                {files.map((file, index) => (
                  <FileItem key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {file.type.startsWith('image/') ? (
                        <Box
                          component="img"
                          src={file.preview}
                          sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1, mr: 2 }}
                        />
                      ) : (
                        <Box
                          sx={{ 
                            width: 40, 
                            height: 40, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            backgroundColor: 'background.default',
                            borderRadius: 1,
                            mr: 2
                          }}
                        >
                          {file.name.endsWith('.zip') || file.name.endsWith('.unitypackage')
                            ? '📦'
                            : file.name.endsWith('.fbx') || file.name.endsWith('.gltf') || file.name.endsWith('.glb')
                            ? '🔷'
                            : '📄'}
                        </Box>
                      )}
                      <Box>
                        <Typography variant="body1" noWrap>{file.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      onClick={() => removeFile(index)}
                      color="error"
                      startIcon={<CloseIcon />}
                    >
                      Remove
                    </Button>
                  </FileItem>
                ))}
              </Box>
            )}
          </Box>
        )}
        
        {activeStep === 2 && (
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
                {avatarBases.map((base) => (
                  <MenuItem key={base.id} value={base.name}>
                    <Checkbox checked={assetData.compatibleWith.indexOf(base.name) > -1} />
                    {base.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Being specific about compatibility helps you find suitable assets for your avatars later.
            </Alert>
          </Box>
        )}
        
        {activeStep === 3 && (
          <Box>
            <Typography variant="h3" sx={{ mb: 2 }}>Review & Add Asset</Typography>
            
            {!uploading && !uploadSuccess && (
              <Grid container spacing={3}>
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
                  <Typography variant="h3" sx={{ mb: 1 }}>Files & Compatibility</Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">Files</Typography>
                    <Typography variant="body1">
                      {files.length > 0 ? `${files.length} file(s) uploaded` : 'No files uploaded (using download URL)'}
                    </Typography>
                  </Box>
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
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button
          disabled={activeStep === 0 || uploading || uploadSuccess}
          onClick={handleBack}
        >
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={uploading || uploadSuccess || !assetData.name || !assetData.creator}
          >
            Add Asset
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={
              (activeStep === 0 && (!assetData.name || !assetData.creator))
            }
          >
            Next
          </Button>
        )}
      </DialogActions>
    </>
  );
};

export default AssetUploader;