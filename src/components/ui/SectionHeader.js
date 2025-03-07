// src/components/ui/SectionHeader.js
import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const SectionHeader = ({ title, seeAllLink }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 2
      }}
    >
      <Typography variant="h2">{title}</Typography>
      {seeAllLink && (
        <Link 
          href={seeAllLink} 
          sx={{ 
            color: 'primary.main', 
            textDecoration: 'none',
            fontSize: 14,
            transition: 'all 0.3s ease',
            '&:hover': {
              color: 'primary.light',
            } 
          }}
        >
          See All
        </Link>
      )}
    </Box>
  );
};

export default SectionHeader;