# Dockerfile for VRChat Asset Manager
FROM node:20-alpine

WORKDIR /app

# Create directory for uploads and database with proper permissions
RUN mkdir -p /app/uploads && chmod 777 /app/uploads
RUN mkdir -p /app/database && chmod 777 /app/database

# Install dependencies for server first
COPY server/package*.json ./server/
RUN cd server && npm install

# Install dependencies for client
COPY client/package*.json ./client/
RUN cd client && npm install

# Copy server source
COPY server/ ./server/

# Copy client source and build
COPY client/ ./client/
RUN cd client && npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Add volume for persistent data
VOLUME [ "/app/database", "/app/uploads" ]

# Expose the port
EXPOSE 5000

# Make sure the entrypoint script has execute permissions
RUN echo '#!/bin/sh\nchmod -R 777 /app/uploads\nchmod -R 777 /app/database\ncd /app/server && npm start' > /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Set working directory to server for the startup command
WORKDIR /app

# Command to run the application
CMD ["/app/entrypoint.sh"]