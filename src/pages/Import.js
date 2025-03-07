// src/pages/Import.js
import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import AssetUploader from '../components/features/AssetUploader';

const Import = () => {
  return (
    <Box>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="h1">Import Assets</Typography>
          <Typography variant="body1" color="text.secondary">
            Upload new assets to your library or publish them for others to use.
          </Typography>
        </Box>
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <AssetUploader />
      </motion.div>
    </Box>
  );
};

export default Import;