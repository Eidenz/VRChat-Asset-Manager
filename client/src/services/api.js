// client/src/services/api.js - API service for making requests to the backend
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for handling common request configurations
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed in the future
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common response processing
api.interceptors.response.use(
  (response) => {
    // Return just the data from successful responses
    return response.data;
  },
  (error) => {
    // Handle errors - you can enhance this with custom error handling
    if (error.response) {
      // Server responded with an error status
      console.error('API Error:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request);
      return Promise.reject({ message: 'Network error, please check your connection' });
    } else {
      // Error setting up the request
      console.error('Request Error:', error.message);
      return Promise.reject({ message: 'Failed to make request' });
    }
  }
);

// Avatar API services
const avatarsAPI = {
  getAll: () => api.get('/avatars'),
  getById: (id) => api.get(`/avatars/${id}`),
  create: (data) => api.post('/avatars', data),
  update: (id, data) => api.put(`/avatars/${id}`, data),
  toggleCurrent: (id) => api.put(`/avatars/${id}/current`),
  toggleFavorite: (id) => api.put(`/avatars/${id}/favorite`),
  delete: (id) => api.delete(`/avatars/${id}`),
  getBases: () => api.get('/avatars/bases/all'),
};

// Asset API services
const assetsAPI = {
  getAll: () => api.get('/assets'),
  getRecent: (limit = 5) => api.get(`/assets/recent?limit=${limit}`),
  getFavorites: () => api.get('/assets/favorites'),
  getByType: (type) => api.get(`/assets/types/${type}`),
  getById: (id) => api.get(`/assets/${id}`),
  create: (data) => api.post('/assets', data),
  update: (id, data) => api.put(`/assets/${id}`, data),
  updateLastUsed: (id) => api.put(`/assets/${id}/used`),
  toggleFavorite: (id) => api.put(`/assets/${id}/favorite`),
  delete: (id) => api.delete(`/assets/${id}`),
  getTypes: () => api.get('/assets/types/all'),
  getTags: () => api.get('/assets/tags/all'),
};

// Collection API services
const collectionsAPI = {
  getAll: () => api.get('/collections'),
  getById: (id) => api.get(`/collections/${id}`),
  getAssets: (id) => api.get(`/collections/${id}/assets`),
  create: (data) => api.post('/collections', data),
  update: (id, data) => api.put(`/collections/${id}`, data),
  delete: (id) => api.delete(`/collections/${id}`),
  addAsset: (id, assetId) => api.post(`/collections/${id}/assets`, { assetId }),
  addAssets: (id, assetIds) => api.post(`/collections/${id}/assets/batch`, { assetIds }),
  removeAsset: (id, assetId) => api.delete(`/collections/${id}/assets/${assetId}`),
};

// Settings API services
const settingsAPI = {
  getAll: () => api.get('/settings'),
  get: (key) => api.get(`/settings/${key}`),
  update: (key, value) => api.put(`/settings/${key}`, { value }),
  updateMultiple: (settings) => api.post('/settings', settings),
};

// Export all API services
export {
  avatarsAPI,
  assetsAPI,
  collectionsAPI,
  settingsAPI,
};