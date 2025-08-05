import db from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import emailService from '../services/emailService.js';

// Request Password Reset
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiration = Date.now() + 3600000; // 1 hour

    // Save token to database
    await db.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, resetToken, expiration]
    );

    // Send email with reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await emailService.sendPasswordResetEmail(email, resetLink);

    res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('❌ Password reset request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Validate token
    const result = await db.query(
      'SELECT * FROM password_reset_tokens WHERE token = $1 AND expires_at > $2',
      [token, Date.now()]
    );
    const tokenData = result.rows[0];
    if (!tokenData) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await db.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, tokenData.user_id]
    );

    // Delete the used token
    await db.query('DELETE FROM password_reset_tokens WHERE token = $1', [token]);

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('❌ Password reset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};