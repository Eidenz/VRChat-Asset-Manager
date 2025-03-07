// src/components/features/CompatibilityChecker.js
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material/styles';

// Import API context
import { useApi } from '../../context/ApiContext';

const ResultItem = styled(Box)(({ theme, status }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: 
    status === 'yes' ? 'rgba(0, 184, 148, 0.1)' : 
    status === 'mostly' || status === 'partial' ? 'rgba(253, 203, 110, 0.1)' : 
    status === 'no' ? 'rgba(231, 76, 60, 0.1)' : 'transparent',
  marginBottom: theme.spacing(1),
}));

// Note: In the future, this could be fetched from the backend
// For now, we'll keep it in the component as a fallback
const compatibilityMatrix = {
  'Feline3.0': {
    'HumanMale4.2': {
      boneStructure: 'partial',
      materials: 'yes',
      animations: 'partial',
      notes: 'Limb proportions differ significantly'
    },
    'HumanFemale4.2': {
      boneStructure: 'partial',
      materials: 'yes',
      animations: 'partial',
      notes: 'Limb proportions differ significantly'
    },
    'Fantasy2.0': {
      boneStructure: 'mostly',
      materials: 'yes',
      animations: 'mostly',
      notes: 'Good compatibility overall with minor adjustments'
    }
  },
  'HumanMale4.2': {
    'HumanFemale4.2': {
      boneStructure: 'yes',
      materials: 'yes',
      animations: 'yes',
      notes: 'Excellent compatibility with minimal adjustments'
    },
    'HumanSlim3.1': {
      boneStructure: 'mostly',
      materials: 'yes',
      animations: 'mostly',
      notes: 'Some scaling needed for best results'
    }
  }
};

const CompatibilityChecker = () => {
  // Use the API context
  const { avatars, assets, loading, errors, assetsAPI } = useApi();

  const [sourceAvatar, setSourceAvatar] = useState('');
  const [targetAvatar, setTargetAvatar] = useState('');
  const [asset, setAsset] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [mode, setMode] = useState('asset'); // 'asset' or 'avatar'
  const [compatibilityData, setCompatibilityData] = useState(compatibilityMatrix);

  // Get all assets from api context
  const allAssets = assets.all || [];
  const allAvatars = avatars || [];

  // Fetch compatibility data from API if available
  useEffect(() => {
    // This is a placeholder for future implementation
    // In the future, you would fetch the compatibility matrix from the backend
    // For now, we'll use the local fallback
    const fetchCompatibilityData = async () => {
      try {
        // This API endpoint doesn't exist yet, but represents a future implementation
        // const response = await assetsAPI.getCompatibilityMatrix();
        // setCompatibilityData(response.data);
      } catch (error) {
        console.warn('Using fallback compatibility data');
        // Keep using the local fallback
      }
    };

    fetchCompatibilityData();
  }, []);

  const handleSourceAvatarChange = (event) => {
    setSourceAvatar(event.target.value);
    setResults(null);
  };

  const handleTargetAvatarChange = (event) => {
    setTargetAvatar(event.target.value);
    setResults(null);
  };

  const handleAssetChange = (event) => {
    setAsset(event.target.value);
    setResults(null);
  };

  const handleModeChange = (event) => {
    setMode(event.target.value);
    setResults(null);
    // Reset selections when mode changes
    setSourceAvatar('');
    setTargetAvatar('');
    setAsset('');
  };

  const checkCompatibility = async () => {
    if (mode === 'asset' && (!sourceAvatar || !asset)) return;
    if (mode === 'avatar' && (!sourceAvatar || !targetAvatar)) return;
    
    setLocalLoading(true);
    
    try {
      // In a future implementation, this could be an API call
      // For now, we'll handle the check locally
      
      let mockResults;
      
      if (mode === 'asset') {
        // Check asset compatibility with avatar
        const selectedAsset = allAssets.find(a => a.id.toString() === asset);
        if (!selectedAsset) {
          setLocalLoading(false);
          return;
        }
        
        const selectedAvatar = allAvatars.find(a => a.id.toString() === sourceAvatar);
        if (!selectedAvatar) {
          setLocalLoading(false);
          return;
        }
        
        const isCompatible = selectedAsset.compatibleWith && 
                            selectedAsset.compatibleWith.includes(selectedAvatar.base);
        
        mockResults = {
          overall: isCompatible ? 'yes' : 'partial',
          details: [
            {
              aspect: 'Avatar Base',
              status: isCompatible ? 'yes' : 'partial',
              message: isCompatible 
                ? `${selectedAsset.name} is designed for ${selectedAvatar.base}.` 
                : `${selectedAsset.name} was not specifically designed for ${selectedAvatar.base}, but may work with adjustments.`
            },
            {
              aspect: 'File Format',
              status: 'yes',
              message: 'Unity package format is compatible with your avatar.'
            },
            {
              aspect: 'Animation Rigging',
              status: isCompatible ? 'yes' : 'partial',
              message: isCompatible
                ? 'Animation rigging is fully compatible.'
                : 'Animation rigging may require manual adjustments.'
            },
            {
              aspect: 'Material System',
              status: 'yes',
              message: 'Materials use standard shader and are compatible.'
            }
          ]
        };
      } else {
        // Check avatar-to-avatar compatibility
        const sourceAvatarObj = allAvatars.find(a => a.id.toString() === sourceAvatar);
        const targetAvatarObj = allAvatars.find(a => a.id.toString() === targetAvatar);
        
        if (!sourceAvatarObj || !targetAvatarObj) {
          setLocalLoading(false);
          return;
        }
        
        const sourceBase = sourceAvatarObj.base;
        const targetBase = targetAvatarObj.base;
        
        // Check if we have compatibility data between these avatars
        const hasCompatData = compatibilityData[sourceBase] && 
                              compatibilityData[sourceBase][targetBase];
        
        if (hasCompatData) {
          const compatData = compatibilityData[sourceBase][targetBase];
          
          mockResults = {
            overall: getBestOverallStatus(compatData),
            details: [
              {
                aspect: 'Bone Structure',
                status: compatData.boneStructure,
                message: compatData.boneStructure === 'yes' 
                  ? 'Bone structures are fully compatible.'
                  : compatData.boneStructure === 'mostly'
                  ? 'Bone structures are mostly compatible with minor adjustments needed.'
                  : compatData.boneStructure === 'partial'
                  ? 'Bone structures have partial compatibility, significant adjustments required.'
                  : 'Bone structures are incompatible.'
              },
              {
                aspect: 'Materials',
                status: compatData.materials,
                message: compatData.materials === 'yes'
                  ? 'Materials are fully compatible.'
                  : 'Materials may require adjustment.'
              },
              {
                aspect: 'Animations',
                status: compatData.animations,
                message: compatData.animations === 'yes'
                  ? 'Animations are fully compatible.'
                  : compatData.animations === 'mostly'
                  ? 'Animations are mostly compatible with minor adjustments needed.'
                  : compatData.animations === 'partial'
                  ? 'Animations have partial compatibility, significant adjustments required.'
                  : 'Animations are incompatible.'
              },
              {
                aspect: 'Notes',
                status: 'info',
                message: compatData.notes
              }
            ]
          };
        } else {
          // No specific compatibility data, generate a generic response
          mockResults = {
            overall: 'unknown',
            details: [
              {
                aspect: 'Compatibility Data',
                status: 'unknown',
                message: `No specific compatibility data between ${sourceBase} and ${targetBase} is available.`
              },
              {
                aspect: 'General Advice',
                status: 'info',
                message: 'You may need to manually test compatibility or check the avatar documentation.'
              }
            ]
          };
        }
      }
      
      setResults(mockResults);
    } catch (error) {
      console.error('Error checking compatibility:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  // Helper function to determine overall status based on compatibility data
  const getBestOverallStatus = (compatData) => {
    const statuses = [compatData.boneStructure, compatData.materials, compatData.animations];
    if (statuses.includes('no')) return 'no';
    if (statuses.includes('partial')) return 'partial';
    if (statuses.includes('mostly')) return 'mostly';
    return 'yes';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'yes':
        return <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />;
      case 'mostly':
      case 'partial':
        return <WarningIcon sx={{ color: 'warning.main', mr: 1 }} />;
      case 'no':
        return <ErrorIcon sx={{ color: 'error.main', mr: 1 }} />;
      case 'info':
      case 'unknown':
      default:
        return <InfoIcon sx={{ color: 'info.main', mr: 1 }} />;
    }
  };

  const getStatusSeverity = (status) => {
    switch(status) {
      case 'yes': return 'success';
      case 'mostly': 
      case 'partial': return 'warning';
      case 'no': return 'error';
      case 'unknown':
      case 'info':
      default: return 'info';
    }
  };

  // Show loading state if loading data from API
  if (loading.avatars || loading.assets) {
    return (
      <Paper sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 3 }}>
        <Typography variant="h2" sx={{ mb: 2 }}>Compatibility Checker</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  // Show error state if there's an API error
  if (errors.avatars || errors.assets) {
    return (
      <Paper sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 3 }}>
        <Typography variant="h2" sx={{ mb: 2 }}>Compatibility Checker</Typography>
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.avatars || errors.assets}
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 3 }}>
      <Typography variant="h2" sx={{ mb: 2 }}>Compatibility Checker</Typography>
      
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="mode-select-label">What do you want to check?</InputLabel>
          <Select
            labelId="mode-select-label"
            id="mode-select"
            value={mode}
            onChange={handleModeChange}
            label="What do you want to check?"
          >
            <MenuItem value="asset">Asset compatibility with an avatar</MenuItem>
            <MenuItem value="avatar">Avatar-to-avatar compatibility (for porting assets)</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={mode === 'avatar' ? 5 : 6}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="source-avatar-select-label">
              {mode === 'avatar' ? 'Source Avatar' : 'Your Avatar'}
            </InputLabel>
            <Select
              labelId="source-avatar-select-label"
              id="source-avatar-select"
              value={sourceAvatar}
              onChange={handleSourceAvatarChange}
              label={mode === 'avatar' ? 'Source Avatar' : 'Your Avatar'}
            >
              <MenuItem value=""><em>Select an avatar</em></MenuItem>
              {avatars.map((avatar) => (
                <MenuItem key={avatar.id} value={avatar.id.toString()}>
                  {avatar.name} ({avatar.base})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        {mode === 'avatar' ? (
          <Grid item xs={12} md={5}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="target-avatar-select-label">Target Avatar</InputLabel>
              <Select
                labelId="target-avatar-select-label"
                id="target-avatar-select"
                value={targetAvatar}
                onChange={handleTargetAvatarChange}
                label="Target Avatar"
              >
                <MenuItem value=""><em>Select target avatar</em></MenuItem>
                {avatars.map((avatar) => (
                  <MenuItem key={avatar.id} value={avatar.id.toString()}>
                    {avatar.name} ({avatar.base})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        ) : (
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="asset-select-label">Asset to Check</InputLabel>
              <Select
                labelId="asset-select-label"
                id="asset-select"
                value={asset}
                onChange={handleAssetChange}
                label="Asset to Check"
              >
                <MenuItem value=""><em>Select an asset</em></MenuItem>
                {allAssets.map((asset) => (
                  <MenuItem key={asset.id} value={asset.id.toString()}>
                    {asset.name} ({asset.type})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
        
        <Grid item xs={12} md={mode === 'avatar' ? 2 : 12}>
          <Button 
            variant="contained" 
            fullWidth 
            disabled={
              localLoading || 
              !sourceAvatar || 
              (mode === 'avatar' && !targetAvatar) || 
              (mode === 'asset' && !asset)
            }
            onClick={checkCompatibility}
            sx={{ height: mode === 'avatar' ? '56px' : undefined }}
          >
            {localLoading ? <CircularProgress size={24} color="inherit" /> : 'Check Compatibility'}
          </Button>
        </Grid>
      </Grid>
      
      {results && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="h3" sx={{ mb: 2 }}>Compatibility Results</Typography>
          
          <Alert 
            severity={getStatusSeverity(results.overall)}
            sx={{ mb: 3 }}
          >
            {results.overall === 'yes'
              ? mode === 'asset' 
                ? 'This asset is compatible with your avatar!'
                : 'These avatars have excellent compatibility!'
              : results.overall === 'mostly'
              ? mode === 'asset'
                ? 'This asset is mostly compatible with your avatar with minor adjustments needed.'
                : 'These avatars have good compatibility with minor adjustments needed.'
              : results.overall === 'partial'
              ? mode === 'asset'
                ? 'This asset has partial compatibility and will require significant adjustments.'
                : 'These avatars have partial compatibility and will require significant work to port assets between them.'
              : results.overall === 'no'
              ? mode === 'asset'
                ? 'This asset is not compatible with your avatar.'
                : 'These avatars are not compatible for asset sharing.'
              : 'Compatibility is unknown - you may need to test manually.'
            }
          </Alert>
          
          <Typography variant="h3" sx={{ mb: 2 }}>Detailed Analysis</Typography>
          
          {results.details.map((detail, index) => (
            <ResultItem key={index} status={detail.status}>
              {getStatusIcon(detail.status)}
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {detail.aspect}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {detail.message}
                </Typography>
              </Box>
            </ResultItem>
          ))}
          
          {mode === 'avatar' && results.overall !== 'no' && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h3" sx={{ mb: 2 }}>
                Asset Transfer Reference Table
              </Typography>
              <TableContainer component={Paper} sx={{ bgcolor: 'background.default' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Asset Type</TableCell>
                      <TableCell>Compatibility</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Clothing</TableCell>
                      <TableCell>
                        {results.overall === 'yes' ? 'High' : results.overall === 'mostly' ? 'Medium' : 'Low'}
                      </TableCell>
                      <TableCell>
                        {results.overall === 'yes' 
                          ? 'Clothing should transfer with minimal adjustments'
                          : 'May require resizing and bone weight adjustments'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Props/Accessories</TableCell>
                      <TableCell>High</TableCell>
                      <TableCell>
                        Usually transferable with minor position adjustments
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Animations</TableCell>
                      <TableCell>
                        {results.details.find(d => d.aspect === 'Animations')?.status === 'yes' 
                          ? 'High' 
                          : results.details.find(d => d.aspect === 'Animations')?.status === 'mostly'
                          ? 'Medium'
                          : 'Low'}
                      </TableCell>
                      <TableCell>
                        {results.details.find(d => d.aspect === 'Animations')?.status === 'yes'
                          ? 'Animations should work without modification'
                          : 'May require retargeting or significant adjustment'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Materials/Textures</TableCell>
                      <TableCell>
                        {results.details.find(d => d.aspect === 'Materials')?.status === 'yes'
                          ? 'High'
                          : 'Medium'}
                      </TableCell>
                      <TableCell>
                        UV maps may differ, requiring texture adjustments
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default CompatibilityChecker;