const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // 🔐 Check if token is invalidated by tokenVersion bump
    if (user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    }

    // 🔐 Check if password was changed after token was issued
    if (user.passwordChangedAt) {
      const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
      if (decoded.iat < changedTimestamp) {
        return res.status(401).json({ message: 'Password changed recently. Please log in again.' });
      }
    }

    req.user = { id: user._id, tokenVersion: user.tokenVersion }; // Store for next use
    next();
  } catch (err) {
    console.error('❌ Auth error:', err);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = verifyToken;
