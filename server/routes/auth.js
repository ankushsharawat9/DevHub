const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const passport = require('passport');
const User = require('../models/User');
const verifyToken = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const { sendVerificationEmail } = require('../utils/sendVerificationEmail');
const sendEmail = require('../utils/sendEmail');

// 🟢 GET /me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Failed to fetch user info' });
  }
});

// 🟢 POST /register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword)
      return res.status(400).json({ message: 'All fields are required' });

    if (password !== confirmPassword)
      return res.status(400).json({ message: 'Passwords do not match' });

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
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
      loginType: 'manual',
    });

    await newUser.save();
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ message: 'Registration successful. Please verify your email.' });
  } catch {
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// 🟢 GET /verify-email
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
  } catch {
    res.status(500).json({ message: 'Email verification failed' });
  }
});

// 🟢 POST /login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (user.loginType === 'google')
      return res.status(400).json({ message: 'Use Google login for this account' });

    if (!user.isVerified)
      return res.status(403).json({ message: 'Please verify your email first' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

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
  } catch {
    res.status(500).json({ message: 'Server error during login' });
  }
});

// 🟢 PUT /me
router.put('/me', verifyToken, async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.email) updates.email = req.body.email;

    if (req.body.password)
      return res.status(400).json({ message: 'Use /change-password instead' });

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select('-password');

    res.json({ message: 'Profile updated', user: updatedUser });
  } catch {
    res.status(500).json({ message: 'Profile update error' });
  }
});

// 🟢 PUT /change-password
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.loginType === 'google')
      return res.status(400).json({ message: 'Google users cannot change password' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    user.tokenVersion += 1;
    await user.save();

    res.json({ message: 'Password changed successfully. Please log in again.' });
  } catch {
    res.status(500).json({ message: 'Error changing password' });
  }
});

// 🟢 PUT /me/photo
router.put('/me/photo', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { profilePic: req.file.path },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile picture updated', user: updatedUser });
  } catch {
    res.status(500).json({ message: 'Error uploading photo' });
  }
});

// 🟢 POST /forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Email not found' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
    await user.save();

    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
    const message = `Hi ${user.name},\n\nClick to reset password:\n${resetUrl}`;

    await sendEmail({
      to: user.email,
      subject: 'Reset Your Password',
      text: message,
    });

    res.status(200).json({ message: 'Reset email sent' });
  } catch {
    res.status(500).json({ message: 'Server error during reset email' });
  }
});

// 🟢 POST /reset-password
router.post('/reset-password', async (req, res) => {
  const { token } = req.query;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: 'Reset token expired or invalid',
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
      text: `Hi ${user.name},\n\nYour password was successfully reset.`,
    });

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch {
    res.status(500).json({ message: 'Error resetting password' });
  }
});

// 🟢 Google OAuth2 Login Entry Point
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// 🟢 Google OAuth2 Redirect Callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/auth/google/failure',
    session: false,
  }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { id: req.user._id, tokenVersion: req.user.tokenVersion },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      res.redirect(`http://localhost:3000/social-login?token=${token}`);
    } catch {
      res.redirect('http://localhost:3000/social-login?error=jwt_error');
    }
  }
);

// 🔴 Fallback if Google login fails
router.get('/google/failure', (req, res) => {
  res.redirect('http://localhost:3000/social-login?error=google_auth_failed');
});

module.exports = router;
