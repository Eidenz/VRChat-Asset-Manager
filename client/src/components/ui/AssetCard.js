// src/components/ui/AssetCard.js
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DownloadIcon from '@mui/icons-material/Download';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { motion } from 'framer-motion';
import AssetDetailsModal from './AssetDetailsModal';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { formatCurrency } from '../../utils/currencyUtils';

// Import API context
import { useApi } from '../../context/ApiContext';

// Styled components
const StyledCard = styled(motion(Card))(({ theme }) => ({
  height: '100%', // This ensures all cards take the full height of their container
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10]
  }
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
  zIndex: 3,
}));

const StyledFavoriteButton = styled(IconButton)(({ theme, active }) => ({
  position: 'absolute',
  top: 12,
  right: 12,
  width: 32,
  height: 32,
  backgroundColor: active ? theme.palette.error.main : 'rgba(0,0,0,0.5)',
  color: 'white',
  zIndex: 3,
  '&:hover': {
    backgroundColor: active ? theme.palette.error.dark : theme.palette.primary.main,
  },
}));

const TagsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  marginBottom: 16,
  minHeight: 30, // Minimum height for tags section
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

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 13,
  color: theme.palette.text.secondary,
  marginBottom: 6,
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

const AssetCard = ({ asset: propAsset }) => {
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const { toggleAssetFavorite, assets, blurNsfw } = useApi();
  
  // Keep a local copy of the asset that can update when the global state changes
  const [asset, setAsset] = useState(propAsset);
  
  // Update local asset when the prop changes or when assets state changes
  useEffect(() => {
    setAsset(propAsset);
  }, [propAsset]);
  
  // Find and update the local asset if it changes in the global state
  useEffect(() => {
    if (asset && assets.all) {
      const updatedAsset = assets.all.find(a => a.id === asset.id);
      if (updatedAsset && JSON.stringify(updatedAsset) !== JSON.stringify(asset)) {
        setAsset(updatedAsset);
      }
    }
  }, [assets, asset]);

  const NsfwBadge = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 42,
    left: 12,
    padding: '4px 8px',
    backgroundColor: theme.palette.error.main,
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    borderRadius: 4,
    zIndex: 3,
  }));

  const BlurOverlay = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 2,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      backdropFilter: 'blur(5px)',
      backgroundColor: 'rgba(0,0,0,0.3)',
    }
  }));

  const [showNsfw, setShowNsfw] = useState(false);
  
  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    toggleAssetFavorite(asset.id);
  };
  
  const handleOpenDetails = () => {
    setDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsModalOpen(false);
  };

  const handleToggleNsfwBlur = (e) => {
    e.stopPropagation();
    setShowNsfw(!showNsfw);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    if (asset.downloadUrl) {
      window.open(asset.downloadUrl, '_blank');
    } else {
      console.log('No download URL available');
      alert('No download URL available for this asset');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  if (!asset) return null;
  
  return (
    <>
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
              },
              filter: asset.nsfw && blurNsfw && !showNsfw ? 'blur(10px)' : 'none'
            }}
          />
          {asset.type && (
            <StyledBadge>{asset.type}</StyledBadge>
          )}
          {asset.nsfw && (
            <NsfwBadge>
              NSFW
            </NsfwBadge>
          )}
          <StyledFavoriteButton 
            size="small" 
            active={asset.favorited ? 1 : 0}
            onClick={handleToggleFavorite}
            aria-label={asset.favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            {asset.favorited ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
          </StyledFavoriteButton>

          {/* Blur overlay for NSFW content that can be clicked to reveal */}
          {asset.nsfw && blurNsfw && !showNsfw && (
            <BlurOverlay onClick={handleToggleNsfwBlur}>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'background.paper', 
                borderRadius: 2,
                textAlign: 'center',
                maxWidth: '80%'
              }}>
                <Typography variant="body1" sx={{ mb: 1 }}>NSFW Content</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  This asset contains adult content
                </Typography>
                <Button 
                  variant="contained" 
                  color="error" 
                  size="small"
                >
                  Click to View
                </Button>
              </Box>
            </BlurOverlay>
          )}
        </Box>
        
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h3" sx={{ mb: 0.5 }}>{asset.name}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            By: {asset.creator}
          </Typography>

          {asset.price ? (
              <InfoRow>
                <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
                  {`${asset.price} ${asset.currency ? `(${asset.currency})` : ''}`}
                </Typography>
              </InfoRow>
            )
          : (
            <InfoRow>
              <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
                {`-`}
              </Typography>
            </InfoRow>
          )}
          
          <TagsContainer>
            {asset.tags && asset.tags.slice(0, 3).map((tag, index) => (
              <StyledTag key={index} label={tag} size="small" />
            ))}
            {asset.tags && asset.tags.length > 3 && (
              <StyledTag label={`+${asset.tags.length - 3}`} size="small" />
            )}
          </TagsContainer>
          
          <Box sx={{ mb: 2 }}>
            <InfoRow>
              <CalendarTodayIcon fontSize="small" />
              <Typography variant="body2">
                Added: {formatDate(asset.dateAdded)}
              </Typography>
            </InfoRow>
            <InfoRow>
              <EditNoteIcon fontSize="small" />
              <Typography variant="body2" noWrap title={asset.notes}>
                {asset.notes && asset.notes.length > 30 ? `${asset.notes.substring(0, 30)}...` : asset.notes || 'No notes'}
              </Typography>
            </InfoRow>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Download from original source">
              <ActionButton 
                fullWidth 
                variant="contained" 
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                disabled={!asset.downloadUrl}
              >
                Download
              </ActionButton>
            </Tooltip>
            <ActionButton 
              fullWidth 
              variant="contained" 
              startIcon={<InfoOutlinedIcon />}
              onClick={handleOpenDetails}
            >
              Details
            </ActionButton>
          </Box>
        </CardContent>
      </StyledCard>

      <AssetDetailsModal 
        open={detailsModalOpen} 
        handleClose={handleCloseDetails} 
        asset={asset} 
      />
    </>
  );
};

export default AssetCard;