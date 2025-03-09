// src/components/layout/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import CubeIcon from '@mui/icons-material/ViewInAr';
import BrushIcon from '@mui/icons-material/Brush';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LayersIcon from '@mui/icons-material/Layers';
import SettingsIcon from '@mui/icons-material/Settings';
import WidgetsIcon from '@mui/icons-material/Widgets';

// Custom styled NavLink component
const StyledNavLink = styled(NavLink)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '10px',
  textDecoration: 'none',
  color: theme.palette.text.primary,
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  '&.active': {
    backgroundColor: theme.palette.primary.main,
    color: '#ffffff',
  },
}));

// Section title component
const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  color: theme.palette.text.secondary,
  marginBottom: '12px',
  paddingLeft: '10px',
}));

const Sidebar = () => {
  return (
    <Box sx={{ 
      gridArea: 'sidebar',
      backgroundColor: 'background.paper',
      padding: 2.5,
      borderRight: '1px solid rgba(255,255,255,0.05)',
      overflowY: 'auto',
    }} className="fade-in">
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        mb: 3.5,
        pl: 1,
      }}>
        <Box sx={{ 
          width: 32, 
          height: 32, 
          mr: 2,
          filter: 'drop-shadow(0 0 8px #7e4dd2)',
          borderRadius: '8px',
          backgroundColor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img src="/logo.svg" alt="VRChat Asset Hub" style={{ width: 45, height: 45 }} />
        </Box>
        <Typography variant="h1">VRChat Asset Hub</Typography>
      </Box>
      
      {/* Main Navigation */}
      <Box sx={{ mb: 3 }}>
        <SectionTitle>Main</SectionTitle>
        <List disablePadding>
          <ListItem disablePadding>
            <StyledNavLink to="/" end>
              <ListItemIcon sx={{ minWidth: 36 }}><HomeIcon /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </StyledNavLink>
          </ListItem>
          <ListItem disablePadding>
            <StyledNavLink to="/clothing">
              <ListItemIcon sx={{ minWidth: 36 }}><CheckroomIcon /></ListItemIcon>
              <ListItemText primary="Clothing" />
            </StyledNavLink>
          </ListItem>
          <ListItem disablePadding>
            <StyledNavLink to="/props">
              <ListItemIcon sx={{ minWidth: 36 }}><CubeIcon /></ListItemIcon>
              <ListItemText primary="Props & Accessories" />
            </StyledNavLink>
          </ListItem>
          <ListItem disablePadding>
            <StyledNavLink to="/textures">
              <ListItemIcon sx={{ minWidth: 36 }}><BrushIcon /></ListItemIcon>
              <ListItemText primary="Textures" />
            </StyledNavLink>
          </ListItem>
          <ListItem disablePadding>
            <StyledNavLink to="/others">
              <ListItemIcon sx={{ minWidth: 36 }}><WidgetsIcon /></ListItemIcon>
              <ListItemText primary="Others" />
            </StyledNavLink>
          </ListItem>
          <ListItem disablePadding>
            <StyledNavLink to="/avatars">
              <ListItemIcon sx={{ minWidth: 36 }}><PersonIcon /></ListItemIcon>
              <ListItemText primary="Avatars" />
            </StyledNavLink>
          </ListItem>
        </List>
      </Box>
      
      {/* Library Navigation */}
      <Box sx={{ mb: 3 }}>
        <SectionTitle>Library</SectionTitle>
        <List disablePadding>
          <ListItem disablePadding>
            <StyledNavLink to="/favorites">
              <ListItemIcon sx={{ minWidth: 36 }}><FavoriteIcon /></ListItemIcon>
              <ListItemText primary="Favorites" />
            </StyledNavLink>
          </ListItem>
          <ListItem disablePadding>
            <StyledNavLink to="/collections">
              <ListItemIcon sx={{ minWidth: 36 }}><LayersIcon /></ListItemIcon>
              <ListItemText primary="Collections" />
            </StyledNavLink>
          </ListItem>
        </List>
      </Box>
      
      {/* Settings */}
      <Box>
        <SectionTitle>Settings</SectionTitle>
        <List disablePadding>
          <ListItem disablePadding>
            <StyledNavLink to="/settings">
              <ListItemIcon sx={{ minWidth: 36 }}><SettingsIcon /></ListItemIcon>
              <ListItemText primary="Settings" />
            </StyledNavLink>
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export default Sidebar;