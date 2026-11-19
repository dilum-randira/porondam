const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { createRateLimiter } = require('../middleware/rateLimit');
const { upload } = require('../config/cloudinary');
const { uploadProfileImage } = require('../controllers/uploadController');

const router = express.Router();

// Authenticate first, then bound upload attempts by the server-verified account ID.
// Counting rejected attempts limits repeated expensive multipart parsing and storage calls.
// This process-local limit is not a substitute for shared production throttling.
const uploadLimit = createRateLimiter({
  max: 10,
  windowMs: 15 * 60 * 1000,
  keyGenerator: (req) => req.user?._id?.toString(),
});

router.post('/', protect, uploadLimit, (req, res, next) => {
  upload.single('image')(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ message: 'Image upload rejected: invalid size or number of files' });
    }
    return res.status(400).json({ message: 'Only JPEG and PNG images up to 5 MB are allowed' });
  });
}, uploadProfileImage);

module.exports = router;
