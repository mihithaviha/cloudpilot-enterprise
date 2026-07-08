import jwt from 'jsonwebtoken';
import { db } from '../models/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'cloudpilot_secret_token_12345';

// Authenticate JWT Token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please authenticate.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Session expired. Please log in again.' });
    }
    req.user = user;

    // Auto-recreate user profile in DB if it disappeared (due to serverless/stateless environments)
    try {
      let dbUser = db.findOne('users', u => u.id === user.id);
      if (!dbUser) {
        db.insert('users', {
          id: user.id,
          email: user.email,
          password: '', // stateless google/custom login user profile restore
          full_name: user.fullName || user.email.split('@')[0],
          role: user.role || 'Employee',
          avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.fullName || user.email)}`,
          organization_name: 'Google Workspace'
        });
      }
    } catch (dbErr) {
      console.warn('Failed to ensure user existence in DB:', dbErr.message);
    }

    next();
  });
};

// Guard route by checking user roles
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { role } = req.user;
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ 
        error: `Insufficient permissions. Access requires one of: ${allowedRoles.join(', ')}` 
      });
    }
    next();
  };
};
