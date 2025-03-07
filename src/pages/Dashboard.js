// src/pages/Dashboard.js
import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import SectionHeader from '../components/ui/SectionHeader';
import AssetCard from '../components/ui/AssetCard';
import CollectionCard from '../components/ui/CollectionCard';
import AvatarCard from '../components/ui/AvatarCard';
import CompatibilityChecker from '../components/features/CompatibilityChecker';

// Import mock data
import { collections, avatars, recentAssets } from '../data/mockData';

const Dashboard = () => {
  return (
    <Box>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h1">Welcome back, VRChatUser</Typography>
        </Box>
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Box sx={{ mb: 5 }}>
          <SectionHeader title="Your Collections" seeAllLink="/collections" />
          <Grid container spacing={2}>
            {collections.slice(0, 4).map((collection) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={collection.id}>
                <CollectionCard collection={collection} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Box sx={{ mb: 5 }}>
          <SectionHeader title="Your Avatars" seeAllLink="/avatars" />
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
            {avatars.map((avatar) => (
              <Box key={avatar.id} sx={{ minWidth: 160 }}>
                <AvatarCard avatar={avatar} />
              </Box>
            ))}
          </Box>
        </Box>
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Box sx={{ mb: 5 }}>
          <SectionHeader title="Recently Added Assets" seeAllLink="/recent" />
          <Grid container spacing={3}>
            {recentAssets.map((asset) => (
              <Grid item xs={12} sm={6} md={4} key={asset.id}>
                <AssetCard asset={asset} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Box sx={{ mb: 5 }}>
          <CompatibilityChecker />
        </Box>
      </motion.div>
    </Box>
  );
};

export default Dashboard;