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
      // First fetch the favorited assets to get a reference
      const favoritesResponse = await assetsAPI.getFavorites();
      const favoriteAssets = favoritesResponse.data;
      
      // Create a Set of favorite asset IDs for quick lookup
      const favoriteIds = new Set(favoriteAssets.map(asset => asset.id));
      
      // Fetch all assets
      const allResponse = await assetsAPI.getAll();
      let allAssets = allResponse.data;
      
      // Make sure the favorited status is consistent with the favorites endpoint
      allAssets = allAssets.map(asset => ({
        ...asset,
        // Override the favorited property based on presence in favorites
        favorited: favoriteIds.has(asset.id)
      }));
      
      // Categorize assets by type
      const clothing = allAssets.filter(asset => asset.type === 'Clothing');
      const props = allAssets.filter(asset => asset.type === 'Prop');
      const accessories = allAssets.filter(asset => asset.type === 'Accessory');
      const textures = allAssets.filter(asset => asset.type === 'Texture');
      const animations = allAssets.filter(asset => asset.type === 'Animation');
      
      // Get recent assets
      const recentResponse = await assetsAPI.getRecent(3);
      let recentAssets = recentResponse.data;
      
      // Ensure recent assets have correct favorited status
      recentAssets = recentAssets.map(asset => ({
        ...asset,
        favorited: favoriteIds.has(asset.id)
      }));
      
      setAssets(prev => ({
        ...prev,
        all: allAssets,
        clothing,
        props,
        accessories,
        textures,
        animations,
        favorites: favoriteAssets,
        recent: recentAssets
      }));
    } catch (error) {
      console.error('Error fetching assets:', error);
      setErrors(prev => ({ ...prev, assets: error.message || 'Failed to fetch assets' }));
    } finally {
      setLoading(prev => ({ ...prev, assets: false }));
    }
  }, [assetsAPI]);

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
        // Find the asset in the all array to get its full data
        const assetToUpdate = prev.all.find(a => a.id === assetId);
        if (!assetToUpdate) return prev; // Safety check
        
        // Create updated asset with new favorite status
        const updatedAsset = { 
          ...assetToUpdate, 
          favorited: response.favorited 
        };
        
        // Update all asset categories including recent
        return {
          ...prev,
          all: prev.all.map(asset =>
            asset.id === assetId ? updatedAsset : asset
          ),
          clothing: prev.clothing.map(asset =>
            asset.id === assetId ? updatedAsset : asset
          ),
          props: prev.props.map(asset =>
            asset.id === assetId ? updatedAsset : asset
          ),
          accessories: prev.accessories.map(asset =>
            asset.id === assetId ? updatedAsset : asset
          ),
          textures: prev.textures.map(asset =>
            asset.id === assetId ? updatedAsset : asset
          ),
          animations: prev.animations.map(asset =>
            asset.id === assetId ? updatedAsset : asset
          ),
          // Important: Also update the recent array that's shown on Dashboard
          recent: prev.recent.map(asset =>
            asset.id === assetId ? updatedAsset : asset
          ),
          // Update favorites array - either add or remove the asset
          favorites: response.favorited
            ? [...prev.favorites.filter(a => a.id !== assetId), updatedAsset]
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