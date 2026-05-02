// controllers/examController.js — Exam CRUD operations

const Exam = require('../models/Exam');

/**
 * POST /api/exams  (admin only)
 * Create a new exam with embedded questions.
 */
async function createExam(req, res) {
  try {
    const { title, subject, instructions, duration, passMark, startTime, endTime, questions, status } = req.body;

    const exam = await Exam.create({
      title, subject, instructions, duration,
      passMark: passMark || 40,
      startTime, endTime,
      questions: questions || [],
      status: status || 'draft',
      createdBy: req.user._id,
    });

    res.status(201).json({ message: 'Exam created successfully', exam });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/exams
 * Students → only active exams (without correct answers exposed).
 * Admins   → all exams.
 */
async function getExams(req, res) {
  try {
    const filter = req.user.role === 'student' ? { status: 'active' } : {};
    const exams  = await Exam.find(filter)
      .select('-questions.correct')   // hide answers from students
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/exams/:id
 * Full exam detail. Correct answers stripped for students.
 */
async function getExamById(req, res) {
  try {
    const exam = await Exam.findById(req.params.id).populate('createdBy', 'name');
    if (!exam) return res.status(404).json({ message: 'Exam not found.' });

    // Students only see active exams
    if (req.user.role === 'student' && exam.status !== 'active') {
      return res.status(403).json({ message: 'This exam is not available.' });
    }

    // Strip correct answers for students
    const data = exam.toJSON();
    if (req.user.role === 'student') {
      data.questions = data.questions.map(({ correct, ...rest }) => rest);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/exams/:id/questions
 * Returns just the questions array (no correct answers) for exam-taking.
 */
async function getExamQuestions(req, res) {
  try {
    const exam = await Exam.findById(req.params.id).select('questions title status');
    if (!exam) return res.status(404).json({ message: 'Exam not found.' });
    if (req.user.role === 'student' && exam.status !== 'active') {
      return res.status(403).json({ message: 'Exam is not available.' });
    }

    // Strip correct answers before sending to student
    const questions = exam.questions.map(q => ({
      _id:     q._id,
      text:    q.text,
      options: q.options,
      marks:   q.marks,
    }));

    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * PATCH /api/exams/:id  (admin only)
 * Update exam fields. Questions are replaced if provided.
 */
async function updateExam(req, res) {
  try {
    const allowed = ['title','subject','instructions','duration','passMark','startTime','endTime','questions','status'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const exam = await Exam.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!exam) return res.status(404).json({ message: 'Exam not found.' });

    res.json({ message: 'Exam updated', exam });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * DELETE /api/exams/:id  (admin only)
 */
async function deleteExam(req, res) {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found.' });
    res.json({ message: 'Exam deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { createExam, getExams, getExamById, getExamQuestions, updateExam, deleteExam };
