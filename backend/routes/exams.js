// routes/exams.js — Exam CRUD endpoints

const express = require('express');
const router  = express.Router();

const { createExam, getExams, getExamById, getExamQuestions, updateExam, deleteExam } = require('../controllers/examController');
const { protect, restrictTo } = require('../middleware/auth');
const { examRules, handleValidation } = require('../middleware/validate');

// All exam routes require authentication
router.use(protect);

// GET  /api/exams       — all active exams (students) or all (admin)
// POST /api/exams       — create exam (admin only)
router.route('/')
  .get(getExams)
  .post(restrictTo('admin'), examRules, handleValidation, createExam);

// GET   /api/exams/:id            — exam detail
// PATCH /api/exams/:id            — update exam (admin)
// DELETE/api/exams/:id            — delete exam (admin)
router.route('/:id')
  .get(getExamById)
  .patch(restrictTo('admin'), updateExam)
  .delete(restrictTo('admin'), deleteExam);

// GET /api/exams/:id/questions    — questions without correct answers
router.get('/:id/questions', getExamQuestions);

module.exports = router;
