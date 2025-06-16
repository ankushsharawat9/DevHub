const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const verifyToken = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const { sendVerificationEmail } = require('../utils/sendVerificationEmail');

// ✅ GET /me - Get current user's info
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('❌ GET /me Error:', err);
    res.status(500).json({ message: 'Failed to fetch user info' });
  }
});

// ✅ POST /register - Register with email verification
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'Email already registered' });

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = new User({
      name,
      email,
      password, // 🔒 Let Mongoose hash this
      isVerified: false,
      verificationToken,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    await newUser.save();
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
    });
  } catch (err) {
    console.error('❌ Register Error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ✅ GET /verify-email?token=... - Verify user email
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Missing token' });

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: 'Invalid or expired token' });

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully!' });
  } catch (err) {
    console.error('❌ Verification Error:', err);
    res.status(500).json({ message: 'Email verification failed' });
  }
});

// ✅ POST /login - Login and get JWT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("📩 Login attempt:", { email });

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email first' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('❌ Login Error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ✅ PUT /me - Update user profile
router.put('/me', verifyToken, async (req, res) => {
  try {
    const updates = {};

    if (req.body.name) updates.name = req.body.name;
    if (req.body.email) updates.email = req.body.email;

    if (req.body.password) {
      // hash manually since findByIdAndUpdate bypasses Mongoose hooks
      updates.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select('-password');

    if (!updatedUser)
      return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Profile updated', user: updatedUser });
  } catch (err) {
    console.error('❌ Profile Update Error:', err);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// ✅ PUT /me/photo - Upload or change profile picture
router.put('/me/photo', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: 'No file uploaded' });

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { profilePic: req.file.path },
      { new: true }
    ).select('-password');

    if (!updatedUser)
      return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Profile picture updated', user: updatedUser });
  } catch (err) {
    console.error('❌ Photo Upload Error:', err);
    res.status(500).json({ message: 'Error uploading profile picture' });
  }
});

module.exports = router;
