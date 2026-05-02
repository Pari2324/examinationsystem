// config/jwt.js — JWT token generation and verification helpers

const jwt = require('jsonwebtoken');

const SECRET  = process.env.JWT_SECRET  || 'examsecure_fallback_secret';
const EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a signed JWT for the given user object.
 * Payload contains id, email, and role (no sensitive data).
 */
function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    SECRET,
    { expiresIn: EXPIRES }
  );
}

/**
 * Verify a JWT string. Returns the decoded payload or throws.
 */
function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { generateToken, verifyToken };
