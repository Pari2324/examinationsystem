// models/Exam.js — Schema for exams and embedded questions

const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text:    { type: String, required: true },
  options: { type: [String], required: true, validate: v => v.length === 4 },
  correct: { type: Number, required: true, min: 0, max: 3 }, // index into options
  marks:   { type: Number, default: 1 },
});

const ExamSchema = new mongoose.Schema({
  title:         { type: String, required: true, trim: true },
  subject:       { type: String, required: true, trim: true },
  instructions:  { type: String, default: '' },
  duration:      { type: Number, required: true, min: 5 },  // minutes
  passMark:      { type: Number, default: 40 },              // percentage
  startTime:     { type: Date },
  endTime:       { type: Date },
  questions:     { type: [QuestionSchema], default: [] },
  status:        { type: String, enum: ['draft', 'active', 'closed'], default: 'draft' },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Virtual: total marks
ExamSchema.virtual('totalMarks').get(function () {
  return this.questions.reduce((s, q) => s + q.marks, 0);
});

// Virtual: question count (without full question bodies for list views)
ExamSchema.virtual('totalQuestions').get(function () {
  return this.questions.length;
});

ExamSchema.set('toJSON', { virtuals: true });
ExamSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Exam', ExamSchema);
