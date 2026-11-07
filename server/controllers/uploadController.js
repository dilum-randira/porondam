const User = require('../models/User');

// Handles profile image upload after Cloudinary via Multer
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const imageUrl = req.file.path; // Cloudinary secure URL
    if (typeof imageUrl !== 'string' || !imageUrl.startsWith('https://')) {
      return res.status(502).json({ message: 'Image storage did not return a secure URL.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { images: imageUrl } },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(updatedUser);
  } catch (error) {
    console.error('Profile image upload failed');
    return res.status(500).json({ message: 'Failed to upload image' });
  }
};

module.exports = {
  uploadProfileImage,
};
