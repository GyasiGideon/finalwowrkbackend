import express from 'express';
import { requestPasswordReset, resetPassword } from '../controllers/passwordController.js';

const router = express.Router();

// Route to request a password reset
router.post('/request-reset', requestPasswordReset);

// Route to reset the password
router.post('/reset', resetPassword);

export default router;