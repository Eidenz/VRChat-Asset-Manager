# VRChat Asset Manager

![Screenshot 2025-03-12 000829](https://github.com/user-attachments/assets/f03b521f-be3c-44f7-99e3-2cd67044c10f)

A web companion app for managing VRChat assets, including avatars, clothing, props, textures, and more.

## ⚠️ Disclaimer / AI-Generated Project Warning

**This project was entirely coded using AI (Claude 3.7 Sonnet Thinking).**

This code is provided as-is. While effort has been made to ensure functionality, it comes with no warranty or guarantee of support.

**Please note:**

- This project is shared without dedicated support resources.
- Use of this code is at your own risk.
- No official support will be provided for setup, usage, customization, or troubleshooting.
- Community contributions and improvements via pull requests are welcome, but please do not expect personalized assistance.

For any issues or questions, consider consulting online resources, community forums, or attempting to resolve problems independently.

## Features

- Organize and manage VRChat avatar assets by categories
- Track compatibility between assets and avatars
- Create collections to group related assets
- Favorite and quickly access frequently used items
- Search and filter assets by various criteria
- Dark/Light theme support
- Custom image uploads for avatars and collections

## Technologies

- **Frontend**: React, Material-UI, Framer Motion
- **Backend**: Node.js, Express
- **Database**: SQLite
- **Containerization**: Docker, Docker Compose

## Project Structure

```
vrchat-asset-manager/
│
├── client/           # React frontend
│   ├── public/
│   ├── src/
│   └── package.json
│
├── server/           # Express backend
│   ├── db/           # Database related files
│   ├── routes/       # API routes
│   ├── models/       # Data models
│   ├── utils/        # Utility functions
│   ├── server.js     # Express server
│   └── package.json
│
├── database/         # SQLite database file (created at runtime)
├── uploads/          # Uploaded files (created at runtime)
├── docker-compose.yml
└── Dockerfile
```

## Getting Started

### Running with Docker

The easiest way to get started is using Docker:

1. Clone the repository:
   ```
   git clone git@github.com:Eidenz/VRChat-Asset-Manager.git
   cd vrchat-asset-manager
   ```

2. Build and start the Docker containers:
   ```
   docker-compose up -d --build
   ```

3. Initialize the database (first time only):
   ```
   docker exec -it vrchat-asset-manager npm run init-db
   ```

4. Access the application at http://localhost:5000

### Development Setup

1. Clone the repository:
   ```
   git clone git@github.com:Eidenz/VRChat-Asset-Manager.git
   cd vrchat-asset-manager
   ```

2. Install dependencies:
   ```
   cd server
   npm install
   cd ../client
   npm install
   ```

3. Initialize the database:
   ```
   cd ../server
   npm run init-db
   ```

4. Start the development servers:
   ```
   # In one terminal window (server)
   cd server
   npm run dev
   
   # In another terminal window (client)
   cd client
   npm start
   ```

5. Access the client application at http://localhost:3000

## API Endpoints

### Avatars

- `GET /api/avatars` - Get all avatars
- `GET /api/avatars/:id` - Get avatar by ID
- `POST /api/avatars` - Create a new avatar
- `PUT /api/avatars/:id` - Update an avatar
- `PUT /api/avatars/:id/current` - Toggle avatar current status
- `PUT /api/avatars/:id/favorite` - Toggle avatar favorite status
- `DELETE /api/avatars/:id` - Delete an avatar
- `GET /api/avatars/bases/all` - Get all avatar bases

### Assets

- `GET /api/assets` - Get all assets
- `GET /api/assets/recent` - Get recently added assets
- `GET /api/assets/favorites` - Get favorited assets
- `GET /api/assets/types/:type` - Get assets by type
- `GET /api/assets/:id` - Get asset by ID
- `POST /api/assets` - Create a new asset
- `PUT /api/assets/:id` - Update an asset
- `PUT /api/assets/:id/used` - Update asset last used date
- `PUT /api/assets/:id/favorite` - Toggle asset favorite status
- `DELETE /api/assets/:id` - Delete an asset
- `GET /api/assets/types/all` - Get all asset types
- `GET /api/assets/tags/all` - Get all tags

### Collections

- `GET /api/collections` - Get all collections
- `GET /api/collections/:id` - Get collection by ID
- `GET /api/collections/:id/assets` - Get collection assets
- `POST /api/collections` - Create a new collection
- `PUT /api/collections/:id` - Update a collection
- `DELETE /api/collections/:id` - Delete a collection
- `POST /api/collections/:id/assets` - Add asset to collection
- `POST /api/collections/:id/assets/batch` - Add multiple assets to collection
- `DELETE /api/collections/:id/assets/:assetId` - Remove asset from collection

### Settings

- `GET /api/settings` - Get all settings
- `GET /api/settings/:key` - Get setting by key
- `PUT /api/settings/:key` - Update a setting
- `POST /api/settings` - Update multiple settings

### Uploads

- `POST /api/uploads/image` - Upload an image file
- `DELETE /api/uploads/image/:filename` - Delete an uploaded image file

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
