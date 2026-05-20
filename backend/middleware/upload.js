const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/heic',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not supported.`), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// Check if Cloudinary is properly configured
const isCloudinaryConfigured = () => {
  const key = process.env.CLOUDINARY_API_KEY;
  return key && key !== 'your_api_key';
};

// Upload buffer to Cloudinary — skips gracefully if not configured
const uploadToCloudinary = (buffer, folder = 'adulting-os', resourceType = 'auto') => {
  if (!isCloudinaryConfigured()) {
    console.warn('⚠️  Cloudinary not configured — file upload skipped. Add CLOUDINARY_* keys to .env to enable.');
    return Promise.resolve({ secure_url: '', public_id: '' });
  }
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

const deleteFromCloudinary = async (publicId) => {
  if (!publicId || !isCloudinaryConfigured()) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};

module.exports = { upload, uploadToCloudinary, deleteFromCloudinary };
