const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// User schema
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
      select: false, // Prevent return of password in queries
    },

    googleId: {
      type: String,
      default: null,
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

    // Email change (pending new email confirmation)
    pendingEmail: String,
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // Email verification on register
    verificationToken: String,
    verificationTokenExpires: Date,

    // Forgot password
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // For tracking when password was last changed
    passwordChangedAt: Date,

    // Cloudinary profile image
    profilePic: {
      type: String, // secure URL
      default: '',  // Optional
    },
    profilePicId: {
      type: String, // Cloudinary public_id
    },
  },
  { timestamps: true }
);

//
// 🔐 Pre-save hook to hash password only if user is manual and password is modified
//
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (this.loginType === 'google') return next(); // Don't hash password for Google users

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = new Date();
    next();
  } catch (err) {
    next(err);
  }
});

//
// 🔍 Compare password method
//
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

//
// 🧼 Public profile method (optional, use in routes if needed)
//
UserSchema.methods.toPublic = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verificationToken;
  delete obj.verificationTokenExpires;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.tokenVersion;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
