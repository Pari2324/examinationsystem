// routes/users.js — User management endpoints

const express = require('express');
const router  = express.Router();

const { getAllUsers, toggleStatus, deleteUser, updateProfile } = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

// PATCH /api/users/me  — update own profile (any role)
router.patch('/me', updateProfile);

// Admin-only
router.get('/',               restrictTo('admin'), getAllUsers);
router.patch('/:id/status',   restrictTo('admin'), toggleStatus);
router.delete('/:id',         restrictTo('admin'), deleteUser);

module.exports = router;
