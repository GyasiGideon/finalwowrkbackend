// middleware/requireAuth.js
import jwt from 'jsonwebtoken';

const requireAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"

    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = { id: decoded.id };

    next();
  } catch (err) {
    console.error('❌ Auth Error:', err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default requireAuth;
