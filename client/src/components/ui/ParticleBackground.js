// src/components/ui/ParticleBackground.js
import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const ParticleBackground = () => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const particleCount = 10;
    
    // Clear any existing particles
    container.innerHTML = '';
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      
      // Set particle styles
      particle.style.position = 'absolute';
      particle.style.backgroundColor = '#7e4dd2';
      particle.style.borderRadius = '50%';
      particle.style.opacity = '0.1';
      
      // Random size between 50px and 200px
      const size = Math.random() * 150 + 50;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Random position
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      
      // Animation duration between 30s and 40s
      const duration = Math.random() * 10 + 30;
      particle.style.animation = `float ${duration}s infinite ease-in-out`;
      
      // Random animation delay
      particle.style.animationDelay = `${Math.random() * 10}s`;
      
      // Append to container
      container.appendChild(particle);
    }
    
    return () => {
      container.innerHTML = '';
    };
  }, []);
  
  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    />
  );
};

export default ParticleBackground;