const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { MAX_IMAGE_BYTES } = require('../utils/imageValidation');

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('Warning: Cloudinary environment variables are not fully set. Image upload will not work until they are configured.');
}
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Buffer only bounded files so the controller can check their bytes before uploading.
// These are still public Cloudinary assets; do not treat them as private photos.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!['image/jpeg', 'image/png'].includes(file.mimetype) || !/\.(jpe?g|png)$/i.test(file.originalname || '')) {
      return cb(new Error('Only JPEG and PNG images are allowed'));
    }
    cb(null, true);
  },
});

module.exports = { cloudinary, upload };
