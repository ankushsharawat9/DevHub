const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail'); // custom email util

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// REGISTER with email verification
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Email already in use' });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = Date.now() + 3600000; // 1 hour

    user = new User({
      name,
      email,
      password,
      verificationToken,
      verificationTokenExpires,
      isVerified: false,
    });

    await user.save();

    const verificationLink = `http://localhost:3000/verify-email?token=${verificationToken}`;

    const message = `Hi ${name},\n\nPlease verify your email by clicking the link below:\n${verificationLink}\n\nThis link expires in 1 hour.`;

    await sendEmail({
      to: email,
      subject: 'Verify your email',
      text: message,
    });

    res.status(201).json({ message: 'Registration successful. Please check your email to verify.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// LOGIN (only allow if verified)
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email first.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    if (!token) return res.status(400).json({ message: 'Token missing' });

    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ message: 'Invalid or already used token' });

    if (user.verificationTokenExpires < Date.now()) {
      return res.status(400).json({ message: 'Token expired' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ message: 'Server error during verification' });
  }
};
