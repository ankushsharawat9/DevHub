const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary'); // ✅ Cloudinary Multer config

// GET /api/auth/me (Protected)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('❌ GET /me Error:', err.message);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({ ...req.body, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('❌ Register Error:', err.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('❌ Login Error:', err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// UPDATE USER PROFILE (name, email, password)
router.put('/me', verifyToken, async (req, res) => {
  try {
    const updates = {};

    if (req.body.name) updates.name = req.body.name;
    if (req.body.email) updates.email = req.body.email;

    if (req.body.password) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      updates.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select('-password');

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error('❌ Profile Update Error:', err.message);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// UPDATE PROFILE PHOTO (upload to Cloudinary)
router.put('/me/photo', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('📸 Uploaded file:', req.file); // TEMP debug

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { profilePic: req.file.path }, // Cloudinary gives secure URL in path
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile picture updated', user: updatedUser });
  } catch (err) {
    console.error('❌ Cloudinary Upload Error:', err.stack);
    res.status(500).json({ message: 'Server error during photo upload' });
  }
});

module.exports = router;
