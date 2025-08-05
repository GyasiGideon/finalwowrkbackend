import express from 'express';
import bcrypt from 'bcrypt';
import db from '../config/db.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Get current hash from DB
    const result = await db.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const valid = await bcrypt.compare(
      oldPassword,
      result.rows[0].password_hash
    );
    if (!valid) {
      return res.status(401).json({ message: 'Old password is incorrect.' });
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
      newHash,
      userId,
    ]);

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('❌ Change password error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
