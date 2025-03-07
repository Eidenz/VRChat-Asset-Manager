// client/src/context/ApiContext.js - Context provider for API data
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { avatarsAPI, assetsAPI, collectionsAPI, settingsAPI } from '../services/api';

// Create context
const ApiContext = createContext();

// Custom hook to use the API context
export const useApi = () => useContext(ApiContext);

// API Context Provider component
export const ApiProvider = ({ children }) => {
  // State for different data entities
  const [avatars, setAvatars] = useState([]);
  const [assets, setAssets] = useState({
    all: [],
    clothing: [],
    props: [],
    accessories: [],
    textures: [],
    animations: [],
    favorites: [],
    recent: []
  });
  const [collections, setCollections] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState({
    avatars: false,
    assets: false,
    collections: false,
    settings: false
  });
  const [errors, setErrors] = useState({
    avatars: null,
    assets: null,
    collections: null,
    settings: null
  });

  // Fetch all avatars
  const fetchAvatars = useCallback(async () => {
    setLoading(prev => ({ ...prev, avatars: true }));
    setErrors(prev => ({ ...prev, avatars: null }));
    
    try {
      const response = await avatarsAPI.getAll();
      setAvatars(response.data);
    } catch (error) {
      console.error('Error fetching avatars:', error);
      setErrors(prev => ({ ...prev, avatars: error.message || 'Failed to fetch avatars' }));
    } finally {
      setLoading(prev => ({ ...prev, avatars: false }));
    }
  }, []);

  // Fetch all assets and categorize them
  const fetchAssets = useCallback(async () => {
    setLoading(prev => ({ ...prev, assets: true }));
    setErrors(prev => ({ ...prev, assets: null }));
    
    try {
      // Fetch all assets
      const allResponse = await assetsAPI.getAll();
      const allAssets = allResponse.data;
      setAssets(prev => ({ ...prev, all: allAssets }));
      
      // Categorize assets by type
      const clothing = allAssets.filter(asset => asset.type === 'Clothing');
      const props = allAssets.filter(asset => asset.type === 'Prop');
      const accessories = allAssets.filter(asset => asset.type === 'Accessory');
      const textures = allAssets.filter(asset => asset.type === 'Texture');
      const animations = allAssets.filter(asset => asset.type === 'Animation');
      
      // Get favorites
      const favoritesResponse = await assetsAPI.getFavorites();
      const favorites = favoritesResponse.data;
      
      // Get recent assets
      const recentResponse = await assetsAPI.getRecent(5);
      const recent = recentResponse.data;
      
      setAssets(prev => ({
        ...prev,
        clothing,
        props,
        accessories,
        textures,
        animations,
        favorites,
        recent
      }));
    } catch (error) {
      console.error('Error fetching assets:', error);
      setErrors(prev => ({ ...prev, assets: error.message || 'Failed to fetch assets' }));
    } finally {
      setLoading(prev => ({ ...prev, assets: false }));
    }
  }, []);

  // Fetch all collections
  const fetchCollections = useCallback(async () => {
    setLoading(prev => ({ ...prev, collections: true }));
    setErrors(prev => ({ ...prev, collections: null }));
    
    try {
      const response = await collectionsAPI.getAll();
      setCollections(response.data);
    } catch (error) {
      console.error('Error fetching collections:', error);
      setErrors(prev => ({ ...prev, collections: error.message || 'Failed to fetch collections' }));
    } finally {
      setLoading(prev => ({ ...prev, collections: false }));
    }
  }, []);

  // Fetch all settings
  const fetchSettings = useCallback(async () => {
    setLoading(prev => ({ ...prev, settings: true }));
    setErrors(prev => ({ ...prev, settings: null }));
    
    try {
      const response = await settingsAPI.getAll();
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setErrors(prev => ({ ...prev, settings: error.message || 'Failed to fetch settings' }));
    } finally {
      setLoading(prev => ({ ...prev, settings: false }));
    }
  }, []);

  // Function to get collection assets
  const fetchCollectionAssets = async (collectionId) => {
    try {
      const response = await collectionsAPI.getAssets(collectionId);
      return response.data;
    } catch (error) {
      console.error(`Error fetching assets for collection ${collectionId}:`, error);
      throw error;
    }
  };

  // Function to toggle asset favorite status
  const toggleAssetFavorite = async (assetId) => {
    try {
      const response = await assetsAPI.toggleFavorite(assetId);
      
      // Update assets state with the new favorite status
      setAssets(prev => {
        const newAll = prev.all.map(asset =>
          asset.id === assetId ? { ...asset, favorited: response.favorited } : asset
        );
        
        return {
          ...prev,
          all: newAll,
          clothing: prev.clothing.map(asset =>
            asset.id === assetId ? { ...asset, favorited: response.favorited } : asset
          ),
          props: prev.props.map(asset =>
            asset.id === assetId ? { ...asset, favorited: response.favorited } : asset
          ),
          accessories: prev.accessories.map(asset =>
            asset.id === assetId ? { ...asset, favorited: response.favorited } : asset
          ),
          textures: prev.textures.map(asset =>
            asset.id === assetId ? { ...asset, favorited: response.favorited } : asset
          ),
          animations: prev.animations.map(asset =>
            asset.id === assetId ? { ...asset, favorited: response.favorited } : asset
          ),
          favorites: response.favorited
            ? [...prev.favorites, newAll.find(a => a.id === assetId)]
            : prev.favorites.filter(a => a.id !== assetId)
        };
      });
      
      return response.favorited;
    } catch (error) {
      console.error(`Error toggling favorite for asset ${assetId}:`, error);
      throw error;
    }
  };

  // Function to toggle avatar favorite status
  const toggleAvatarFavorite = async (avatarId) => {
    try {
      const response = await avatarsAPI.toggleFavorite(avatarId);
      
      // Update avatars state with the new favorite status
      setAvatars(prev =>
        prev.map(avatar =>
          avatar.id === avatarId ? { ...avatar, favorited: response.favorited } : avatar
        )
      );
      
      return response.favorited;
    } catch (error) {
      console.error(`Error toggling favorite for avatar ${avatarId}:`, error);
      throw error;
    }
  };

  // Function to set avatar as current
  const setAvatarAsCurrent = async (avatarId) => {
    try {
      await avatarsAPI.setCurrent(avatarId);
      
      // Refetch all avatars to get updated lastUsed dates
      await fetchAvatars();
      
      return true;
    } catch (error) {
      console.error(`Error setting avatar ${avatarId} as current:`, error);
      throw error;
    }
  };

  // Function to add asset to collection
  const addAssetToCollection = async (collectionId, assetId) => {
    try {
      await collectionsAPI.addAsset(collectionId, assetId);
      
      // Refetch collections to update item counts
      await fetchCollections();
      
      return true;
    } catch (error) {
      console.error(`Error adding asset ${assetId} to collection ${collectionId}:`, error);
      throw error;
    }
  };

  // Function to remove asset from collection
  const removeAssetFromCollection = async (collectionId, assetId) => {
    try {
      await collectionsAPI.removeAsset(collectionId, assetId);
      
      // Refetch collections to update item counts
      await fetchCollections();
      
      return true;
    } catch (error) {
      console.error(`Error removing asset ${assetId} from collection ${collectionId}:`, error);
      throw error;
    }
  };

  // Function to create a new collection
  const createCollection = async (collectionData) => {
    try {
      const response = await collectionsAPI.create(collectionData);
      
      // Add new collection to state
      setCollections(prev => [...prev, response.data]);
      
      return response.data;
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  };

  // Function to update settings
  const updateSettings = async (newSettings) => {
    try {
      await settingsAPI.updateMultiple(newSettings);
      
      // Update settings state
      setSettings(prev => ({ ...prev, ...newSettings }));
      
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  // Load all data on initial mount
  useEffect(() => {
    fetchAvatars();
    fetchAssets();
    fetchCollections();
    fetchSettings();
  }, [fetchAvatars, fetchAssets, fetchCollections, fetchSettings]);

  // Value object to be provided by the context
  const value = {
    // Data
    avatars,
    assets,
    collections,
    settings,
    
    // Status
    loading,
    errors,
    
    // Fetch functions
    fetchAvatars,
    fetchAssets,
    fetchCollections,
    fetchSettings,
    fetchCollectionAssets,
    
    // Action functions
    toggleAssetFavorite,
    toggleAvatarFavorite,
    setAvatarAsCurrent,
    addAssetToCollection,
    removeAssetFromCollection,
    createCollection,
    updateSettings,
    
    // API services
    avatarsAPI,
    assetsAPI,
    collectionsAPI,
    settingsAPI
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};