// server/utils/imageUtils.js
// Updated to work with router export pattern

const path = require('path');
const fs = require('fs');
const uploadsRouter = require('../routes/uploads');

// Helper function to delete an image file
const deleteImageFile = (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('/uploads/')) {
      return false; // Not a uploaded image URL
    }
    
    // Access the getFilenameFromUrl method directly from the router
    const filename = uploadsRouter.getFilenameFromUrl(imageUrl);
    if (!filename) return false;
    
    const uploadDir = path.join(__dirname, '../../uploads');
    const filePath = path.join(uploadDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return false;
    }
    
    // Delete the file
    fs.unlinkSync(filePath);
    console.log(`Deleted image file: ${filePath}`);
    return true;
  } catch (error) {
    console.error('Error deleting image file:', error);
    return false;
  }
};

module.exports = {
  deleteImageFile
};