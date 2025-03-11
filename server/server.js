// Updated server.js file to include migrations
const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const { close } = require('./db/database');
const { runMigrations } = require('./db/migrations');

// Import routes
const avatarsRoutes = require('./routes/avatars');
const assetsRoutes = require('./routes/assets');
const collectionsRoutes = require('./routes/collections');
const settingsRoutes = require('./routes/settings');
const uploadsRoutes = require('./routes/uploads');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Run database migrations
runMigrations().catch(err => {
  console.error('Failed to run migrations:', err);
});

// Apply middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/avatars', avatarsRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/collections', collectionsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/uploads', uploadsRoutes);

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'An error occurred',
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle process termination
const gracefulShutdown = () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('HTTP server closed.');
    close()
      .then(() => {
        console.log('Database connection closed.');
        process.exit(0);
      })
      .catch(err => {
        console.error('Error closing database connection:', err);
        process.exit(1);
      });
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = server;