import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../models/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'cloudpilot_secret_token_12345';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, role, organizationName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    // Check if user already exists
    const existing = db.findOne('users', u => u.email === email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save profile record
    const userRole = role || 'Employee';
    const newUser = db.insert('users', {
      email,
      password: hashedPassword,
      full_name: fullName,
      role: userRole,
      avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fullName)}`,
      organization_name: organizationName || 'Acme Corp'
    });

    // Sign JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, fullName: newUser.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Log in audit log
    db.insert('audit_logs', {
      user_id: newUser.id,
      action: 'USER_REGISTER',
      target_type: 'user',
      target_id: newUser.id,
      details: { email: newUser.email },
      ip_address: req.ip
    });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        avatar_url: newUser.avatar_url,
        organization_name: newUser.organization_name
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.findOne('users', u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify Password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, fullName: user.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Audit Log
    db.insert('audit_logs', {
      user_id: user.id,
      action: 'USER_LOGIN',
      target_type: 'user',
      target_id: user.id,
      details: { success: true },
      ip_address: req.ip
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        avatar_url: user.avatar_url,
        organization_name: user.organization_name
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  const user = db.findOne('users', u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User profile not found.' });
  }

  res.json({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    avatar_url: user.avatar_url,
    organization_name: user.organization_name
  });
});

export default router;
