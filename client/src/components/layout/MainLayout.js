// src/components/layout/MainLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import ParticleBackground from '../ui/ParticleBackground';

const MainLayout = () => {
  return (
    <Box sx={{ 
      display: 'grid',
      gridTemplateColumns: '240px 1fr',
      gridTemplateRows: '60px 1fr',
      gridTemplateAreas: `
        "sidebar header"
        "sidebar main"
      `,
      height: '100vh',
    }}>
      <ParticleBackground />
      <Sidebar />
      <Header />
      <Box sx={{ 
        gridArea: 'main',
        overflow: 'auto',
        padding: 3,
      }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;