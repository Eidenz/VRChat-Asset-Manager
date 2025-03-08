#!/bin/sh
# docker-entrypoint.sh

# Ensure uploads and database directories have correct permissions
echo "Setting up permissions..."
chmod -R 777 /app/uploads
chmod -R 777 /app/database

# Display directory information
echo "Uploads directory: $(ls -la /app/uploads)"
echo "Database directory: $(ls -la /app/database)"

# Start the server
echo "Starting server..."
cd /app/server && npm start