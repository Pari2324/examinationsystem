// controllers/resultController.js — Exam submission, auto-grading, result fetching

const Result = require('../models/Result');
const Exam   = require('../models/Exam');

/**
 * POST /api/results/submit  (student)
 * Body: { examId, answers: { questionId: optionIndex }, violations, violationLog, timeTaken, reason }
 * Auto-grades against stored correct answers. Prevents duplicate submissions.
 */
async function submitExam(req, res) {
  try {
    const { examId, answers = {}, violations = 0, violationLog = [], timeTaken = 0, submissionReason = 'manual' } = req.body;

    // Prevent duplicate submission
    const already = await Result.findOne({ student: req.user._id, exam: examId });
    if (already) return res.status(409).json({ message: 'You have already submitted this exam.' });

    // Fetch exam WITH correct answers (admin model has them)
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found.' });

    // ── AUTO-GRADE ──
    let score = 0;
    exam.questions.forEach(q => {
      const studentAnswer = answers[q._id.toString()];
      if (studentAnswer !== undefined && parseInt(studentAnswer) === q.correct) {
        score += q.marks || 1;
      }
    });

    const total      = exam.questions.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const passed     = percentage >= (exam.passMark || 40);

    // ── ANTI-CHEAT ANALYSIS ──
    // Flag result if too many violations or suspiciously fast submission
    const minExpectedTime = exam.duration * 60 * 0.1; // 10% of exam time
    const suspicious = violations >= 2 || timeTaken < minExpectedTime;

    const result = await Result.create({
      student:          req.user._id,
      exam:             examId,
      score,
      total,
      percentage,
      passed,
      answers:          new Map(Object.entries(answers).map(([k, v]) => [k, parseInt(v)])),
      violations,
      violationLog,
      snapshots:        0,
      timeTaken,
      submissionReason,
      suspicious,
    });

    // Populate for response
    await result.populate('exam', 'title subject duration');

    res.status(201).json({
      message: 'Exam submitted and graded.',
      result: {
        score, total, percentage, passed,
        violations, timeTaken, submissionReason,
        examTitle: exam.title,
        submittedAt: result.submittedAt,
      },
    });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Duplicate submission detected.' });
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/results/my  (student)
 * Returns all results for the logged-in student.
 */
async function getMyResults(req, res) {
  try {
    const results = await Result.find({ student: req.user._id })
      .populate('exam', 'title subject duration')
      .sort({ submittedAt: -1 });

    const formatted = results.map(r => ({
      examTitle:   r.exam?.title || 'Unknown',
      subject:     r.exam?.subject || '',
      date:        r.submittedAt.toISOString().split('T')[0],
      score:       r.score,
      total:       r.total,
      percentage:  r.percentage,
      duration:    `${Math.floor(r.timeTaken / 60)}m ${r.timeTaken % 60}s`,
      violations:  r.violations,
      passed:      r.passed,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/results  (admin only)
 * Returns all results across all students.
 */
async function getAllResults(req, res) {
  try {
    const results = await Result.find({})
      .populate('student', 'name email rollNumber')
      .populate('exam', 'title subject')
      .sort({ submittedAt: -1 });

    const formatted = results.map(r => ({
      id:         r._id,
      student:    r.student?.name || 'Unknown',
      email:      r.student?.email || '',
      exam:       r.exam?.title || 'Unknown',
      subject:    r.exam?.subject || '',
      score:      r.score,
      total:      r.total,
      pct:        r.percentage,
      violations: r.violations,
      submitted:  r.submittedAt.toLocaleString(),
      passed:     r.passed,
      suspicious: r.suspicious || false,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/results/violations  (admin only)
 * Returns all results that had violations, for the violation log view.
 */
async function getViolations(req, res) {
  try {
    const results = await Result.find({ violations: { $gt: 0 } })
      .populate('student', 'name email')
      .populate('exam', 'title')
      .sort({ violations: -1 });

    const formatted = results.map(r => ({
      student:      r.student?.name || 'Unknown',
      exam:         r.exam?.title || 'Unknown',
      violations:   r.violations,
      violationLog: r.violationLog,
      submitted:    r.submittedAt.toLocaleString(),
      suspicious:   r.suspicious,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/results/stats  (admin only)
 * Aggregate stats for overview dashboard.
 */
async function getStats(req, res) {
  try {
    const [totalResults, passCount, totalViolations] = await Promise.all([
      Result.countDocuments(),
      Result.countDocuments({ passed: true }),
      Result.aggregate([{ $group: { _id: null, total: { $sum: '$violations' } } }]),
    ]);

    const avgScore = await Result.aggregate([
      { $group: { _id: null, avg: { $avg: '$percentage' } } }
    ]);

    res.json({
      totalSubmissions: totalResults,
      passRate:         totalResults > 0 ? Math.round((passCount / totalResults) * 100) : 0,
      totalViolations:  totalViolations[0]?.total || 0,
      avgScore:         avgScore[0]?.avg ? Math.round(avgScore[0].avg) : 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { submitExam, getMyResults, getAllResults, getViolations, getStats };
