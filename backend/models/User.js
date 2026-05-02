// models/User.js — Mongoose schema for users (students + admins)

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false, // Never return password in queries
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
  },
  rollNumber: { type: String, trim: true },
  department:  { type: String, trim: true },
  isActive:    { type: Boolean, default: true },
  lastLogin:   { type: Date },
}, { timestamps: true });

// ── HASH PASSWORD BEFORE SAVE ──
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── COMPARE PASSWORD METHOD ──
UserSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

// ── HIDE SENSITIVE FIELDS IN JSON ──
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
