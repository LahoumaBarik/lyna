const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Storage configurations for different upload types
const createCloudinaryStorage = (folder) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `salon/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    }
  });
};

// Different upload configurations
const uploadConfigs = {
  avatar: multer({
    storage: createCloudinaryStorage('avatars'),
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    }
  }),
  
  portfolio: multer({
    storage: createCloudinaryStorage('portfolio'),
    fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB
    }
  }),
  
  service: multer({
    storage: createCloudinaryStorage('services'),
    fileFilter,
    limits: {
      fileSize: 8 * 1024 * 1024 // 8MB
    }
  }),
  
  review: multer({
    storage: createCloudinaryStorage('reviews'),
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    }
  })
};

// Setup upload routes
const setupFileUpload = (app) => {
  // Avatar upload
  app.post('/api/upload/avatar', uploadConfigs.avatar.single('avatar'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      res.json({
        success: true,
        file: {
          url: req.file.path,
          publicId: req.file.filename
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Portfolio upload (multiple files)
  app.post('/api/upload/portfolio', uploadConfigs.portfolio.array('portfolio', 10), async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const files = req.files.map(file => ({
        url: file.path,
        publicId: file.filename
      }));

      res.json({
        success: true,
        files
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Service image upload
  app.post('/api/upload/service', uploadConfigs.service.array('images', 5), async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const files = req.files.map(file => ({
        url: file.path,
        publicId: file.filename
      }));

      res.json({
        success: true,
        files
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Review photo upload
  app.post('/api/upload/review', uploadConfigs.review.array('photos', 3), async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const files = req.files.map(file => ({
        url: file.path,
        publicId: file.filename
      }));

      res.json({
        success: true,
        files
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete file endpoint
  app.delete('/api/upload/:publicId', async (req, res) => {
    try {
      const { publicId } = req.params;
      
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        res.json({ success: true, message: 'File deleted successfully' });
      } else {
        res.status(404).json({ error: 'File not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

// Utility functions
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

const generateImageUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, transformations);
};

// Image transformation presets
const transformations = {
  thumbnail: { width: 150, height: 150, crop: 'fill' },
  medium: { width: 400, height: 400, crop: 'fill' },
  large: { width: 800, height: 800, crop: 'limit' },
  avatar: { width: 200, height: 200, crop: 'fill', gravity: 'face' }
};

module.exports = {
  setupFileUpload,
  uploadConfigs,
  deleteFile,
  generateImageUrl,
  transformations,
  cloudinary
}; 