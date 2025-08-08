// services/emailService.js
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

sgMail.setApiKey(process.env.EMAIL_PASS); // This is your SendGrid API Key

export const sendPasswordResetEmail = async (to, token) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  const msg = {
    to,
    from: 'gyasingideon@gmail.com', // Can be anything, but must be a verified sender on SendGrid
    subject: 'Password Reset Request - Smart Dispenser',
    text: `Click the link to reset your password: ${resetLink}`,
    html: `
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}" target="_blank">${resetLink}</a>
      <p>If you didn’t request this, you can ignore this email.</p>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Email sent to:', to);
  } catch (error) {
    console.error('❌ SendGrid email error:', error.response?.body || error.message);
    throw new Error('Email could not be sent');
  }
};
