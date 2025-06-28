const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },

    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
    },

    googleId: {
      type: String, // Used for Google OAuth
    },

    loginType: {
      type: String,
      enum: ['manual', 'google'],
      default: 'manual',
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    tokenVersion: {
      type: Number,
      default: 0,
    },

    verificationToken: String,
    verificationTokenExpires: Date,

    resetPasswordToken: String,
    resetPasswordExpires: Date,

    passwordChangedAt: Date,

    profilePic: String,       // Cloudinary secure_url
    profilePicId: String,     // Cloudinary public_id
  },
  { timestamps: true }
);

// 🔐 Hash password before save (manual users only)
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = new Date();
    next();
  } catch (err) {
    next(err);
  }
});

// 🔍 Compare candidate password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
