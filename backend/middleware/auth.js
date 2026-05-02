// middleware/auth.js — Protects routes with JWT and role checks

const { verifyToken } = require('../config/jwt');
const User = require('../models/User');

/**
 * protect — Verifies Bearer token. Attaches req.user on success.
 */
async function protect(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided. Please log in.' });
    }

    const token = header.split(' ')[1];
    const decoded = verifyToken(token);

    // Fetch fresh user so we always have current role + isActive status
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User no longer exists.' });
    if (!user.isActive) return res.status(403).json({ message: 'Your account has been suspended.' });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ message: 'Session expired. Please log in again.' });
    return res.status(401).json({ message: 'Invalid token.' });
  }
}

/**
 * restrictTo(...roles) — Role-based access control.
 * Usage: router.get('/admin-only', protect, restrictTo('admin'), handler)
 */
function restrictTo(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Required role: ${roles.join(' or ')}` });
    }
    next();
  };
}

module.exports = { protect, restrictTo };
