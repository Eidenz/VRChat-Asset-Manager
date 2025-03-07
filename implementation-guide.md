# API Implementation Guide for VRChat Asset Manager

This guide outlines how to update the remaining frontend components in the VRChat Asset Manager to use the new SQLite database via the API instead of mock data.

## Overview of Changes

We've already updated several key components:

1. **Dashboard** - Updated to use the API context for loading data
2. **Avatars page** - Complete implementation using API calls
3. **AssetCard component** - Adapted to work with API context
4. **Settings page** - Updated to use and save settings via API

## General Approach for Remaining Components

For each component, follow these steps:

1. Import the API context at the top of the file:
   ```javascript
   import { useApi } from '../context/ApiContext';
   ```

2. Use the context to access data and functions:
   ```javascript
   const { assets, collections, loading, errors, toggleAssetFavorite } = useApi();
   ```

3. Replace direct uses of mock data with data from the API context
4. Update event handlers to call API functions
5. Add loading states and error handling

## Components to Update

### Pages

1. **Collections.js**
   - Use `collections` from API context
   - Use `createCollection`, `updateSettings`, and `deleteCollection` functions
   - Add loading/error handling

2. **CollectionDetail.js**
   - Use `fetchCollectionAssets` from API context 
   - Use `addAssetToCollection` and `removeAssetFromCollection` functions
   - Add loading/error handling

3. **Clothing.js**, **Props.js**, **Textures.js**
   - Use `assets.clothing`, `assets.props`, etc. from API context
   - Use `toggleAssetFavorite` function
   - Add loading/error handling

4. **Favorites.js**
   - Use `assets.favorites` from API context
   - Use `toggleAssetFavorite` function
   - Add loading/error handling

### Components

1. **CompatibilityChecker.js**
   - Use `avatars` and `assets.all` from API context
   - Add loading/error handling

2. **AssetUploader.js**
   - Use `assetsAPI.create` or `assetsAPI.update` for form submission
   - Use API context to fetch asset types and avatar bases

3. **AssetDetailsModal.js**
   - Use `toggleAssetFavorite` from API context
   - Add loading state when performing operations

## Example Patterns

### Loading State Pattern

```javascript
{loading.collections ? (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
    <CircularProgress />
  </Box>
) : (
  // Content here
)}
```

### Error Handling Pattern

```javascript
{errors.collections && (
  <Alert severity="error" sx={{ mb: 3 }}>
    {errors.collections}
  </Alert>
)}
```

### API Function Call Pattern

```javascript
const handleToggleFavorite = async (asset) => {
  try {
    await toggleAssetFavorite(asset.id);
  } catch (error) {
    console.error('Error toggling favorite:', error);
    // Optional: Show error message to user
  }
};
```

## Data Structure Mapping

Note that the API returns slightly different field names than the mock data. Here's a mapping:

| Mock Data Property | API Response Property |
|-------------------|------------------------|
| dateAdded         | date_added             |
| lastUsed          | last_used              |
| filePath          | file_path              |
| downloadUrl       | download_url           |
| fileSize          | file_size              |

The ApiContext handles most of this mapping for you, but be aware of it when working directly with the API services.

## Testing

After updating each component:

1. Test all CRUD operations (Create, Read, Update, Delete)
2. Verify loading states appear correctly
3. Test error handling by temporarily breaking an API endpoint
4. Ensure all filters and sorting still work correctly

## Production Considerations

For production deployment:

1. Add more robust error handling and retry mechanisms
2. Consider implementing caching for API responses
3. Add validation to ensure data integrity before sending to the API
4. Add authentication if needed in the future
