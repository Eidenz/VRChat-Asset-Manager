// src/pages/Dashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardActionArea,
  CardMedia,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';

// Icons
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LayersIcon from '@mui/icons-material/Layers';

// Import components
import AssetCard from '../components/ui/AssetCard';
import CompatibilityChecker from '../components/features/CompatibilityChecker';

// Import API context
import { useApi } from '../context/ApiContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    avatars, 
    assets, 
    collections,
    loading,
    errors
  } = useApi();

  const navigateToCollections = () => {
    navigate('/collections');
  };

  const navigateToCollection = (id) => {
    navigate(`/collections/${id}`);
  };

  const navigateToAvatars = () => {
    navigate('/avatars');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isLoading = loading.avatars || loading.assets || loading.collections;
  const hasError = errors.avatars || errors.assets || errors.collections;

  return (
    <Box>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : hasError ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h2" color="error" sx={{ mb: 2 }}>Error Loading Data</Typography>
          <Typography variant="body1">
            {errors.avatars || errors.assets || errors.collections}
          </Typography>
        </Box>
      ) : (
        <>
          {/* Welcome Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ mb: 4 }}>
              <Typography variant="h1" sx={{ mb: 1 }}>
                Welcome to VRChat Asset Hub
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage, organize, and find all your VRChat avatar assets in one place.
              </Typography>
            </Box>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h2">{assets.all.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Assets</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h2">{collections.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Collections</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h2">{avatars.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Avatars</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h2">{assets.favorites.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Favorites</Typography>
                </Paper>
              </Grid>
            </Grid>
          </motion.div>

          {/* Main Content - Using a container with equal height columns */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
            {/* Main Content Column */}
            <Box sx={{ flex: '2 1 0', display: 'flex', flexDirection: 'column' }}>
              {/* Recently Added Assets */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                style={{ marginBottom: '24px' }}
              >
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h2">Recently Added Assets</Typography>
                  </Box>
                    <Grid container spacing={2}>
                    {assets.recent.map((recentAsset, assetIndex) => (
                      <Grid item xs={12} sm={6} md={4} key={recentAsset.id}>
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 + assetIndex * 0.05 }}
                          style={{ height: '100%' }} // Make the motion div take full height
                        >
                          <Box sx={{ height: '100%' }}> {/* Add a Box to maintain height */}
                            <AssetCard asset={recentAsset} />
                          </Box>
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </motion.div>

              {/* Compatibility Checker */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                style={{ flex: '1 1 auto' }}
              >
                <CompatibilityChecker />
              </motion.div>
            </Box>

            {/* Sidebar Column */}
            <Box sx={{ flex: '1 1 0', display: 'flex', flexDirection: 'column' }}>
              {/* Your Avatars Section */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                style={{ marginBottom: '24px' }}
              >
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h2">Your Avatars</Typography>
                    <IconButton size="small" onClick={navigateToAvatars}>
                      <ArrowForwardIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {avatars.slice(0, 3).map((avatar) => (
                      <Card key={avatar.id} variant="outlined" sx={{ display: 'flex', alignItems: 'center' }}>
                        <CardMedia
                          component="img"
                          sx={{ width: 60, height: 60, objectFit: 'cover' }}
                          image={avatar.thumbnail}
                          alt={avatar.name}
                        />
                        <Box sx={{ ml: 2, flexGrow: 1 }}>
                          <Typography variant="h3">{avatar.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Base: {avatar.base}
                          </Typography>
                        </Box>
                        <Tooltip title={`Last used: ${formatDate(avatar.lastUsed)}`}>
                          <Box sx={{ mr: 1 }}>
                            <Chip 
                              size="small" 
                              label={avatar.isCurrent ? "Current" : "Recent"} 
                              color={avatar.isCurrent ? "primary" : "default"}
                            />
                          </Box>
                        </Tooltip>
                      </Card>
                    ))}
                    <Button 
                      variant="outlined" 
                      fullWidth
                      startIcon={<AddIcon />}
                      onClick={navigateToAvatars}
                    >
                      Manage Avatars
                    </Button>
                  </Box>
                </Paper>
              </motion.div>

              {/* Collections Section */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                style={{ flex: '1 1 auto' }}
              >
                <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h2">Collections</Typography>
                    <IconButton size="small" onClick={navigateToCollections}>
                      <ArrowForwardIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
                    {collections.slice(0, 4).map((collection) => (
                      <Card 
                        key={collection.id} 
                        variant="outlined"
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigateToCollection(collection.id)}
                      >
                        <CardActionArea>
                          <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                            <Box 
                              sx={{ 
                                width: 40, 
                                height: 40, 
                                borderRadius: 1,
                                bgcolor: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2
                              }}
                            >
                              <LayersIcon />
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="h3">{collection.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {collection.itemCount} items
                              </Typography>
                            </Box>
                          </Box>
                        </CardActionArea>
                      </Card>
                    ))}
                    <Box sx={{ mt: 'auto', pt: 2 }}>
                      <Button 
                        variant="outlined" 
                        fullWidth
                        startIcon={<AddIcon />}
                        onClick={navigateToCollections}
                      >
                        View All Collections
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Dashboard;