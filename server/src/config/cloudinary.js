const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Check if Cloudinary is configured
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

let upload;

if (isCloudinaryConfigured) {
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Create Cloudinary storage engine for PDFs and documents
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

  upload = multer({ 
    storage: storage,
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit
    },
  });

  console.log('✅ Cloudinary storage configured - files will be stored in cloud');
} else {
  // Fallback to local storage if Cloudinary not configured
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `${Date.now()}-${safe}`);
    },
  });

  upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowed = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.zip', '.txt'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowed.includes(ext)) return cb(null, true);
      cb(new Error('Only PDF, DOC, DOCX, PPT, PPTX, ZIP, TXT files are allowed'));
    },
  });

  console.log('⚠️ Cloudinary not configured - using local storage (files will be deleted on restart)');
}

module.exports = { cloudinary: isCloudinaryConfigured ? cloudinary : null, upload, isCloudinaryConfigured };
