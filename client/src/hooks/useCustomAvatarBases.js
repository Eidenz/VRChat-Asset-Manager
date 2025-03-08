// src/hooks/useCustomAvatarBases.js
import { useState, useEffect } from 'react';

/**
 * Custom hook to manage custom avatar bases stored in localStorage.
 * This provides a way to persist user-defined avatar bases between sessions.
 */
const useCustomAvatarBases = () => {
  const [customBases, setCustomBases] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load custom bases from localStorage on mount
  useEffect(() => {
    try {
      const storedBases = localStorage.getItem('customAvatarBases');
      if (storedBases) {
        setCustomBases(JSON.parse(storedBases));
      }
    } catch (error) {
      console.error('Error loading custom avatar bases:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Save custom bases to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('customAvatarBases', JSON.stringify(customBases));
      } catch (error) {
        console.error('Error saving custom avatar bases:', error);
      }
    }
  }, [customBases, loading]);
  
  /**
   * Add a new custom avatar base
   * @param {string} name - The display name of the avatar base
   * @param {string} id - Optional ID (if not provided, a normalized version of the name will be used)
   * @returns {Object} The newly added base
   */
  const addCustomBase = (name, id = '') => {
    if (!name) return null;
    
    // Generate an ID if not provided
    const baseId = id || name.toLowerCase().replace(/\s+/g, '');
    
    // Check if base with this ID already exists
    if (customBases.some(base => base.id === baseId)) {
      return null;
    }
    
    const newBase = { id: baseId, name };
    setCustomBases(prev => [...prev, newBase]);
    return newBase;
  };
  
  /**
   * Remove a custom avatar base
   * @param {string} id - The ID of the base to remove
   * @returns {boolean} Success status
   */
  const removeCustomBase = (id) => {
    if (!id) return false;
    
    setCustomBases(prev => prev.filter(base => base.id !== id));
    return true;
  };
  
  /**
   * Update an existing custom avatar base
   * @param {string} id - The ID of the base to update
   * @param {Object} data - New data for the base (name)
   * @returns {Object|null} The updated base or null if not found
   */
  const updateCustomBase = (id, data) => {
    if (!id || !data) return null;
    
    let updatedBase = null;
    
    setCustomBases(prev => {
      const index = prev.findIndex(base => base.id === id);
      if (index === -1) return prev;
      
      const updated = { ...prev[index], ...data };
      updatedBase = updated;
      
      const newBases = [...prev];
      newBases[index] = updated;
      return newBases;
    });
    
    return updatedBase;
  };
  
  return {
    customBases,
    loading,
    addCustomBase,
    removeCustomBase,
    updateCustomBase
  };
};

export default useCustomAvatarBases;