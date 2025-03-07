// src/styles/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7e4dd2',
      light: '#9a6df7',
    },
    secondary: {
      main: '#06d6a0',
    },
    background: {
      default: '#12141d',
      paper: '#1c1f2e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#8a8d98',
    },
    success: {
      main: '#00b894',
    },
    warning: {
      main: '#fdcb6e',
    },
    error: {
      main: '#e74c3c',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.125rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;