// controllers/contactController.js — Contact form submissions

const Contact = require('../models/Contact');

/**
 * POST /api/contact  (public)
 * Save a contact form submission.
 */
async function submitContact(req, res) {
  try {
    const { name, email, phone, role, message } = req.body;
    const contact = await Contact.create({ name, email, phone, role, message });
    res.status(201).json({ message: 'Message received. We will get back to you soon.', id: contact._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/contact  (admin only)
 * Fetch all contact submissions, newest first.
 */
async function getContacts(req, res) {
  try {
    const contacts = await Contact.find({}).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * PATCH /api/contact/:id/status  (admin only)
 * Mark a message as read or replied.
 */
async function updateStatus(req, res) {
  try {
    const { status } = req.body;
    if (!['new','read','replied'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }
    const contact = await Contact.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!contact) return res.status(404).json({ message: 'Message not found.' });
    res.json({ message: 'Status updated.', contact });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { submitContact, getContacts, updateStatus };
