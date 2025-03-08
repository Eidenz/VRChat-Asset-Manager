# Deployment Guide for VRChat Asset Manager

This guide includes the latest fixes for cross-computer compatibility and improved UI behavior for adding tags and avatar bases.

## Prerequisites

- Docker and Docker Compose installed on your system
- Git (to clone the repository)
- Basic command line knowledge

## Step 1: Clone and Prepare the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/vrchat-asset-manager.git
cd vrchat-asset-manager

# Create the necessary directories with proper permissions
mkdir -p uploads
mkdir -p database
chmod 777 uploads
chmod 777 database
```

## Step 2: Update the Files

Replace or create the following files with the updated versions to fix any issues:

### 1. Update client/src/services/api.js

This file has been updated to work properly without requiring environment variables to be set manually.

### 2. Update client/src/services/upload.js

Similarly, this file has been updated for better Docker compatibility.

### 3. Update client/src/components/features/AssetUploader.js

Fixed issues with the "Add new tag" and "Add new avatar base" buttons being selectable as actual values.

### 4. Update the Dockerfile

Replace your existing `Dockerfile` with the updated version that properly handles permissions and environment variables.

### 5. Update docker-compose.yml

Replace your existing `docker-compose.yml` with the updated version.

## Step 3: Build and Run with Docker Compose

```bash
# Build and start the containers
docker-compose up -d --build

# Check the logs to make sure everything is running properly
docker-compose logs -f
```

## Step 4: Initialize the Database

For first-time setup, you need to initialize the database:

```bash
docker exec -it vrchat-asset-manager npm run init-db
```

## Step 5: Access the Application

Once everything is running, you can access the application at:

```
http://localhost:5000
```

## Key Improvements in This Version

1. **Cross-Computer Compatibility**: The application no longer requires modifying the client/.env file to work on different computers. The API URL is now automatically determined based on the environment.

2. **UI Improvements**: The "Add new tag" and "Add new avatar base" buttons in the asset uploader are now fixed to prevent them from being selected as actual values, which previously could result in empty tags or bases.

3. **Docker Configuration**: The Docker setup has been improved to ensure proper permissions and environment variables are set.

## Troubleshooting

### Permission Issues

If you still encounter permission issues with uploads:

1. Check container permissions:
   ```bash
   docker exec -it vrchat-asset-manager ls -la /app/uploads
   docker exec -it vrchat-asset-manager ls -la /app/database
   ```

2. Manually set permissions:
   ```bash
   docker exec -it vrchat-asset-manager chmod -R 777 /app/uploads
   docker exec -it vrchat-asset-manager chmod -R 777 /app/database
   ```

3. Check the ownership of the local directories:
   ```bash
   ls -la uploads/
   ls -la database/
   ```

### Checking Logs

To check the application logs:

```bash
docker-compose logs -f
```

### Restarting the Application

If you need to restart the application:

```bash
docker-compose restart
```

### Complete Reset

If you need a complete reset:

```bash
docker-compose down
rm -rf database/*
docker-compose up -d
docker exec -it vrchat-asset-manager npm run init-db
```

## Custom Avatar Bases

The updated application now supports adding custom avatar bases through the UI:

1. When adding or editing an asset, go to the "Compatibility" step
2. Click on "Add new avatar base" at the bottom of the dropdown
3. Enter a name for your custom avatar base (e.g., "CustomDragon4.5")
4. Optionally provide an ID (if not provided, a normalized version of the name will be used)
5. Custom bases will be saved to your browser's local storage and will persist between sessions

## Understanding the Folder Structure

```
vrchat-asset-manager/
│
├── client/           # React frontend
├── server/           # Express backend
├── database/         # SQLite database file (created at runtime)
├── uploads/          # Uploaded files (created at runtime)
├── docker-compose.yml
├── Dockerfile
└── docker-entrypoint.sh
```

## Final Notes

- Make sure ports 5000 is available on your system
- The application uses a SQLite database for simplicity, which is stored in the `database` directory
- Uploaded files are stored in the `uploads` directory
- You can customize these paths in the `docker-compose.yml` file if needed
