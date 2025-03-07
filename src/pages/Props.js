// src/pages/Props.js
import React from 'react';
import { Box, Typography } from '@mui/material';

const Props = () => {
  return (
    <Box>
      <Typography variant="h1">Props</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        This page will display all Props assets.
      </Typography>
    </Box>
  );
};

export default Props;