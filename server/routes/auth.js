const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const verifyToken = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const { sendVerificationEmail } = require('../utils/sendVerificationEmail');
const sendEmail = require('../utils/sendEmail');

// GET /me - Fetch user info
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user info' });
  }
});

// POST /register - User signup
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
      password,
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
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// GET /verify-email - Confirm email
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
    res.status(500).json({ message: 'Email verification failed' });
  }
});

// POST /login - Auth
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isVerified)
      return res.status(403).json({ message: 'Please verify your email first' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    // JWT includes tokenVersion
    const token = jwt.sign(
      { id: user._id, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

// PUT /me - Update profile (name, email, optional password)
router.put('/me', verifyToken, async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.email) updates.email = req.body.email;

    // Do not allow password change from here
    if (req.body.password) {
      return res.status(400).json({ message: 'Use /change-password instead' });
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select('-password');

    if (!updatedUser)
      return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Profile updated', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// ✅ PUT /change-password - Authenticated route to change password
router.put('/change-password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both fields are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    user.tokenVersion += 1; // logout from all devices
    await user.save();

    res.json({ message: 'Password changed successfully. Please log in again.' });
  } catch (err) {
    res.status(500).json({ message: 'Error changing password' });
  }
});

// PUT /me/photo - Upload profile image
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
    res.status(500).json({ message: 'Error uploading profile picture' });
  }
});

// POST /forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Email not found' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 mins
    await user.save();

    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
    const message = `Hi ${user.name},\n\nClick to reset your password:\n${resetUrl}\n\nThis link expires in 30 minutes.`;

    await sendEmail({
      to: user.email,
      subject: 'Reset Your Password',
      text: message,
    });

    res.status(200).json({ message: 'Reset email sent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /reset-password
router.post('/reset-password', async (req, res) => {
  const { token } = req.query;
  const { newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Missing token or password' });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: 'Reset link has expired or is invalid',
        expired: true,
      });
    }

    user.password = newPassword;
    user.tokenVersion += 1;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Your password has been changed',
      text: `Hi ${user.name},\n\nYour password was successfully reset. If this wasn't you, contact support immediately.`,
    });

    res.status(200).json({
      message: 'Password has been reset successfully. Confirmation sent.',
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

module.exports = router;
