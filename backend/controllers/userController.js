// controllers/userController.js — Admin user management

const User   = require('../models/User');
const Result = require('../models/Result');

/**
 * GET /api/users  (admin only)
 * Returns all users with their exam stats.
 */
async function getAllUsers(req, res) {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });

    // Attach per-student stats
    const enriched = await Promise.all(users.map(async u => {
      const results = await Result.find({ student: u._id });
      const avg = results.length
        ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length)
        : 0;
      return {
        id:         u._id,
        name:       u.name,
        email:      u.email,
        role:       u.role,
        rollNumber: u.rollNumber,
        department: u.department,
        isActive:   u.isActive,
        examsTaken: results.length,
        avgScore:   avg,
        joined:     u.createdAt.toISOString().split('T')[0],
        lastLogin:  u.lastLogin ? u.lastLogin.toLocaleString() : 'Never',
      };
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * PATCH /api/users/:id/status  (admin only)
 * Activate or suspend a user account.
 */
async function toggleStatus(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Prevent admins from suspending themselves
    if (user._id.equals(req.user._id)) {
      return res.status(400).json({ message: 'You cannot change your own account status.' });
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.json({ message: `User ${user.isActive ? 'activated' : 'suspended'}.`, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * DELETE /api/users/:id  (admin only)
 * Hard delete a user and their results.
 */
async function deleteUser(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user._id.equals(req.user._id)) return res.status(400).json({ message: 'Cannot delete your own account.' });

    await Result.deleteMany({ student: user._id });
    await user.deleteOne();

    res.json({ message: 'User and their results deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * PATCH /api/users/me  (any authenticated user)
 * Update own profile (name, rollNumber, department only).
 */
async function updateProfile(req, res) {
  try {
    const allowed = ['name', 'rollNumber', 'department'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ message: 'Profile updated.', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getAllUsers, toggleStatus, deleteUser, updateProfile };
