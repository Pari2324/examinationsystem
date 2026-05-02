// models/Contact.js — Schema for contact form submissions

const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'],
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true,
  },
  role: {
    type: String,
    enum: ['Student', 'Teacher', 'Administrator', 'Other'],
    required: true,
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    minlength: 10,
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied'],
    default: 'new',
  },
}, { timestamps: true });

module.exports = mongoose.model('Contact', ContactSchema);
