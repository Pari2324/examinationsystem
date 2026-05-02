// routes/results.js — Result submission and retrieval endpoints

const express = require('express');
const router  = express.Router();

const { submitExam, getMyResults, getAllResults, getViolations, getStats } = require('../controllers/resultController');
const { protect, restrictTo } = require('../middleware/auth');
const { submitRules, handleValidation } = require('../middleware/validate');

router.use(protect);

// POST /api/results/submit   — student submits exam
router.post('/submit', submitRules, handleValidation, submitExam);

// GET  /api/results/my       — student's own results
router.get('/my', getMyResults);

// Admin-only routes below
// GET  /api/results           — all results
router.get('/', restrictTo('admin'), getAllResults);

// GET  /api/results/violations — flagged results
router.get('/violations', restrictTo('admin'), getViolations);

// GET  /api/results/stats      — aggregate stats
router.get('/stats', restrictTo('admin'), getStats);

module.exports = router;
