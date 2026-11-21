const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');
const { validateImage } = require('../utils/imageValidation');
const { photoUploadResponse } = require('../utils/uploadResponse');

function storeValidatedImage(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'porondam_profiles',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }],
      },
      (error, result) => error ? reject(error) : resolve(result)
    );
    stream.on('error', reject);
    stream.end(buffer);
  });
}

const uploadProfileImage = async (req, res) => {
  if (!req.user || !req.user._id) return res.status(401).json({ message: 'Not authorized' });
  if (!req.file) return res.status(400).json({ message: 'No image file provided' });
  if (!validateImage(req.file)) return res.status(400).json({ message: 'Invalid JPEG or PNG image' });

  try {
    const result = await storeValidatedImage(req.file.buffer);
    const imageUrl = result?.secure_url;
    const parsed = typeof imageUrl === 'string' ? new URL(imageUrl) : null;
    if (!parsed || parsed.protocol !== 'https:' || parsed.hostname !== 'res.cloudinary.com') {
      return res.status(502).json({ message: 'Image storage did not return a trusted secure URL' });
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { images: imageUrl } },
      { new: true }
    ).select('-password');
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    // Return only the changed profile field, never the full account document.
    // Legacy location and other private fields must not reach browser storage.
    return res.json(photoUploadResponse(updatedUser));
  } catch (error) {
    console.error('Profile image upload failed');
    return res.status(500).json({ message: 'Failed to upload image' });
  }
};
module.exports = { uploadProfileImage };
