// src/components/features/AssetUploader.js
import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const steps = ['Upload Files', 'Asset Information', 'Compatibility', 'Review & Submit'];

const DropzoneBox = styled(Box)(({ theme, isDragActive, isDragReject, acceptedFiles }) => ({
  border: `2px dashed ${
    isDragReject
      ? theme.palette.error.main
      : isDragActive
      ? theme.palette.primary.main
      : acceptedFiles && acceptedFiles.length
      ? theme.palette.success.main
      : 'rgba(255, 255, 255, 0.2)'
  }`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: isDragActive 
    ? 'rgba(126, 77, 210, 0.05)'
    : isDragReject
    ? 'rgba(231, 76, 60, 0.05)'
    : acceptedFiles && acceptedFiles.length
    ? 'rgba(0, 184, 148, 0.05)'
    : 'transparent',
}));

const FileItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
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

const avatarBases = [
  'Feline3.0',
  'Leporidae2.5',
  'HumanMale4.2',
  'HumanFemale4.2',
  'Fantasy2.0',
  'HumanSlim3.1',
  'Toon1.0',
  'Robot2.4',
];

const assetTags = [
  'Clothing',
  'Prop',
  'Accessory',
  'Weapon',
  'Hairstyle',
  'Wings',
  'Animated',
  'Cyberpunk',
  'Fantasy',
  'Sci-Fi',
  'Medieval',
  'Modern',
  'Casual',
  'Formal',
  'Cute',
  'Horror',
  'Magical',
  'Steampunk',
];

const AssetUploader = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [files, setFiles] = useState([]);
  const [assetData, setAssetData] = useState({
    name: '',
    description: '',
    price: '0',
    type: '',
    tags: [],
    compatibleBases: [],
    isPublic: true,
    thumbnailIndex: 0,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
    
    setFiles([...files, ...newFiles]);
  }, [files]);
  
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/x-zip-compressed': ['.zip', '.unitypackage'],
      'application/zip': ['.zip'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'model/gltf+json': ['.gltf', '.glb'],
      'model/fbx': ['.fbx'],
    },
    maxSize: 100 * 1024 * 1024, // 100MB max
  });

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
      compatibleBases: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleCheckboxChange = (event) => {
    setAssetData({
      ...assetData,
      [event.target.name]: event.target.checked,
    });
  };

  const handleSubmit = () => {
    setUploading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // 90% chance of success
      if (Math.random() > 0.1) {
        setUploadSuccess(true);
        setUploadError('');
      } else {
        setUploadSuccess(false);
        setUploadError('There was an error uploading your asset. Please try again.');
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
      price: '0',
      type: '',
      tags: [],
      compatibleBases: [],
      isPublic: true,
      thumbnailIndex: 0,
    });
    setUploadSuccess(false);
    setUploadError('');
  };

  return (
    <Paper sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 3 }}>
      <Typography variant="h2" sx={{ mb: 3 }}>Upload New Asset</Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {activeStep === 0 && (
        <Box>
          <Typography variant="h3" sx={{ mb: 2 }}>Upload Files</Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Upload your asset files (Unity packages, models, textures, etc.) and preview images.
          </Typography>
          
          <DropzoneBox 
            {...getRootProps()} 
            isDragActive={isDragActive} 
            isDragReject={isDragReject}
            acceptedFiles={files}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon fontSize="large" color={isDragActive ? 'primary' : 'inherit'} sx={{ mb: 2 }} />
            <Typography variant="h3" sx={{ mb: 1 }}>
              {isDragActive
                ? 'Drop the files here'
                : isDragReject
                ? 'Some files are not accepted'
                : 'Drag & drop files here, or click to select files'}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Accept .zip, .unitypackage, image files, .fbx, .gltf, and .glb files up to 100MB
            </Typography>
          </DropzoneBox>
          
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
      
      {activeStep === 1 && (
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
                  <MenuItem value="Clothing">Clothing</MenuItem>
                  <MenuItem value="Prop">Prop</MenuItem>
                  <MenuItem value="Accessory">Accessory</MenuItem>
                  <MenuItem value="Complete Avatar">Complete Avatar</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price (0 for free)"
                name="price"
                type="number"
                value={assetData.price}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
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
              <FormControlLabel
                control={
                  <Checkbox
                    checked={assetData.isPublic}
                    onChange={handleCheckboxChange}
                    name="isPublic"
                  />
                }
                label="Make this asset public (visible to other users)"
              />
            </Grid>
          </Grid>
        </Box>
      )}
      
      {activeStep === 2 && (
        <Box>
          <Typography variant="h3" sx={{ mb: 2 }}>Compatibility Information</Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Select which avatar bases your asset is compatible with.
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Compatible Avatar Bases</InputLabel>
            <Select
              multiple
              name="compatibleBases"
              value={assetData.compatibleBases}
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
                <MenuItem key={base} value={base}>
                  <Checkbox checked={assetData.compatibleBases.indexOf(base) > -1} />
                  {base}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Being specific about compatibility helps users find assets that work with their avatars.
          </Alert>
          
          {/* Add more compatibility fields as needed */}
        </Box>
      )}
      
      {activeStep === 3 && (
        <Box>
          <Typography variant="h3" sx={{ mb: 2 }}>Review & Submit</Typography>
          
          {!uploading && !uploadSuccess && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h3" sx={{ mb: 1 }}>Asset Details</Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">Name</Typography>
                  <Typography variant="body1">{assetData.name || 'Not specified'}</Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">Type</Typography>
                  <Typography variant="body1">{assetData.type || 'Not specified'}</Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">Price</Typography>
                  <Typography variant="body1">
                    {assetData.price === '0' ? 'Free' : `$${assetData.price}`}
                  </Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">Visibility</Typography>
                  <Typography variant="body1">
                    {assetData.isPublic ? 'Public' : 'Private'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h3" sx={{ mb: 1 }}>Files & Compatibility</Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">Files</Typography>
                  <Typography variant="body1">{files.length} file(s) uploaded</Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">Compatible Avatar Bases</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {assetData.compatibleBases.length > 0 ? (
                      assetData.compatibleBases.map((base) => (
                        <Chip key={base} label={base} size="small" />
                      ))
                    ) : (
                      <Typography variant="body1">None specified</Typography>
                    )}
                  </Box>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">Tags</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {assetData.tags.length > 0 ? (
                      assetData.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))
                    ) : (
                      <Typography variant="body1">None specified</Typography>
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
            </Grid>
          )}
          
          {uploading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <CircularProgress size={60} sx={{ mb: 3 }} />
              <Typography variant="h3">Uploading Asset...</Typography>
              <Typography variant="body1" color="text.secondary">
                This may take a few minutes depending on the file size.
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
              <Typography variant="h2" sx={{ mb: 2 }}>Upload Successful!</Typography>
              <Typography variant="body1" sx={{ mb: 4 }}>
                Your asset has been uploaded successfully and will be available in your library.
              </Typography>
              <Button variant="contained" onClick={handleReset}>
                Upload Another Asset
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
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          disabled={activeStep === 0 || uploading || uploadSuccess}
          onClick={handleBack}
        >
          Back
        </Button>
        <Box>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={uploading || uploadSuccess || files.length === 0 || !assetData.name}
            >
              Submit
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={
                (activeStep === 0 && files.length === 0) ||
                (activeStep === 1 && !assetData.name)
              }
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default AssetUploader;