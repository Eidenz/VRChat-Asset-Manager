// src/components/ui/ImageUploader.js
import React, { useRef, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { uploadsAPI } from '../../services/upload';

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

const ImagePreview = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: 200,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  }
}));

const ImageUploader = ({ onImageUpload, initialImage = '' }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialImage);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // Handle drag and drop
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

  // Common image upload function
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
      setUploading(true);
      const result = await uploadsAPI.uploadImage(file);
      
      if (result.success) {
        console.log('Image upload successful:', result.data);
        // Update preview with server URL
        setImagePreview(result.data.url);
        // Call the callback with the server URL
        onImageUpload(result.data.url);
      } else {
        setUploadError('Failed to upload image.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
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
    onImageUpload(''); // Clear the image in parent component
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>Image</Typography>
      
      {imagePreview ? (
        <ImagePreview>
          <img src={imagePreview} alt="Preview" />
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
          {uploading && (
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
        </ImagePreview>
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
            Recommended size: 160x180 pixels, max size: 5MB
          </Typography>
          {uploading && (
            <Box sx={{ mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
          {uploadError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {uploadError}
            </Typography>
          )}
        </UploadArea>
      )}
    </Box>
  );
};

export default ImageUploader;