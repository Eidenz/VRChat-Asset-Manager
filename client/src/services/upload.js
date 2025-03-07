// client/src/services/upload.js
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
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

export const uploadsAPI = {
  uploadImage,
};

export default uploadsAPI;