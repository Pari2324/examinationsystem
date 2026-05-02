// routes/auth.js — Authentication endpoints

const express = require('express');
const router  = express.Router();

const { register, login, getMe } = require('../controllers/authController');
const { protect }                 = require('../middleware/auth');
const { registerRules, loginRules, handleValidation } = require('../middleware/validate');

// POST /api/auth/register
router.post('/register', registerRules, handleValidation, register);

// POST /api/auth/login
router.post('/login', loginRules, handleValidation, login);

// GET /api/auth/me  — protected, returns current user
router.get('/me', protect, getMe);

module.exports = router;
