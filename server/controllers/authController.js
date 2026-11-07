const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const districts = new Set([
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy',
  'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale',
  'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
]);

const createToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const isAdult = (dateString) => {
  if (typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  const birth = new Date(dateString + 'T00:00:00.000Z');
  if (!Number.isFinite(birth.getTime()) || birth.toISOString().slice(0, 10) !== dateString) return false;
  const today = new Date();
  const cutoff = new Date(Date.UTC(today.getUTCFullYear() - 18, today.getUTCMonth(), today.getUTCDate()));
  return birth <= cutoff;
};

const publicUser = (user) => ({
  _id: user._id, name: user.name, email: user.email, bio: user.bio,
  gender: user.gender, interestedIn: user.interestedIn, district: user.district, images: user.images,
  token: createToken(user._id),
});

const registerUser = async (req, res) => {
  try {
    const { name, email, password, dateOfBirth, bio, gender, interestedIn, district } = req.body || {};
    if (typeof name !== 'string' || !name.trim() || name.length > 80 ||
        typeof email !== 'string' || email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        typeof password !== 'string' || password.length < 12 || password.length > 128) {
      return res.status(400).json({ message: 'Provide a valid name, email and password (12–128 characters).' });
    }
    if (!isAdult(dateOfBirth)) {
      return res.status(400).json({ message: 'Porondam registration is for adults aged 18 or older.' });
    }
    if (typeof bio !== 'undefined' && (typeof bio !== 'string' || bio.length > 1000)) {
      return res.status(400).json({ message: 'Bio must be at most 1000 characters.' });
    }
    if (gender && !['male', 'female', 'non-binary'].includes(gender)) {
      return res.status(400).json({ message: 'Invalid gender selection.' });
    }
    if (interestedIn && !['male', 'female', 'everyone'].includes(interestedIn)) {
      return res.status(400).json({ message: 'Invalid preference.' });
    }
    if (district !== undefined && district !== '' &&
        (typeof district !== 'string' || !districts.has(district))) {
      return res.status(400).json({ message: 'Select a valid Sri Lankan district or leave it blank.' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ message: 'Unable to create account with this email.' });
    }
    const user = await User.create({
      name: name.trim(), email: normalizedEmail,
      password: await bcrypt.hash(password, 12), dateOfBirth,
      bio: bio || '', gender: gender || '', interestedIn: interestedIn || '',
      district: district || '',
    });
    return res.status(201).json(publicUser(user));
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'Unable to create account with this email.' });
    return res.status(500).json({ message: 'Unable to create account.' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string' ||
        email.length > 254 || password.length > 128 || !email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    return res.json(publicUser(user));
  } catch {
    return res.status(500).json({ message: 'Unable to sign in.' });
  }
};

module.exports = { registerUser, loginUser };
