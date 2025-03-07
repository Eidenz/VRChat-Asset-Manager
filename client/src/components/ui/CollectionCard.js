// src/components/ui/CollectionCard.js
import React from 'react';
import { Card, CardMedia, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const StyledCard = styled(motion(Card))(({ theme }) => ({
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  height: '100%',
}));

const CollectionCard = ({ collection }) => {
  return (
    <StyledCard
      whileHover={{ 
        y: -5,
        boxShadow: '0 10px 20px rgba(0,0,0,0.2)' 
      }}
    >
      <CardMedia
        component="img"
        height="120"
        image={collection.thumbnail}
        alt={collection.name}
        sx={{ 
          transition: 'transform 0.5s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          }
        }}
      />
      <CardContent>
        <Typography variant="h3" noWrap>{collection.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {collection.itemCount} items
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default CollectionCard;