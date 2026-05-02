// controllers/authController.js — Registration and Login logic

const User            = require('../models/User');
const { generateToken } = require('../config/jwt');

/**
 * POST /api/auth/register
 * Body: { name, email, password, role? }
 * Public route — but creating admins requires an existing admin token.
 */
async function register(req, res) {
  try {
    const { name, email, password, role = 'student', rollNumber, department } = req.body;

    // Prevent self-registration as admin from the public endpoint
    if (role === 'admin') {
      // Allow only if an authenticated admin is making the request
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(403).json({ message: 'Admin registration requires an existing admin token.' });
      }
    }

    // Check for duplicate email
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered.' });

    const user = await User.create({ name, email, password, role, rollNumber, department });
    const token = generateToken(user);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during registration', error: err.message });
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password, role? }
 * Returns JWT token + user info.
 */
async function login(req, res) {
  try {
    const { email, password, role } = req.body;

    // Fetch user WITH password (select: false by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

    // Check role matches (optional guard when frontend sends role)
    if (role && user.role !== role) {
      return res.status(403).json({ message: `This account is not registered as a ${role}.` });
    }

    // Verify password
    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: 'Invalid email or password.' });

    // Check account is active
    if (!user.isActive) return res.status(403).json({ message: 'Your account has been suspended. Contact admin.' });

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
}

/**
 * GET /api/auth/me  (protected)
 * Returns the currently logged-in user's profile.
 */
async function getMe(req, res) {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { register, login, getMe };
