const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Files go straight to Cloudinary — nothing touches local disk.
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'tech-curious/projects',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1600, crop: 'limit', quality: 'auto' }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB max per image
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Accepts a cover photo ("image") and an optional wiring/schematic photo
// ("wiringImage") in the same multipart upload.
const uploadProjectImages = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'wiringImage', maxCount: 1 },
]);

module.exports = { upload, uploadProjectImages };
