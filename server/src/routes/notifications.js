import express from 'express';
import { db } from '../models/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/notifications - Get all user notifications
router.get('/', authenticateToken, (req, res) => {
  const list = db.find('notifications', n => n.user_id === req.user.id);
  // Sort descending
  list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(list);
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch('/:id/read', authenticateToken, (req, res) => {
  const updated = db.update('notifications', n => n.id === req.params.id && n.user_id === req.user.id, {
    is_read: true
  });
  
  if (updated === 0) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  
  res.json({ message: 'Notification marked as read' });
});

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', authenticateToken, (req, res) => {
  const deleted = db.delete('notifications', n => n.id === req.params.id && n.user_id === req.user.id);
  if (deleted === 0) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  res.json({ message: 'Notification dismissed' });
});

export default router;
