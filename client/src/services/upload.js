// client/src/services/upload.js - Updated for better Docker compatibility
import axios from 'axios';

// Create axios instance with base URL that works in both development and production
const api = axios.create({
  // Use the same dynamic base URL determination as the main API service
  baseURL: process.env.REACT_APP_API_URL || (
    process.env.NODE_ENV === 'production' 
      ? '/api' 
      : 'http://localhost:5000/api'
  ),
});

/**
 * Upload an image file
 * @param {File} file - The image file to upload
 * @returns {Promise<Object>} Response with the uploaded file URL
 */
export const uploadImage = async (file) => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('image', file);
    
    // Set headers for multipart/form-data
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
    // Make the request
    const response = await api.post('/uploads/image', formData, config);
    
    // Return just the data
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    } else {
      throw { message: 'Network error while uploading' };
    }
  }
};

/**
 * Delete an uploaded image file
 * @param {string} imageUrl - The URL of the image to delete
 * @returns {Promise<Object>} Response indicating success or failure
 */
export const deleteImage = async (imageUrl) => {
  // Extract filename from URL
  const filename = getFilenameFromUrl(imageUrl);
  
  if (!filename) {
    console.warn('Cannot delete image: Invalid URL format', imageUrl);
    return { success: false, message: 'Invalid URL format' };
  }
  
  try {
    const response = await api.delete(`/uploads/image/${filename}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    } else {
      throw { message: 'Network error while deleting image' };
    }
  }
};

/**
 * Extract filename from an image URL
 * @param {string} url - The image URL
 * @returns {string|null} The extracted filename or null if not found
 */
export const getFilenameFromUrl = (url) => {
  if (!url) return null;
  
  // Handle only URLs with /uploads/ path
  if (!url.includes('/uploads/')) return null;
  
  // Extract the filename from the URL
  const parts = url.split('/');
  return parts[parts.length - 1];
};

export const uploadsAPI = {
  uploadImage,
  deleteImage,
  getFilenameFromUrl
};

export default uploadsAPI;