import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import passport from 'passport';
import User from '../models/User.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js'; // ✅ CORRECT

import { upload } from '../config/cloudinary.js';
import { sendVerificationEmail } from '../utils/sendVerificationEmail.js';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

// 🔑 JWT Generators
const generateAccessToken = (user) =>
  jwt.sign({ id: user._id, tokenVersion: user.tokenVersion }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

const generateRefreshToken = (user) =>
  jwt.sign({ id: user._id, tokenVersion: user.tokenVersion }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });

// 🔒 GET /me (Protected)
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

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

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

    const user = await User.findOne({ email }).select('+password');
    if (!user || user.loginType === 'google') {
      return res.status(400).json({ message: 'Invalid credentials or use Google login' });
    }

    if (!user.isVerified)
      return res.status(403).json({ message: 'Please verify your email first' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('jid', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      path: '/api/auth/refresh-token',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// 🟢 POST /refresh-token
router.post('/refresh-token', async (req, res) => {
  const token = req.cookies.jid;
  if (!token) return res.status(401).json({ accessToken: '' });

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.id);
    if (!user || user.tokenVersion !== payload.tokenVersion)
      return res.status(401).json({ accessToken: '' });

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  } catch {
    return res.status(401).json({ accessToken: '' });
  }
});

// 🟢 PUT /me
router.put('/me', verifyToken, async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) {
      user.name = name;
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing)
        return res.status(400).json({ message: 'This new email is already in use' });

      const verificationToken = crypto.randomBytes(32).toString('hex');

      user.pendingEmail = email;
      user.emailVerificationToken = verificationToken;
      user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

      await user.save();

      await sendVerificationEmail(email, verificationToken, 'emailChange');

      await sendEmail({
        to: user.email,
        subject: 'Email Change Alert',
        text: `Hi ${user.name},\n\nSomeone requested to change the email on your DevHub account. If this wasn't you, please secure your account immediately.`,
      });

      return res.status(200).json({
        message: '📨 Please confirm your new email address to complete the change.',
      });
    }

    await user.save();

    res.json({
      message: '✅ Profile updated',
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('❌ Error in PUT /me:', err);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// 🟢 GET /confirm-new-email
router.get('/confirm-new-email', async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user || !user.pendingEmail) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const oldEmail = user.email;
    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.isVerified = true;

    await user.save();

    await sendEmail({
      to: user.email,
      subject: '✅ Email Updated Successfully',
      text: `Hi ${user.name},\n\nYour email has been successfully changed from ${oldEmail} to ${user.email}.`,
    });

    return res.redirect(`${process.env.FRONTEND_URL}/verified?emailChanged=true`);
  } catch (err) {
    console.error('❌ Error in /confirm-new-email:', err);
    return res.status(500).json({ message: 'Server error during email confirmation' });
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

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: 'Reset Your Password',
      text: `Hi ${user.name},\n\nReset your password:\n${resetUrl}`,
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

    if (!user)
      return res.status(400).json({ message: 'Reset token expired or invalid', expired: true });

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

// 🟢 Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/auth/google/failure',
    session: false,
  }),
  (req, res) => {
    try {
      const token = generateAccessToken(req.user);
      res.redirect(`${process.env.FRONTEND_URL}/social-login?token=${token}`);
    } catch {
      res.redirect(`${process.env.FRONTEND_URL}/social-login?error=jwt_error`);
    }
  }
);

router.get('/google/failure', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/social-login?error=google_auth_failed`);
});

export default router;
