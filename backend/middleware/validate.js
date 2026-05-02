// middleware/validate.js — Input validation rules using express-validator

const { body, validationResult } = require('express-validator');

/**
 * handleValidation — Reads express-validator errors and sends 400 if any exist.
 * Must be placed AFTER the validation rule arrays in the route chain.
 */
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg);
    return res.status(400).json({ message: messages[0], errors: messages });
  }
  next();
}

// ── RULE SETS ──

const registerRules = [
  body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['student', 'admin']).withMessage('Invalid role'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const examRules = [
  body('title').trim().notEmpty().withMessage('Exam title is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('duration').isInt({ min: 5 }).withMessage('Duration must be at least 5 minutes'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
  body('questions.*.text').notEmpty().withMessage('Question text is required'),
  body('questions.*.options').isArray({ min: 4, max: 4 }).withMessage('Each question needs exactly 4 options'),
  body('questions.*.correct').isInt({ min: 0, max: 3 }).withMessage('Correct answer index must be 0-3'),
];

const contactRules = [
  body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('role').isIn(['Student', 'Teacher', 'Administrator', 'Other']).withMessage('Invalid role'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
];

const submitRules = [
  body('examId').notEmpty().withMessage('Exam ID is required'),
  body('answers').isObject().withMessage('Answers must be provided'),
  body('violations').isInt({ min: 0 }).withMessage('Violations count required'),
];

module.exports = {
  handleValidation,
  registerRules,
  loginRules,
  examRules,
  contactRules,
  submitRules,
};
