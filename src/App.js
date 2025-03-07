// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './styles/theme';
import './styles/global.css';

// Pages
import Dashboard from './pages/Dashboard';
import Clothing from './pages/Clothing';
import Props from './pages/Props';
import Textures from './pages/Textures';
import Avatars from './pages/Avatars';
import Favorites from './pages/Favorites';
import Collections from './pages/Collections';
import Settings from './pages/Settings';

// Layout
import MainLayout from './components/layout/MainLayout';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="clothing" element={<Clothing />} />
            <Route path="props" element={<Props />} />
            <Route path="textures" element={<Textures />} />
            <Route path="avatars" element={<Avatars />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="collections" element={<Collections />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;