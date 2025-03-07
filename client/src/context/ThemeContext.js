// src/context/ThemeContext.js
import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('dark');
  
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'dark' ? 'light' : 'dark'));
  };
  
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'dark'
            ? {
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
              }
            : {
                primary: {
                  main: '#6930c3',
                  light: '#8857db',
                },
                secondary: {
                  main: '#00b894',
                },
                background: {
                  default: '#f5f5f7',
                  paper: '#ffffff',
                },
                text: {
                  primary: '#222222',
                  secondary: '#666666',
                },
              }),
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
      }),
    [mode]
  );
  
  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};