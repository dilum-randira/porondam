const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const { uploadProfileImage } = require('../controllers/uploadController');

const router = express.Router();

router.post('/', protect, (req, res, next) => {
  upload.single('image')(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ message: 'Image upload rejected: invalid size or number of files' });
    }
    return res.status(400).json({ message: 'Only JPEG and PNG images up to 5 MB are allowed' });
  });
}, uploadProfileImage);

module.exports = router;
