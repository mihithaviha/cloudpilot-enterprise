import express from 'express';
import { db } from '../models/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users - List all users in company (Admin and HR only)
router.get('/', authenticateToken, requireRole(['Admin', 'HR']), (req, res) => {
  const users = db.get('users');
  // Strip password hash from result list
  const sanitized = users.map(({ password, ...rest }) => rest);
  res.json(sanitized);
});

// PATCH /api/users/:id/role - Update user role (Admin only)
router.patch('/:id/role', authenticateToken, requireRole(['Admin']), (req, res) => {
  const { role } = req.body;
  const validRoles = ['Admin', 'HR', 'Employee', 'Finance', 'Manager'];
  
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ error: `Invalid role parameter. Must be one of: ${validRoles.join(', ')}` });
  }

  const updated = db.update('users', u => u.id === req.params.id, { role });
  if (updated === 0) {
    return res.status(404).json({ error: 'User profile not found.' });
  }

  // Audit log
  db.insert('audit_logs', {
    user_id: req.user.id,
    action: 'USER_ROLE_UPDATE',
    target_type: 'user',
    target_id: req.params.id,
    details: { updatedRole: role },
    ip_address: req.ip
  });

  res.json({ message: 'User role updated successfully.', userId: req.params.id, role });
});

// GET /api/users/audits - List all security audit logs (Admin only)
router.get('/audits', authenticateToken, requireRole(['Admin']), (req, res) => {
  const audits = db.get('audit_logs');
  // Sort descending
  audits.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  // Enrich with user email details
  const enriched = audits.map(log => {
    const user = db.findOne('users', u => u.id === log.user_id);
    return {
      ...log,
      user_email: user ? user.email : 'system'
    };
  });
  
  res.json(enriched);
});

export default router;
