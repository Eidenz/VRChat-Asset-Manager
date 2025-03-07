// src/pages/Clothing.js
import React from 'react';
import { Box, Typography } from '@mui/material';

const Clothing = () => {
  return (
    <Box>
      <Typography variant="h1">Clothing</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        This page will display all clothing assets.
      </Typography>
    </Box>
  );
};

export default Clothing;