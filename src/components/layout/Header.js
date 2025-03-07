// src/components/layout/Header.js
import React from 'react';
import { Box, InputBase, IconButton, Avatar, Tooltip } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '../../context/ThemeContext';

// Styled search input
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.background.paper, 1),
  border: '1px solid rgba(255,255,255,0.1)',
  '&:hover': {
    border: '1px solid rgba(255,255,255,0.2)',
  },
  '&:focus-within': {
    border: `1px solid ${theme.palette.primary.main}`,
    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  maxWidth: 500,
  transition: 'all 0.3s ease',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.text.primary,
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: '100%',
  },
}));

// Styled header button
const HeaderButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: '#ffffff',
    transform: 'translateY(-2px)',
  },
}));

const Header = () => {
  const { mode, toggleTheme } = useTheme();

  return (
    <Box sx={{ 
      gridArea: 'header',
      backgroundColor: 'background.default',
      display: 'flex',
      alignItems: 'center',
      px: 3,
      justifyContent: 'space-between',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }} className="fade-in">
      <Search>
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder="Search assets, creators, collections..."
          inputProps={{ 'aria-label': 'search' }}
        />
      </Search>
      
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
          <HeaderButton onClick={toggleTheme} aria-label="toggle theme">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </HeaderButton>
        </Tooltip>
        <Tooltip title="Add New">
          <HeaderButton aria-label="add new">
            <AddIcon />
          </HeaderButton>
        </Tooltip>
        <Avatar 
          sx={{ 
            width: 36, 
            height: 36, 
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 0 0 2px #7e4dd2',
            } 
          }} 
          alt="User profile" 
          src="/placeholder-avatar.jpg" 
        />
      </Box>
    </Box>
  );
};

export default Header;