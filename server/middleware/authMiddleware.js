import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 🔐 Middleware to verify JWT token and attach user to request
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });
    if (!user.isVerified) return res.status(403).json({ message: 'Email not verified' });

    if (user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ message: 'Token expired or revoked. Please log in again.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('❌ Auth Middleware Error:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please log in again.' });
    }
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// 👑 Middleware to restrict access to admin users
export const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user information' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    next();
  } catch (err) {
    console.error('❌ isAdmin Middleware Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 🛡️ Middleware to allow only specific roles
export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: No user information' });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: `Access denied: Requires role(s) [${allowedRoles.join(', ')}]`
        });
      }

      next();
    } catch (err) {
      console.error('❌ Role Check Middleware Error:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};
