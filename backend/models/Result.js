// models/Result.js — Exam submission result with violation tracking

const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exam:    { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },

  // Scores
  score:      { type: Number, required: true },  // correct count
  total:      { type: Number, required: true },  // total questions
  percentage: { type: Number, required: true },
  passed:     { type: Boolean, required: true },

  // Answers: { questionId: selectedOption (0-3) }
  answers: { type: Map, of: Number, default: {} },

  // Anti-cheating
  violations:    { type: Number, default: 0 },
  violationLog:  { type: [String], default: [] },  // timestamped entries
  snapshots:     { type: Number, default: 0 },     // webcam capture count

  // Timing
  timeTaken: { type: Number, default: 0 },  // seconds
  submittedAt: { type: Date, default: Date.now },

  // Reason for submission (manual / timeout / violations)
  submissionReason: { type: String, default: 'manual' },

  // AI-like flag: true if behaviour was suspicious (fast submit + violations)
  suspicious: { type: Boolean, default: false },
}, { timestamps: true });

// Prevent duplicate submission (one result per student per exam)
ResultSchema.index({ student: 1, exam: 1 }, { unique: true });

module.exports = mongoose.model('Result', ResultSchema);
