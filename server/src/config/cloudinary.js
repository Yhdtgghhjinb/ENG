const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create storage engine for PDFs and documents
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'studyhub-vtu-resources', // Folder name in Cloudinary
    allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt'],
    resource_type: 'raw', // For non-image files
    public_id: (req, file) => {
      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const originalName = file.originalname.split('.')[0];
      return `${originalName}-${timestamp}`;
    },
  },
});

// Create multer upload middleware
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

module.exports = { cloudinary, upload };
