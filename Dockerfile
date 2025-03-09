# Dockerfile for VRChat Asset Manager
FROM node:20-alpine

WORKDIR /app

# Create directory for uploads
RUN mkdir -p /app/uploads
RUN mkdir -p /app/database

# Install dependencies for server first
COPY server/package*.json ./server/
RUN cd server && npm install

# Install dependencies for client
COPY client/package*.json ./client/
RUN cd client && npm install

# Copy server source
COPY server/ ./server/

# Copy client source and build with correct environment variables
COPY client/ ./client/

# Create a .env file with correct API URL for production
RUN echo "REACT_APP_API_URL=/api" > ./client/.env

# Build the client
RUN cd client && npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Add volume for persistent data
VOLUME [ "/app/database", "/app/uploads" ]

# Expose the port
EXPOSE 5000

# Copy the entrypoint script
COPY docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

# Set working directory for the entrypoint command
WORKDIR /app/server

# Command to run the application using the entrypoint script
ENTRYPOINT ["/app/docker-entrypoint.sh"]