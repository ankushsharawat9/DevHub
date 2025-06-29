// middleware/isAdmin.js
import User from '../models/userModel.js';

export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id); // fetch fresh user from DB

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    next();
  } catch (err) {
    console.error('Admin check error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
