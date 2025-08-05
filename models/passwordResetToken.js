import db from '../config/db.js';
import crypto from 'crypto';

const PasswordResetToken = {
  createToken: async (userId) => {
    // Generate a 40-character random token
    const token = crypto.randomBytes(20).toString('hex');
    const expirationDate = new Date(Date.now() + 3600000); // valid 1 hour

    // Save token in DB
    await db.query(
      'INSERT INTO password_reset_tokens (user_id, token, expiration) VALUES ($1, $2, $3)',
      [userId, token, expirationDate]
    );

    return token; // return token instead of ID
  },

  validateToken: async (token) => {
    const result = await db.query(
      'SELECT * FROM password_reset_tokens WHERE token = $1 AND expiration > NOW()',
      [token]
    );

    if (result.rows.length === 0) return null;
    return result.rows[0].user_id; // return userId if valid
  },

  deleteToken: async (token) => {
    await db.query('DELETE FROM password_reset_tokens WHERE token = $1', [token]);
  }
};

export default PasswordResetToken;
