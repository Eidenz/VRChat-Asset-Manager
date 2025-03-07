// src/pages/Favorites.js
import React from 'react';
import { Box, Typography } from '@mui/material';

const Favorites = () => {
  return (
    <Box>
      <Typography variant="h1">Favorites</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        This page will display all Favorites assets.
      </Typography>
    </Box>
  );
};

export default Favorites;