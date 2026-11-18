// Reject misleading MIME labels and file extensions before passing bytes to Cloudinary.
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
function detectImageType(buffer) {
  if (!Buffer.isBuffer(buffer)) return null;
  if (buffer.length >= 3 && buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'image/jpeg';
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png';
  return null;
}
function validateImage(file) {
  if (!file || !Buffer.isBuffer(file.buffer) || file.buffer.length === 0 || file.buffer.length > MAX_IMAGE_BYTES) return false;
  const actual = detectImageType(file.buffer);
  if (!actual || actual !== file.mimetype) return false;
  const extension = (file.originalname || '').toLowerCase();
  return actual === 'image/jpeg' ? /\.jpe?g$/.test(extension) : /\.png$/.test(extension);
}
module.exports = { MAX_IMAGE_BYTES, detectImageType, validateImage };
