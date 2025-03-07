# Multi-stage build for VRChat Asset Manager

# Stage 1: Build React frontend
FROM node:18-alpine as client-builder
WORKDIR /app/client

# Copy package.json and package-lock.json
COPY client/package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the client code
COPY client/ ./

# Build the React app
RUN npm run build

# Stage 2: Setup backend and serve frontend
FROM node:18-alpine
WORKDIR /app

# Copy backend package.json and package-lock.json
COPY server/package*.json ./

# Install production dependencies
RUN npm ci --production

# Copy the rest of the backend code
COPY server/ ./

# Copy the built frontend from the first stage
COPY --from=client-builder /app/client/build ./client/build

# Create database directory
RUN mkdir -p /app/database

# Setup environment
ENV NODE_ENV=production
ENV PORT=5000

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]