// routes/contact.js — Contact form endpoints

const express = require('express');
const router  = express.Router();

const { submitContact, getContacts, updateStatus } = require('../controllers/contactController');
const { protect, restrictTo } = require('../middleware/auth');
const { contactRules, handleValidation } = require('../middleware/validate');

// POST /api/contact   — public, no auth needed
router.post('/', contactRules, handleValidation, submitContact);

// Admin-only routes
router.get('/', protect, restrictTo('admin'), getContacts);
router.patch('/:id/status', protect, restrictTo('admin'), updateStatus);

module.exports = router;
