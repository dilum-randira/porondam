const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    dateOfBirth: { type: Date, default: null, select: false },
    bio: {
      type: String,
      default: '',
      trim: true,
    },
    gender: {
      type: String,
      default: '',
      trim: true,
    },
    interestedIn: {
      type: String,
      default: '',
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
        required: true,
      },
      address: {
        type: String,
        default: '',
        trim: true,
      },
    },
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
