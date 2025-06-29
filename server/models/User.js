import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
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
      select: false,
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
    role: {
  type: String,
  enum: ['user', 'admin'],
  default: 'user',
},


    pendingEmail: String,
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    verificationToken: String,
    verificationTokenExpires: Date,

    resetPasswordToken: String,
    resetPasswordExpires: Date,

    passwordChangedAt: Date,

    profilePic: {
      type: String,
      default: '',
    },
    profilePicId: {
      type: String,
    },
  },
  { timestamps: true }
);

// 🔐 Pre-save hook: hash password (only if manual login and password is modified)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (this.loginType === 'google') return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = new Date();
    next();
  } catch (err) {
    next(err);
  }
});

// 🔍 Method: Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 🧼 Method: Return public profile
userSchema.methods.toPublic = function () {
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

const User = mongoose.model('User', userSchema);

export default User;
