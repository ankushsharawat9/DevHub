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
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    tokenVersion: {
  type: Number,
  default: 0,
},


    // ✅ Email Verification
    verificationToken: String,
    verificationTokenExpires: Date,

    // ✅ Forgot Password
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // ✅ Track password changes for JWT invalidation
    passwordChangedAt: Date,

    // ✅ Profile Info
    profilePic: String,        // Cloudinary secure_url
    profilePicId: String,      // Cloudinary public_id
  },
  { timestamps: true }
);

// 🔐 Hash password before saving, update passwordChangedAt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = new Date(); // 👈 update timestamp when password changes
    next();
  } catch (err) {
    next(err);
  }
});

// 🔍 Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
