// src/components/ui/AssetCard.js
import React, { useState } from 'react';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  Button,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DownloadIcon from '@mui/icons-material/Download';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { motion } from 'framer-motion';

// Styled components
const StyledCard = styled(motion(Card))(({ theme }) => ({
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const StyledBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 12,
  left: 12,
  padding: '4px 8px',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  fontSize: 12,
  fontWeight: 500,
  borderRadius: 4,
  zIndex: 1,
}));

const StyledFavoriteButton = styled(IconButton)(({ theme, active }) => ({
  position: 'absolute',
  top: 12,
  right: 12,
  width: 32,
  height: 32,
  backgroundColor: active ? theme.palette.error.main : 'rgba(0,0,0,0.5)',
  color: 'white',
  zIndex: 1,
  '&:hover': {
    backgroundColor: active ? theme.palette.error.dark : theme.palette.primary.main,
  },
}));

const TagsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  marginBottom: 16,
}));

const StyledTag = styled(Chip)(({ theme }) => ({
  backgroundColor: 'rgba(255,255,255,0.05)',
  color: theme.palette.text.secondary,
  fontSize: 12,
  height: 24,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  },
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 16,
}));

const StatItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 13,
  color: theme.palette.text.secondary,
}));

const ActionButton = styled(Button)(({ theme, color }) => ({
  borderRadius: 6,
  fontSize: 14,
  fontWeight: 500,
  backgroundColor: color === 'primary' ? theme.palette.primary.main : 'rgba(255,255,255,0.05)',
  color: color === 'primary' ? 'white' : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: color === 'primary' ? theme.palette.primary.light : 'rgba(255,255,255,0.1)',
    transform: 'translateY(-2px)',
  },
}));

const AssetCard = ({ asset }) => {
  const [isFavorite, setIsFavorite] = useState(asset.isFavorite || false);
  
  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };
  
  return (
    <StyledCard
      whileHover={{ 
        y: -5,
        boxShadow: '0 10px 20px rgba(0,0,0,0.2)' 
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={asset.thumbnail}
          alt={asset.name}
          sx={{ 
            transition: 'transform 0.5s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            }
          }}
        />
        {asset.badge && <StyledBadge>{asset.badge}</StyledBadge>}
        <StyledFavoriteButton 
          size="small" 
          active={isFavorite ? 1 : 0}
          onClick={handleToggleFavorite}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
        </StyledFavoriteButton>
      </Box>
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h3" sx={{ mb: 0.5 }}>{asset.name}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          By: {asset.creator}
        </Typography>
        
        <TagsContainer>
          {asset.tags.map((tag, index) => (
            <StyledTag key={index} label={tag} size="small" />
          ))}
        </TagsContainer>
        
        <StatsContainer>
          <StatItem>
            <DownloadIcon fontSize="small" />
            {asset.downloads}
          </StatItem>
          <StatItem>
            <FavoriteIcon fontSize="small" />
            {asset.favorites}
          </StatItem>
          <StatItem>
            ★ {asset.rating}
          </StatItem>
        </StatsContainer>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ActionButton 
            fullWidth 
            variant="contained" 
            color="primary"
            startIcon={<DownloadIcon />}
          >
            Download
          </ActionButton>
          <ActionButton 
            fullWidth 
            variant="contained" 
            startIcon={<InfoOutlinedIcon />}
          >
            Details
          </ActionButton>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default AssetCard;